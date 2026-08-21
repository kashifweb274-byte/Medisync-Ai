const express = require("express");
const router = express.Router();
const { getPatientInsights, getDoctorRiskAlerts } = require("../controllers/insightController");
const { protect } = require("../middleware/authMiddleware"); // Apne Auth Middleware ka correct path dein

// Patient Health Insights Route
router.get("/patient", protect, getPatientInsights);

// Doctor Risk Alerts Route
router.get("/doctor-alerts", protect, getDoctorRiskAlerts);

module.exports = router;