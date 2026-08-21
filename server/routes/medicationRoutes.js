const express = require("express");
const router = express.Router();

const {
  getMedications,
  createMedication,
  toggleMedicationStatus,
  deleteMedication,
} = require("../controllers/medicationController");

const { protect } = require("../middleware/authMiddleware");

// All routes are protected by auth middleware
router.get("/", protect, getMedications);
router.post("/", protect, createMedication);
router.patch("/:id/toggle", protect, toggleMedicationStatus);
router.delete("/:id", protect, deleteMedication);

module.exports = router;