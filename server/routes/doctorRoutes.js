const express = require("express");
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  updateSchedule,
  getDoctorSchedule,
  getDoctorAlerts,
  getDoctorPatients,
  seedDoctors,
} = require("../controllers/doctorController");
const { protect, isDoctor } = require("../middleware/authMiddleware");

// 1. Public routes
router.get("/", getAllDoctors);

// 2. Protected Doctor Routes (Alerts, Patients, Schedule)
router.get("/alerts", protect, isDoctor, getDoctorAlerts);
router.get("/patients", protect, isDoctor, getDoctorPatients);
router.get("/schedule", protect, isDoctor, getDoctorSchedule);
router.post("/schedule", protect, isDoctor, updateSchedule);
router.put("/schedule", protect, isDoctor, updateSchedule); // Added PUT support for flexible frontend requests

// 3. Dev-only seeding endpoint
router.post("/seed", seedDoctors);

// 4. Dynamic ID route (HAMESHA BAKI SPECIFIC ROUTES KE NEECHE RAKHEIN)
router.get("/:id", getDoctorById);

module.exports = router;