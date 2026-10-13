const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Load .env explicitly from root directory

require("dotenv").config({ path: path.join(__dirname, ".env") });
// Route Imports
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const insightRoutes = require("./routes/insightRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const { checkGeminiConnection, GEMINI_MODEL } = require("./services/geminiService");

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.get("/api/health/gemini", async (_req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ success: false, configured: false, model: GEMINI_MODEL, message: "GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to the backend .env file." });
    }
    try {
      return res.json({ success: true, ...await checkGeminiConnection(), message: "Gemini API connection: OK" });
    } catch (error) {
      console.error(`Gemini health check failed. Status: ${error.status || error.statusCode || "unknown"}. Error: ${error.name || "GeminiError"}.`);
      return res.status(503).json({ success: false, configured: true, model: GEMINI_MODEL, message: "Gemini API connection failed. Check the backend model and API key configuration." });
    }
  });
}

// CORS Configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediSync AI Healthcare Backend is running successfully 🚀",
  });
});

app.get("/api/auth/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route is working 🚀",
  });
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Doctor Routes with Middleware Logging
app.use(
  "/api/doctors",
  (req, res, next) => {
    console.log(`[DOCTOR ROUTE]: ${req.method} ${req.path}`);
    next();
  },
  doctorRoutes
);

// 404 & Global Error Handlers
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Database Connection & Server Listen
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medisync";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("Gemini SDK: @google/genai");
    console.log(`Gemini Model: ${GEMINI_MODEL}`);
    console.log(`Gemini API Key: ${process.env.GEMINI_API_KEY ? "configured" : "not configured"}`);
    if (!process.env.GEMINI_API_KEY) console.error("GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to the backend .env file.");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Healthcare Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  });
