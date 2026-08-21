const express = require("express");
const { protect, isDoctor, isPatient } = require("../middleware/authMiddleware");
const { getPatientInsights, getDoctorRiskAlerts } = require("../controllers/insightController");

const router = express.Router();

// Protect all insight routes
router.use(protect);

router.get("/patient", isPatient, getPatientInsights);
router.get("/doctor/alerts", isDoctor, getDoctorRiskAlerts);

module.exports = router;