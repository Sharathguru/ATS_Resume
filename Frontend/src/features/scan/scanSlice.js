import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/client";
import { loadHistory, saveHistory } from "../../utils/historyStorage";
import { logout } from "../auth/authSlice";

const initialHistory = loadHistory();

const buildHistoryEntry = (payload) => ({
  ...payload,
  createdAt: payload.createdAt || new Date().toISOString(),
});

export const submitScan = createAsyncThunk(
  "scan/submit",
  async ({ file, jobDescription }, thunkAPI) => {
    const token = thunkAPI.getState().auth?.token;
    if (!token) {
      return thunkAPI.rejectWithValue("Please log in to run a scan.");
    }
    try {
      console.info("[SCAN] submitting request", {
        fileName: file?.name,
        jobDescriptionLength: jobDescription?.length,
      });
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await api.post("/scan/match", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const payload = response?.data?.data;

      if (!payload) {
        throw new Error("Backend response missing data");
      }

      console.info("[SCAN] backend response received", {
        scanId: payload.scanId,
        score: payload.score,
      });

      return buildHistoryEntry({
        ...payload,
        originalFileName: file.name,
        jobDescription,
      });
    } catch (error) {
      console.error("[SCAN] request failed", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while scanning the resume.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const scanSlice = createSlice({
  name: "scan",
  initialState: {
    currentScan: initialHistory[0] || null,
    history: initialHistory,
    status: "idle",
    error: null,
    resetView: false,
  },
  reducers: {
    showHistoryScan: (state, action) => {
      const existing = state.history.find((item) => item.scanId === action.payload);
      if (existing) {
        state.currentScan = existing;
        state.error = null;
        state.resetView = false;
      }
    },
    clearHistory: (state) => {
      state.history = [];
      state.currentScan = null;
      saveHistory([]);
    },
    dismissError: (state) => {
      state.error = null;
    },
    resetScanView: (state) => {
      state.currentScan = null;
      state.error = null;
      state.status = "idle";
      state.resetView = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitScan.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.resetView = false;
      })
      .addCase(submitScan.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentScan = action.payload;
        const withoutDuplicate = state.history.filter(
          (scan) => scan.scanId !== action.payload.scanId
        );
        state.history = [action.payload, ...withoutDuplicate].slice(0, 8);
        saveHistory(state.history);
        state.resetView = false;
      })
      .addCase(submitScan.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unable to complete the scan.";
      })
      .addCase(logout, (state) => {
        state.currentScan = null;
        state.history = [];
        state.status = "idle";
        state.error = null;
        saveHistory([]);
        state.resetView = false;
      });
  },
});

export const { showHistoryScan, clearHistory, dismissError, resetScanView } = scanSlice.actions;

export const selectScanState = (state) => state.scan;
export const selectCurrentScan = (state) => state.scan.currentScan;
export const selectHistory = (state) => state.scan.history;
export const selectStatus = (state) => state.scan.status;
export const selectError = (state) => state.scan.error;
export const selectResetView = (state) => state.scan.resetView;

export default scanSlice.reducer;

