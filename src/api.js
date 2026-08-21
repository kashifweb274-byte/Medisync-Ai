import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add JWT Token to headers if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Helper Functions
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (credentials) => API.post("/auth/login", credentials);

// Doctor Helper Functions
export const getDoctors = (params) => API.get("/doctors", { params });
export const getDoctor = (id) => API.get(`/doctors/${id}`);

export default API;