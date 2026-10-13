import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add JWT Token to headers if present (Handles all storage key formats)
API.interceptors.request.use(
  (config) => {
    let token =
      localStorage.getItem("token") ||
      localStorage.getItem("userToken") ||
      localStorage.getItem("authToken");

    // Fallback: Check if stored inside 'userInfo' JSON object
    if (!token) {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        try {
          const parsedUser = JSON.parse(userInfoStr);
          token = parsedUser?.token || parsedUser?.data?.token;
        } catch (err) {
          console.error("Error parsing userInfo from localStorage:", err);
        }
      }
    }

    // Clean extra quotes if token was JSON.stringified by mistake
    if (token) {
      token = token.replace(/^"(.*)"$/, "$1");
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor to catch 401 Unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or token invalid. Consider re-logging in.");
    }
    return Promise.reject(error);
  }
);

// Auth Helper Functions
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const getProfile = () => API.get("/auth/profile");

// Doctor Helper Functions
export const getDoctors = (params) => API.get("/doctors", { params });
export const getDoctor = (id) => API.get(`/doctors/${id}`);

// Appointment Helper Functions
export const bookAppointment = (appointmentData) => API.post("/appointments", appointmentData);
export const getMyAppointments = () => API.get("/appointments/my-appointments");
export const cancelAppointment = (id) => API.put(`/appointments/${id}/cancel`);

export default API;