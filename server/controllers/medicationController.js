const Medication = require("../models/Medication");

// Helper: YYYY-MM-DD Date Formatter
const toDayString = (date = new Date()) => {
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

// GET /api/medications - Get all active medications for logged-in patient
const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ patientId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, medications });
  } catch (error) {
    console.error("Get Medications Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch medications" });
  }
};

// POST /api/medications - Create new medication
const createMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, time, startDate, endDate } = req.body;

    if (!name || !dosage || !frequency) {
      return res.status(400).json({ success: false, message: "Name, dosage, and frequency are required" });
    }

    const newMedication = await Medication.create({
      patientId: req.user._id,
      name,
      dosage,
      frequency,
      time: time || "09:00 AM",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      taken: false,
      logs: [],
    });

    return res.status(201).json({ success: true, medication: newMedication });
  } catch (error) {
    console.error("Create Medication Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create medication" });
  }
};

// PATCH /api/medications/:id/toggle - Toggle taken status and record adherence log
const toggleMedicationStatus = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }

    const todayStr = toDayString(new Date());
    medication.taken = !medication.taken;

    if (medication.taken) {
      // Add log for today if it doesn't exist
      const alreadyLogged = medication.logs.some(
        (log) => toDayString(log.date) === todayStr
      );
      if (!alreadyLogged) {
        medication.logs.push({ date: new Date(), status: "taken" });
      }
    } else {
      // Remove today's log if unmarked
      medication.logs = medication.logs.filter(
        (log) => toDayString(log.date) !== todayStr
      );
    }

    await medication.save();
    return res.status(200).json({ success: true, medication });
  } catch (error) {
    console.error("Toggle Medication Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update medication status" });
  }
};

// DELETE /api/medications/:id - Delete medication
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!medication) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }

    return res.status(200).json({ success: true, message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Delete Medication Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete medication" });
  }
};

module.exports = {
  getMedications,
  createMedication,
  toggleMedicationStatus,
  deleteMedication,
  // Aliases for compatibility with different route naming
  addMedication: createMedication,
  toggleMedication: toggleMedicationStatus,
};