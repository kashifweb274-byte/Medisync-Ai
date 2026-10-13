const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Mixed type allows both valid MongoDB ObjectIds and demo strings like "demo1"
    patientId: { 
      type: mongoose.Schema.Types.Mixed, 
      ref: "User", 
      required: true 
    },

    doctorId: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true, 
      refPath: "doctorModel" 
    },
    doctorModel: { 
      type: String, 
      enum: ["Doctor", "User"], 
      default: "Doctor" 
    },

    doctorName: { type: String, trim: true, default: "" },
    specialty: { type: String, trim: true, default: "" },
    doctorProfileImage: { type: String, trim: true, default: "" },

    date: { type: Date, required: true },
    timeSlot: { type: String, required: true, trim: true },
    mode: { type: String, enum: ["video", "inperson"], default: "video" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    reason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);