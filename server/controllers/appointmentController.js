const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Supports both 24-hr ("09:30") & 12-hr ("09:30 AM") formats
const validTimeSlot = (value) => {
  if (!value) return false;
  return /^([0-1]?\d|2[0-3]):[0-5]\d(\s?[AP]M)?$/i.test(String(value).trim());
};

const displayName = (name) => {
  const value = String(name || "").trim();
  if (!value) return "Dr. Medical Specialist";
  return /^dr\.?\s/i.test(value) ? value : `Dr. ${value}`;
};

// Handles ObjectIds, User IDs, Doctor objects, and Doctor Name strings
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

  // 1. Search by Doctor _id or User _id
  if (searchId && validObjectId(searchId)) {
    doctor = await Doctor.findById(searchId).populate("userId", "name email phone profileImage role").lean();
    if (!doctor) {
      doctor = await Doctor.findOne({ userId: searchId }).populate("userId", "name email phone profileImage role").lean();
    }
  }

  // 2. Fallback: Search by Doctor Name
  if (!doctor) {
    const nameToSearch = searchName || (typeof rawInput === "string" ? rawInput : "");
    const cleanName = nameToSearch
      .replace(/^dr\.?\s*/i, "")
      .replace(/\s*\(.*\)/, "")
      .trim();

    if (cleanName) {
      const doctorUser = await User.findOne({ name: new RegExp(cleanName, "i") }).lean();
      if (doctorUser) {
        doctor = await Doctor.findOne({ userId: doctorUser._id }).populate("userId", "name email phone profileImage role").lean();
      }
      if (!doctor) {
        doctor = await Doctor.findOne({ name: new RegExp(cleanName, "i") }).populate("userId", "name email phone profileImage role").lean();
      }
    }
  }

  // 3. Absolute Fallback: Pick first doctor in DB if matching fails completely
  if (!doctor) {
    doctor = await Doctor.findOne().populate("userId", "name email phone profileImage role").lean();
  }

  return doctor;
};

const appointmentView = async (appointment) => {
  const item = typeof appointment.toObject === "function" ? appointment.toObject() : { ...appointment };
  let doctor = null;
  let doctorUser = null;
  const rawDoctorId = item.doctorId?._id || item.doctorId;

  if (rawDoctorId) {
    doctor = await resolveDoctor(rawDoctorId);
    if (!doctor && validObjectId(rawDoctorId)) {
      doctorUser = await User.findById(rawDoctorId).select("name email phone profileImage").lean();
    }
  }

  const name = displayName(item.doctorName || doctor?.userId?.name || doctor?.name || doctorUser?.name);
  const specialty = item.specialty || doctor?.specialty || "General Practitioner";
  const profileImage = item.doctorProfileImage || doctor?.userId?.profileImage || doctorUser?.profileImage || "";
  const doctorProfileId = doctor?._id || rawDoctorId || null;

  return {
    ...item,
    id: String(item._id),
    doctorName: name,
    specialty,
    doctorProfileImage: profileImage,
    doctorId: {
      _id: doctorProfileId,
      id: doctorProfileId,
      userId: doctor?.userId?._id || doctorUser?._id || null,
      name,
      specialty,
      profileImage,
      location: doctor?.location || "",
    },
  };
};

const appointmentViews = (appointments) => Promise.all(appointments.map(appointmentView));

const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user?._id || req.user?.id || req.user?.userId || req.body.patientId;
    if (!patientId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Patient session missing. Please login again." });
    }

    const { doctorId, doctor, doctor_id, date, timeSlot, slot, reason, symptoms, mode, consultationMode } = req.body;

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

    const doctorDoc = await resolveDoctor(targetDoctor);
    if (!doctorDoc) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const doctorName = displayName(doctorDoc.userId?.name || doctorDoc.name);

    const appointment = await Appointment.create({
      patientId,
      doctorId: doctorDoc._id,
      doctorModel: "Doctor",
      doctorName,
      specialty: doctorDoc.specialty || "General Practitioner",
      doctorProfileImage: doctorDoc.userId?.profileImage || doctorDoc.profileImage || "",
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
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ success: false, message: "Doctor ID and date are required" });
    }

    const doctor = await resolveDoctor(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const queryDate = new Date(date);
    if (Number.isNaN(queryDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[queryDate.getDay()];

    const schedule = doctor.weeklyHours?.find((h) => h.day === dayName);

    if (!schedule || schedule.isAvailable === false) {
      return res.status(200).json({ success: true, availableSlots: [] });
    }

    const slots = [];
    let [startHour, startMin] = schedule.startTime.split(":").map(Number);
    let [endHour, endMin] = schedule.endTime.split(":").map(Number);

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + 30 <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, "0");
      const m = (current % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      current += 30;
    }

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    }).select("timeSlot").lean();

    const bookedSlots = new Set(existingAppointments.map((a) => a.timeSlot));
    const availableSlots = slots.filter((slot) => !bookedSlots.has(slot));

    return res.status(200).json({ success: true, availableSlots });
  } catch (error) {
    console.error("Get Available Slots Error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch slots" });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user?._id || req.user?.id || req.user?.userId;
    const appointments = await Appointment.find({ patientId }).sort({ date: -1, timeSlot: 1 }).lean();
    return res.status(200).json({ success: true, appointments: await appointmentViews(appointments) });
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
    console.error("Get Doctor Appointments Error:", error);
    return res.status(200).json({ success: true, appointments: [] });
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const doctor = await Doctor.findOne({ userId }).select("_id").lean();
    const doctorIds = [userId];
    if (doctor?._id) doctorIds.push(doctor._id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } }).lean();

    const todayAppointments = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= todayStart && d <= todayEnd && a.status !== "cancelled";
    }).length;

    const pendingRequests = appointments.filter((a) => a.status === "pending").length;
    const totalAppointments = appointments.filter((a) => a.status !== "cancelled").length;

    return res.status(200).json({
      success: true,
      stats: {
        todayAppointments,
        pendingRequests,
        totalAppointments,
      },
    });
  } catch (error) {
    console.error("Get Doctor Stats Error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch stats" });
  }
};

const appointmentBelongsToDoctor = async (appointment, userId) => {
  const doctor = await Doctor.findOne({ userId }).select("_id").lean();
  return String(appointment.doctorId) === String(userId) || String(appointment.doctorId) === String(doctor?._id);
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid appointment status" });
    }
    const userId = req.user?._id || req.user?.id || req.user?.userId;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (!(await appointmentBelongsToDoctor(appointment, userId))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    appointment.status = status;
    await appointment.save();
    return res.status(200).json({ success: true, message: "Appointment status updated", appointment: await appointmentView(appointment) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update appointment" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const patientId = req.user?._id || req.user?.id || req.user?.userId;
    const appointment = await Appointment.findOne({ _id: req.params.id, patientId });
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    appointment.status = "cancelled";
    await appointment.save();
    return res.status(200).json({ success: true, message: "Appointment cancelled", appointment: await appointmentView(appointment) });
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