import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_PUBLIC_BACKEND_URL,
});

export default api;
