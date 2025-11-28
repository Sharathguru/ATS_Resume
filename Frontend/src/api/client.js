import axios from "axios";

const api = axios.create({
   baseURL: "https://ats-resume-scanner-lmry.onrender.com/api",    
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("ats-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

