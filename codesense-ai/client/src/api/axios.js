import axios from "axios";

let rawURL = import.meta.env.VITE_API_URL || "";
if (rawURL && !rawURL.startsWith("http://") && !rawURL.startsWith("https://")) {
  rawURL = `https://${rawURL}`;
}

const baseURL = rawURL ? `${rawURL.replace(/\/$/, "")}/api` : "/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("codesense_token") || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

