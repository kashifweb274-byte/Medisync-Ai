const express = require("express");
const {
  bookAppointment,
  getAvailableSlots,
  getDoctorAppointments,
  getDoctorStats,
  updateAppointmentStatus,
  getPatientAppointments,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

// ======================================
// Shared & Patient Fetch / Booking Routes
// ======================================
router.get("/", getPatientAppointments);
router.post("/", bookAppointment);
router.post("/book", bookAppointment);
router.get("/slots/:doctorId", getAvailableSlots);
router.get("/patient", getPatientAppointments);

// ======================================
// Cancel Appointment Routes (Supports all HTTP methods & patterns)
// ======================================
router.put("/:id/cancel", cancelAppointment);
router.patch("/:id/cancel", cancelAppointment);
router.post("/:id/cancel", cancelAppointment);
router.put("/cancel/:id", cancelAppointment);
router.patch("/cancel/:id", cancelAppointment);
router.delete("/:id", cancelAppointment);

// ======================================
// Doctor Routes
// ======================================
router.get("/doctor", getDoctorAppointments);
router.get("/doctor/stats", getDoctorStats);
router.put("/:id/status", updateAppointmentStatus);
router.patch("/:id/status", updateAppointmentStatus);

module.exports = router;