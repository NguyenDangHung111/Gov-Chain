import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 20000
});

export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const registerUser = (userData) => api.post("/auth/register", userData);
