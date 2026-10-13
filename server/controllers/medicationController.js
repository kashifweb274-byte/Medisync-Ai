const mongoose = require("mongoose");
const Medication = require("../models/Medication");
const User = require("../models/User");

// Helper: YYYY-MM-DD Date Formatter
const toDayString = (date = new Date()) => {
  try {
    return new Date(date).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

// Helper: Extract safe patient ID variants (handles demo strings & ObjectIds)
const getPatientIdVariants = async (req) => {
  const rawUserId =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.user ||
    req.params?.patientId ||
    req.query?.patientId ||
    "demo1";

  const userIdStr = String(rawUserId);
  const idVariants = [userIdStr];

  if (mongoose.Types.ObjectId.isValid(userIdStr)) {
    idVariants.push(new mongoose.Types.ObjectId(userIdStr));
  } else {
    // Fallback lookup for demo user to match any linked database records
    const fallbackUser = await User.findOne({
      $or: [{ email: "patient@example.com" }, { role: "patient" }],
    })
      .select("_id")
      .lean();

    if (fallbackUser?._id) {
      idVariants.push(fallbackUser._id);
      idVariants.push(String(fallbackUser._id));
    }
  }

  return { primaryId: rawUserId, idVariants };
};

// GET /api/medications - Get all medications for logged-in patient
const getMedications = async (req, res) => {
  try {
    const { idVariants } = await getPatientIdVariants(req);

    const medications = await Medication.find({
      $or: [
        { patientId: { $in: idVariants } },
        { patient: { $in: idVariants } },
        { userId: { $in: idVariants } },
        { user: { $in: idVariants } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      medications: medications || [],
    });
  } catch (error) {
    console.error("Get Medications Error:", error);
    return res.status(200).json({
      success: true,
      medications: [],
    });
  }
};

// POST /api/medications - Create new medication
const createMedication = async (req, res) => {
  try {
    const { primaryId } = await getPatientIdVariants(req);
    const { name, dosage, frequency, time, startDate, endDate, instructions } = req.body;

    if (!name || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        message: "Name, dosage, and frequency are required",
      });
    }

    const newMedication = await Medication.create({
      patientId: primaryId,
      name: String(name).trim(),
      dosage: String(dosage).trim(),
      frequency: String(frequency).trim(),
      time: time || "09:00 AM",
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      instructions: instructions || "",
      taken: false,
      logs: [],
    });

    return res.status(201).json({
      success: true,
      medication: newMedication,
    });
  } catch (error) {
    console.error("Create Medication Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create medication",
    });
  }
};

// PATCH /api/medications/:id/toggle - Toggle taken status and record adherence log
const toggleMedicationStatus = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    const todayStr = toDayString(new Date());
    medication.taken = !medication.taken;

    if (!Array.isArray(medication.logs)) {
      medication.logs = [];
    }

    if (medication.taken) {
      const alreadyLogged = medication.logs.some(
        (log) => toDayString(log.date) === todayStr
      );
      if (!alreadyLogged) {
        medication.logs.push({ date: new Date(), status: "taken" });
      }
    } else {
      medication.logs = medication.logs.filter(
        (log) => toDayString(log.date) !== todayStr
      );
    }

    await medication.save();
    return res.status(200).json({
      success: true,
      medication,
    });
  } catch (error) {
    console.error("Toggle Medication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update medication status",
    });
  }
};

// DELETE /api/medications/:id - Delete medication
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medication deleted successfully",
    });
  } catch (error) {
    console.error("Delete Medication Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete medication",
    });
  }
};

module.exports = {
  getMedications,
  createMedication,
  toggleMedicationStatus,
  deleteMedication,
  addMedication: createMedication,
  toggleMedication: toggleMedicationStatus,
};