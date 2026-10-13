const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""));

const validTimeSlot = (value) => {
  if (!value) return false;
  return /^([0-1]?\d|2[0-3]):[0-5]\d(\s?[AP]M)?$/i.test(String(value).trim());
};

const displayName = (name) => {
  const value = String(name || "").trim();
  if (!value) return "Dr. Specialist";
  return /^dr\.?\s/i.test(value) ? value : `Dr. ${value}`;
};

// Database doctor lookup without forced fallback to Dr. Faisal
const resolveDoctor = async (rawInput) => {
  if (!rawInput) return null;

  let searchId = null;
  let searchName = null;

  if (typeof rawInput === "object") {
    searchId = rawInput._id || rawInput.id || rawInput.doctorId || rawInput.userId;
    searchName = rawInput.name || rawInput.doctorName;
  } else if (typeof rawInput === "string") {
    if (validObjectId(rawInput)) {
      searchId = rawInput;
    } else {
      searchName = rawInput;
    }
  }

  let doctor = null;

  // 1. Search by ObjectId
  if (searchId && validObjectId(searchId)) {
    doctor = await Doctor.findById(searchId).populate("userId", "name email phone profileImage role").lean();
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: searchId }).populate("userId", "name email phone profileImage role").lean();
    }
  }

  // 2. Search strictly by Doctor Name
  if (!doctor && searchName) {
    const cleanName = String(searchName)
      .replace(/^dr\.?\s*/i, "")
      .replace(/\s*\(.*\)/, "")
      .trim();

    if (cleanName) {
      const doctorUser = await User.findOne({ name: new RegExp(`^${cleanName}$`, "i") }).lean();
      if (doctorUser) {
        doctor = await Doctor.findOne({ userId: doctorUser._id }).populate("userId", "name email phone profileImage role").lean();
      }
      if (!doctor) {
        doctor = await Doctor.findOne({ name: new RegExp(`^${cleanName}$`, "i") }).populate("userId", "name email phone profileImage role").lean();
      }
    }
  }

  return doctor;
};

const appointmentView = async (appointment) => {
  const item = typeof appointment.toObject === "function" ? appointment.toObject() : { ...appointment };
  
  // Hamesha booked appointment ka actual saved name dikhayega
  const name = displayName(item.doctorName || "Medical Specialist");
  const specialty = item.specialty || "General Physician";
  const profileImage = item.doctorProfileImage || "";
  const doctorProfileId = item.doctorId || null;

  return {
    ...item,
    id: String(item._id),
    doctorName: name,
    specialty,
    doctorProfileImage: profileImage,
    doctorId: {
      _id: doctorProfileId,
      id: doctorProfileId,
      name,
      specialty,
      profileImage,
    },
  };
};

const appointmentViews = (appointments) => Promise.all(appointments.map(appointmentView));

const bookAppointment = async (req, res) => {
  try {
    const rawPatientId = req.user?._id || req.user?.id || req.user?.userId || req.body?.patientId;
    if (!rawPatientId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Patient session missing." });
    }

    let patientId;
    if (validObjectId(rawPatientId)) {
      patientId = new mongoose.Types.ObjectId(String(rawPatientId));
    } else {
      const fallbackUser = await User.findOne({
        $or: [{ email: "patient@example.com" }, { role: "patient" }]
      }).select("_id").lean();
      patientId = fallbackUser?._id || new mongoose.Types.ObjectId();
    }

    const {
      doctorId,
      doctor,
      doctor_id,
      doctorName: rawDocName,
      specialty: rawSpecialty,
      specialization: rawSpecialization,
      doctorProfileImage: rawDocImage,
      date,
      timeSlot,
      slot,
      reason,
      symptoms,
      mode,
      consultationMode
    } = req.body;

    const targetDoctor = doctorId || doctor || doctor_id;
    const targetSlot = timeSlot || slot;
    const targetMode = mode || consultationMode;

    if (!targetDoctor || !date || !targetSlot) {
      return res.status(400).json({ success: false, message: "Doctor, date, and time slot are required" });
    }

    if (!validTimeSlot(targetSlot)) {
      return res.status(400).json({ success: false, message: "Time slot format is invalid" });
    }

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid appointment date" });
    }

    // Actual selected doctor ka data prioritize karein
    let finalDoctorName = rawDocName;
    let finalSpecialty = rawSpecialty || rawSpecialization;
    let finalProfileImage = rawDocImage || "";
    let finalDoctorId = validObjectId(targetDoctor) ? targetDoctor : new mongoose.Types.ObjectId();

    const doctorDoc = await resolveDoctor(targetDoctor);
    if (doctorDoc) {
      finalDoctorName = doctorDoc.userId?.name || doctorDoc.name || finalDoctorName;
      finalSpecialty = doctorDoc.specialty || finalSpecialty;
      finalProfileImage = doctorDoc.userId?.profileImage || doctorDoc.profileImage || finalProfileImage;
      finalDoctorId = doctorDoc._id;
    } else if (!finalDoctorName && typeof targetDoctor === "string") {
      finalDoctorName = targetDoctor.replace(/\s*\(.*?\)/, "").trim();
    }

    finalDoctorName = displayName(finalDoctorName || "Medical Specialist");
    finalSpecialty = finalSpecialty || "General Physician";

    const appointment = await Appointment.create({
      patientId,
      doctorId: finalDoctorId,
      doctorModel: "Doctor",
      doctorName: finalDoctorName,
      specialty: finalSpecialty,
      doctorProfileImage: finalProfileImage,
      date: appointmentDate,
      timeSlot: String(targetSlot).trim(),
      mode: targetMode === "inperson" || targetMode === "In Person" ? "inperson" : "video",
      reason: String(reason || symptoms || "").trim(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: await appointmentView(appointment),
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to book appointment" });
  }
};

const getAvailableSlots = async (req, res) => {
  return res.status(200).json({
    success: true,
    availableSlots: ["09:30 AM", "11:00 AM", "02:00 PM", "04:30 PM", "06:00 PM"]
  });
};

const getPatientAppointments = async (req, res) => {
  try {
    const rawUserId = req.user?._id || req.user?.id || req.user?.userId;
    const userIdStr = String(rawUserId || "");

    const idVariants = [userIdStr];
    if (validObjectId(userIdStr)) {
      idVariants.push(new mongoose.Types.ObjectId(userIdStr));
    } else {
      const fallbackUser = await User.findOne({
        $or: [{ email: "patient@example.com" }, { role: "patient" }]
      }).select("_id").lean();
      if (fallbackUser?._id) {
        idVariants.push(fallbackUser._id);
      }
    }

    const appointments = await Appointment.find({
      $or: [
        { patientId: { $in: idVariants } },
        { patient: { $in: idVariants } },
        { userId: { $in: idVariants } }
      ]
    }).sort({ date: -1, timeSlot: 1 }).lean();

    return res.status(200).json({ 
      success: true, 
      appointments: await appointmentViews(appointments) 
    });
  } catch (error) {
    console.error("Get Patient Appointments Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load appointments" });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const doctor = await Doctor.findOne({ userId }).select("_id").lean();
    const doctorIds = [userId];
    if (doctor?._id) doctorIds.push(doctor._id);

    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } })
      .populate("patientId", "name email phone profileImage")
      .sort({ date: 1, timeSlot: 1 })
      .lean();
    return res.status(200).json({ success: true, appointments: await appointmentViews(appointments) });
  } catch (error) {
    return res.status(200).json({ success: true, appointments: [] });
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const doctor = await Doctor.findOne({ userId }).select("_id").lean();
    const doctorIds = [userId];
    if (doctor?._id) doctorIds.push(doctor._id);

    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } }).lean();
    const pendingRequests = appointments.filter((a) => String(a.status || "").toLowerCase() === "pending").length;
    const totalAppointments = appointments.filter((a) => String(a.status || "").toLowerCase() !== "cancelled").length;

    return res.status(200).json({
      success: true,
      stats: {
        todayAppointments: 0,
        pendingRequests,
        totalAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to fetch stats" });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const normalizedStatus = String(status || "").toLowerCase();
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    
    appointment.status = normalizedStatus;
    await appointment.save();
    return res.status(200).json({ success: true, message: "Status updated", appointment: await appointmentView(appointment) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update appointment" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    if (!validObjectId(appointmentId)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: await appointmentView(appointment),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to cancel appointment" });
  }
};

module.exports = {
  bookAppointment,
  getAvailableSlots,
  getPatientAppointments,
  getDoctorAppointments,
  getDoctorStats,
  updateAppointmentStatus,
  cancelAppointment,
};