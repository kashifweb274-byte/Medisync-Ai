const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    diagnosis: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },   // e.g., "1 tab after food"
        duration: { type: String, required: true }, // e.g., "5 days"
      },
    ],
    advice: { type: String, default: "Rest and stay hydrated." },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);