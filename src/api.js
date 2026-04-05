import axios from "axios";

// Resolve API base from Vite env or fallback to localhost for dev
const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) || "http://localhost:5000";
const baseURL = API_BASE.replace(/\/$/, "");

const api = axios.create({
  baseURL,
  timeout: 30000, // 30s timeout
  headers: {
    // Let the browser set Content-Type for FormData
    Accept: "application/json, image/png, image/*;q=0.8, */*;q=0.5",
  },
});

// Response interceptor to centralize error shapes if needed
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    // Normalize network errors
    if (error.request && !error.response) {
      error.message =
        "Unable to reach API server. Check your network or API URL.";
    }
    return Promise.reject(error);
  },
);

export default api;
