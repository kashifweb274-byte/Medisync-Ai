const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// Default profile for auto-seeding Dr. Faisal
const faisalProfile = {
  email: "faisal@gmail.com",
  password: "doctor123",
  name: "Dr. Faisal",
  role: "doctor",
  specialty: "General Physician / Cardiologist",
  experience: 10,
  rating: 4.8,
  reviews: 186,
  fee: 800,
  videoFee: 600,
  location: "MediSync Care Center",
  online: true,
  languages: ["English", "Hindi"],
  about: "General physician and cardiology-focused clinician providing both online and in-person consultations.",
  availability: [0, 1, 2, 3, 4, 5, 6],
};

// Ensure Dr. Faisal user and doctor profile exist in database
const ensureFaisalDoctor = async () => {
  let user = await User.findOne({ email: faisalProfile.email });
  if (!user) {
    user = await User.create({
      name: faisalProfile.name,
      email: faisalProfile.email,
      password: await bcrypt.hash(faisalProfile.password, 10),
      role: "doctor",
    });
  }

  const doctorFields = Object.fromEntries(
    Object.entries(faisalProfile).filter(
      ([key]) => !["email", "password", "name", "role"].includes(key)
    )
  );
  await Doctor.findOneAndUpdate(
    { userId: user._id },
    { $set: { userId: user._id, ...doctorFields } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const buildDoctorQuery = (query) => {
  const filter = {};
  const { specialty, mode, search } = query;

  if (specialty) filter.specialty = specialty;
  if (mode && mode !== "all") filter.online = mode === "online";
  if (search) {
    filter.$or = [
      { specialty: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { languages: { $regex: search, $options: "i" } },
    ];
  }
  return filter;
};

const buildSort = (sort) => {
  switch (sort) {
    case "price":
      return { fee: 1 };
    case "experience":
      return { experience: -1 };
    case "rating":
    default:
      return { rating: -1 };
  }
};

// GET /api/doctors - Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    await ensureFaisalDoctor();
    const filter = buildDoctorQuery(req.query);
    const sort = buildSort(req.query.sort);

    const doctors = await Doctor.find(filter)
      .populate("userId", "name email profileImage role online")
      .sort(sort)
      .lean();

    const transformed = doctors.map((d) => ({
      _id: d._id,
      userId: d.userId?._id || d.userId,
      id: d._id,
      name: d.userId?.name,
      email: d.userId?.email,
      profileImage: d.userId?.profileImage,
      specialty: d.specialty,
      experience: d.experience,
      rating: d.rating,
      reviews: d.reviews,
      fee: d.fee,
      videoFee: d.videoFee,
      location: d.location,
      languages: d.languages,
      about: d.about,
      online: d.online && d.userId?.online !== false,
      availability: d.availability,
      weeklyHours: d.weeklyHours || d.schedule || [],
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));

    const allSpecialties = await Doctor.find({}).distinct("specialty");

    res.status(200).json({
      success: true,
      message: "Doctors fetched successfully",
      doctors: transformed,
      specialties: allSpecialties.sort(),
    });
  } catch (error) {
    console.error("Get All Doctors Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching doctors",
    });
  }
};

// GET /api/doctors/schedule - Get Doctor Schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let doctor = await Doctor.findOne({ userId });

    if (!doctor) {
      doctor = await Doctor.findById(userId);
    }

    const defaultSchedule = [
      { day: "Mon", start: "09:00", end: "18:00", available: true },
      { day: "Tue", start: "09:00", end: "18:00", available: true },
      { day: "Wed", start: "09:00", end: "18:00", available: true },
      { day: "Thu", start: "09:00", end: "18:00", available: true },
      { day: "Fri", start: "09:00", end: "18:00", available: true },
      { day: "Sat", start: "09:00", end: "14:00", available: true },
      { day: "Sun", start: "09:00", end: "17:00", available: false },
    ];

    const scheduleData = doctor?.weeklyHours?.length
      ? doctor.weeklyHours
      : doctor?.schedule?.length
      ? doctor.schedule
      : defaultSchedule;

    res.status(200).json({
      success: true,
      schedule: scheduleData,
      weeklyHours: scheduleData,
      data: scheduleData,
    });
  } catch (error) {
    console.error("Get Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching schedule",
    });
  }
};

// POST / PUT /api/doctors/schedule - Save or Update Doctor Schedule
const updateSchedule = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { weeklyHours, schedule } = req.body;
    const hoursToSave = weeklyHours || schedule;

    if (!hoursToSave) {
      return res.status(400).json({
        success: false,
        message: "Schedule data is required",
      });
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId },
      { $set: { weeklyHours: hoursToSave, schedule: hoursToSave } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      weeklyHours: updatedDoctor.weeklyHours || updatedDoctor.schedule,
      schedule: updatedDoctor.schedule || updatedDoctor.weeklyHours,
    });
  } catch (error) {
    console.error("Update Schedule Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating schedule",
    });
  }
};

// GET /api/doctors/alerts - Get Health Risk Alerts
const getDoctorAlerts = async (req, res) => {
  try {
    const alerts = [
      {
        id: "alt_1",
        patientId: "p_101",
        patientName: "Sunita Rao",
        severity: "high",
        status: "new",
        title: "Blood Pressure Critically Elevated",
        detail: "Systolic 164 mmHg sustained across 3 readings. Medication adherence dropped to 47%.",
        time: "17 mins ago",
      },
      {
        id: "alt_2",
        patientId: "p_102",
        patientName: "Meera Nair",
        severity: "high",
        status: "new",
        title: "Fasting Glucose Threshold Breach",
        detail: "Fasting glucose 168 mg/dL (Above 126 mg/dL threshold for 2 consecutive weeks).",
        time: "2 hours ago",
      },
      {
        id: "alt_3",
        patientId: "p_103",
        patientName: "Aarav Mehta",
        severity: "moderate",
        status: "reviewed",
        title: "LDL Cholesterol Flagged",
        detail: "LDL cholesterol level at 145 mg/dL.",
        time: "Yesterday",
      },
    ];

    res.status(200).json({
      success: true,
      alerts,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching alerts",
    });
  }
};

// GET /api/doctors/patients - Get Doctor Patients List
const getDoctorPatients = async (req, res) => {
  try {
    const patients = [
      {
        id: "p_101",
        name: "Aarav Mehta",
        age: 34,
        gender: "Male",
        bloodGroup: "O+",
        risk: "moderate",
        riskScore: 58,
        adherence: 82,
        conditions: ["Hypertension", "Prediabetic"],
        lastVisit: "Aug 8, 2026",
        phone: "+91 98765 43210",
        email: "aarav.mehta@example.com",
        vitals: {
          bp: "129/85",
          heartRate: "76 bpm",
          glucose: "105 mg/dL",
          spO2: "98 %",
        },
      },
      {
        id: "p_102",
        name: "Meera Nair",
        age: 47,
        gender: "Female",
        risk: "high",
        riskScore: 74,
        adherence: 62,
        conditions: ["Type 2 Diabetes", "Dyslipidemia"],
        lastVisit: "Aug 12, 2026",
      },
      {
        id: "p_103",
        name: "Rahul Verma",
        age: 29,
        gender: "Male",
        risk: "low",
        riskScore: 22,
        adherence: 95,
        conditions: ["Seasonal Asthma"],
        lastVisit: "Jul 25, 2026",
      },
      {
        id: "p_104",
        name: "Sunita Rao",
        age: 61,
        gender: "Female",
        risk: "high",
        riskScore: 81,
        adherence: 47,
        conditions: ["CKD Stage 2", "Hypertension", "Diabetes"],
        lastVisit: "Aug 15, 2026",
      },
      {
        id: "p_105",
        name: "Kabir Anand",
        age: 38,
        gender: "Male",
        risk: "moderate",
        riskScore: 44,
        adherence: 78,
        conditions: ["Migraine"],
        lastVisit: "Aug 02, 2026",
      },
    ];

    res.status(200).json({
      success: true,
      patients,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching patients",
    });
  }
};

// GET /api/doctors/:id - Get single doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    let doctor = await Doctor.findById(id)
      .populate("userId", "name email profileImage role online")
      .lean();

    if (!doctor) {
      doctor = await Doctor.findOne({ userId: id })
        .populate("userId", "name email profileImage role online")
        .lean();
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const transformed = {
      _id: doctor._id,
      userId: doctor.userId?._id || doctor.userId,
      id: doctor._id,
      name: doctor.userId?.name,
      email: doctor.userId?.email,
      profileImage: doctor.userId?.profileImage,
      specialty: doctor.specialty,
      experience: doctor.experience,
      rating: doctor.rating,
      reviews: doctor.reviews,
      fee: doctor.fee,
      videoFee: doctor.videoFee,
      location: doctor.location,
      languages: doctor.languages,
      about: doctor.about,
      online: doctor.online && doctor.userId?.online !== false,
      availability: doctor.availability,
      weeklyHours: doctor.weeklyHours || doctor.schedule || [],
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Doctor fetched successfully",
      doctor: transformed,
    });
  } catch (error) {
    console.error("Get Doctor By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching doctor",
    });
  }
};

// POST /api/doctors/seed - Seed initial doctors
const seedDoctors = async (req, res) => {
  try {
    const existingCount = await Doctor.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Database already has ${existingCount} doctors. Clear database first or use different IDs.`,
      });
    }

    const doctorsData = [
      faisalProfile,
      {
        email: "priya.sharma@medisync.ai",
        password: "doctor123",
        name: "Dr. Priya Sharma",
        role: "doctor",
        specialty: "Cardiologist",
        experience: 12,
        rating: 4.9,
        reviews: 412,
        fee: 900,
        videoFee: 700,
        location: "Fortis Hospital, MG Road",
        online: true,
        languages: ["English", "Hindi"],
        about:
          "Interventional cardiologist focused on preventive care and early detection of heart disease. 12+ years managing hypertension, arrhythmias and post-MI rehabilitation.",
        availability: [1, 3, 4],
      },
      {
        email: "arjun.mehta@medisync.ai",
        password: "doctor123",
        name: "Dr. Arjun Mehta",
        role: "doctor",
        specialty: "Endocrinologist",
        experience: 9,
        rating: 4.8,
        reviews: 298,
        fee: 800,
        videoFee: 600,
        location: "Apollo Clinic, Indiranagar",
        online: true,
        languages: ["English", "Hindi", "Kannada"],
        about:
          "Diabetes and thyroid specialist. 9 years helping patients manage type-2 diabetes, obesity and metabolic syndrome through evidence-based therapy.",
        availability: [0, 2, 4, 5],
      },
    ];

    const createdDoctors = [];

    for (const docData of doctorsData) {
      const hashedPassword = await bcrypt.hash(docData.password, 10);
      const user = await User.create({
        name: docData.name,
        email: docData.email,
        password: hashedPassword,
        role: docData.role,
      });

      const doctor = await Doctor.create({
        userId: user._id,
        specialty: docData.specialty,
        experience: docData.experience,
        rating: docData.rating,
        reviews: docData.reviews,
        fee: docData.fee,
        videoFee: docData.videoFee,
        location: docData.location,
        online: docData.online,
        languages: docData.languages,
        about: docData.about,
        availability: docData.availability,
      });

      createdDoctors.push({
        userId: user._id,
        doctorId: doctor._id,
        name: docData.name,
        email: docData.email,
        specialty: docData.specialty,
      });
    }

    res.status(201).json({
      success: true,
      message: "Doctors seeded successfully",
      doctors: createdDoctors,
    });
  } catch (error) {
    console.error("Seed Doctors Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while seeding doctors",
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorSchedule,
  updateSchedule,
  getDoctorAlerts,
  getDoctorPatients,
  seedDoctors,
};