import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 20000
});

export const submitCase = (payload) => api.post("/cases", payload);
export const getCase = (id) => api.get(`/cases/${id}`);
export const getCasesByCitizen = (citizenId) => api.get(`/cases?citizenId=${citizenId}`);
export const getAllCases = () => api.get("/cases/all");
export const getCaseLogs = (id) => api.get(`/cases/${id}/logs`);
export const updateStatus = (id, payload) => api.put(`/cases/${id}/status`, payload);
