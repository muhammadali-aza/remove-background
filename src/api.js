import axios from "axios";

// Prefer VITE_API_URL when provided (production). Use localhost only when
// the app is actually running on localhost (development).
const envUrl =
  import.meta.env && import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).trim()
    : "";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

let baseURL;
if (envUrl) {
  baseURL = envUrl.replace(/\/$/, "");
} else if (isLocalhost) {
  baseURL = "http://localhost:5000";
} else {
  // In production without VITE_API_URL set, do not silently fallback to localhost.
  // Requests will be made relative to the site origin, which is likely incorrect
  // for a separate backend; log a clear error for deploy-time debugging.
  baseURL = undefined;
  // eslint-disable-next-line no-console
  console.error(
    "VITE_API_URL is not set. Add VITE_API_URL in your Vercel environment variables so the frontend can reach the backend.",
  );
}

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: "application/json, image/png, image/*;q=0.8, */*;q=0.5",
  },
});

// Response interceptor to centralize and clarify network errors
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error.request && !error.response) {
      if (!baseURL) {
        error.message =
          "No API base URL configured (VITE_API_URL). Requests are being sent to the site origin. Set VITE_API_URL to your backend URL.";
      } else {
        error.message =
          "Unable to reach API server. Check network, CORS, or that the API URL is correct.";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
