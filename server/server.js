const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Route Imports
const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const medicationRoutes = require("./routes/medicationRoutes");
const insightRoutes = require("./routes/insightRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes"); // Added Prescription Route

const app = express();

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
app.use("/api/prescriptions", prescriptionRoutes); // Added Prescription Route

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
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Healthcare Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  });