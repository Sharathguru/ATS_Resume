import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/client";

const TOKEN_KEY = "ats-auth-token";
const USER_KEY = "ats-auth-user";

const loadInitialAuthState = () => {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const userRaw = window.localStorage.getItem(USER_KEY);
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const persistAuth = ({ token, user }) => {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Failed to persist auth data", error);
  }
};

const clearPersistedAuth = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, email, password, confirmPassword }, thunkAPI) => {
    try {
      const response = await api.post("/users/register", {
        username,
        email,
        password,
        confirmPassword,
      });
      return response?.data?.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Unable to create account right now.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await api.post("/users/login", { email, password });
      return response?.data?.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Invalid credentials, try again.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const { token: storedToken, user: storedUser } = loadInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser,
    token: storedToken,
    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      clearPersistedAuth();
    },
    dismissAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuth(action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        persistAuth(action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, dismissAuthError } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token && state.auth.user);

export default authSlice.reducer;

