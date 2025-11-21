import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import scanReducer from "../features/scan/scanSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scan: scanReducer,
  },
});

export default store;

