import axios from "axios";

const api = axios.create({
  baseURL: "https://gdg-backend-dx5f.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
