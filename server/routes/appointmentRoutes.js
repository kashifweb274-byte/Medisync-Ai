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
const { protect, isDoctor, isPatient } = require("../middleware/authMiddleware");

const router = express.Router();

// All appointment routes require authentication
router.use(protect);

// ======================================
// Patient Routes
// ======================================

// GET /api/appointments/slots/:doctorId - Patient gets available slots for selected doctor & date
router.get("/slots/:doctorId", isPatient, getAvailableSlots);

// POST /api/appointments/book - Patient books appointment
router.post("/book", isPatient, bookAppointment);

// GET /api/appointments/patient - Patient gets their appointments
router.get("/patient", isPatient, getPatientAppointments);

// DELETE /api/appointments/:id - Patient cancels their appointment
router.delete("/:id", isPatient, cancelAppointment);

// ======================================
// Doctor Routes
// ======================================

// GET /api/appointments/doctor - Doctor gets their own appointments
router.get("/doctor", isDoctor, getDoctorAppointments);

// GET /api/appointments/doctor/stats - Doctor gets their dashboard counters
router.get("/doctor/stats", isDoctor, getDoctorStats);

// PATCH /api/appointments/:id/status - Doctor updates appointment status
router.patch("/:id/status", isDoctor, updateAppointmentStatus);

module.exports = router;