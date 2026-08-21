/**
 * Seed Doctors Script
 * Run with: node server/seedDoctors.js
 * Requires MongoDB running and .env configured
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Doctor = require("./models/Doctor");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medisync";

const doctorsData = [
  {
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
  },
  {
    // Fixed ID to match frontend hardcoded URL
    _id: "6a7d65aceb77e6524f87351f",
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
    availability: [1, 3, 4], // Mon, Wed, Thu
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
  {
    email: "sara.iyer@medisync.ai",
    password: "doctor123",
    name: "Dr. Sara Iyer",
    role: "doctor",
    specialty: "General Physician",
    experience: 7,
    rating: 4.7,
    reviews: 521,
    fee: 500,
    videoFee: 400,
    location: "MediSync Care Centre, Koramangala",
    online: true,
    languages: ["English", "Tamil"],
    about:
      "Primary care physician focused on preventive health, chronic disease coordination and first-line diagnosis. Known for clear, jargon-free explanations.",
    availability: [0, 1, 2, 3, 4, 5],
  },
  {
    email: "vikram.rao@medisync.ai",
    password: "doctor123",
    name: "Dr. Vikram Rao",
    role: "doctor",
    specialty: "Neurologist",
    experience: 15,
    rating: 4.9,
    reviews: 187,
    fee: 1200,
    videoFee: 1000,
    location: "Manipal Hospital, Jayanagar",
    online: false,
    languages: ["English", "Kannada"],
    about:
      "Senior neurologist specialising in migraine, epilepsy and movement disorders. Prefers in-person consults for detailed neurological examination.",
    availability: [1, 2, 4, 6],
  },
  {
    email: "nandini.kulkarni@medisync.ai",
    password: "doctor123",
    name: "Dr. Nandini Kulkarni",
    role: "doctor",
    specialty: "Dermatologist",
    experience: 6,
    rating: 4.6,
    reviews: 356,
    fee: 600,
    videoFee: 450,
    location: "DermaPlus Skin Clinic, HSR Layout",
    online: true,
    languages: ["English", "Hindi", "Marathi"],
    about:
      "Clinical dermatologist treating acne, eczema and hair fall with a mix of medical and lifestyle-based approaches.",
    availability: [0, 1, 3, 4, 6],
  },
  {
    email: "rohan.desai@medisync.ai",
    password: "doctor123",
    name: "Dr. Rohan Desai",
    role: "doctor",
    specialty: "Orthopedic Surgeon",
    experience: 11,
    rating: 4.8,
    reviews: 244,
    fee: 1000,
    videoFee: 750,
    location: "Sunrise Ortho Centre, Whitefield",
    online: false,
    languages: ["English", "Kannada"],
    about:
      "Orthopaedic surgeon and sports-medicine specialist handling joint pain, arthritis and post-injury rehabilitation.",
    availability: [0, 2, 3, 5],
  },
  {
    email: "aisha.khan@medisync.ai",
    password: "doctor123",
    name: "Dr. Aisha Khan",
    role: "doctor",
    specialty: "Pediatrician",
    experience: 8,
    rating: 4.9,
    reviews: 467,
    fee: 700,
    videoFee: 500,
    location: "Little Steps Clinic, Indiranagar",
    online: true,
    languages: ["English", "Hindi", "Urdu"],
    about:
      "Pediatrician with a warm, evidence-based approach to infant nutrition, vaccinations and common childhood illnesses.",
    availability: [0, 1, 2, 4, 5],
  },
  {
    email: "karthik.nair@medisync.ai",
    password: "doctor123",
    name: "Dr. Karthik Nair",
    role: "doctor",
    specialty: "Psychiatrist",
    experience: 10,
    rating: 4.8,
    reviews: 202,
    fee: 1100,
    videoFee: 850,
    location: "MindWell Center, Koramangala",
    online: true,
    languages: ["English", "Malayalam"],
    about:
      "Psychiatrist specialising in anxiety, depression and sleep disorders. Advocates a combined therapy + medication approach.",
    availability: [1, 2, 3, 4],
  },
];

async function seedDoctors() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Clean existing doctor users and doctor records to avoid duplication/skipping
    console.log("🧹 Clearing old doctor data...");
    await User.deleteMany({ role: "doctor" });
    await Doctor.deleteMany({});

    console.log("🌱 Seeding doctors...");

    for (const docData of doctorsData) {
      const hashedPassword = await bcrypt.hash(docData.password, 10);
      const customId = docData._id ? new mongoose.Types.ObjectId(docData._id) : new mongoose.Types.ObjectId();

      // Create User with specific/generated ID
      const user = await User.create({
        _id: customId,
        name: docData.name,
        email: docData.email,
        password: hashedPassword,
        role: docData.role,
      });

      // Create Doctor linked with same ID
      const doctor = await Doctor.create({
        _id: customId,
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

      console.log(`✅ Created: ${docData.name} (${docData.specialty}) - ID: ${user._id}`);
    }

    console.log("");
    console.log("🎉 All 8 doctors seeded successfully!");
    console.log("Login credentials for all doctors:");
    console.log("  Email: <name>@medisync.ai");
    console.log("  Password: doctor123");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seedDoctors();
