import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_PUBLIC_BACKEND_URL || "http://localhost:8000",
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Ignore storage access errors
  }
  return config;
});

export default api;
