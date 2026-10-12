import axios from "axios";

const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl || undefined,
});

export default api;
