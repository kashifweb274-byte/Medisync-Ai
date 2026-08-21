const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // New appointments always store the Doctor profile _id. doctorModel keeps
    // the reference explicit, while the controller still reads legacy rows that
    // stored a User _id before this field existed.
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "doctorModel" },
    doctorModel: { type: String, enum: ["Doctor", "User"], default: "Doctor", required: true },

    // Snapshots make an appointment readable even if a linked profile changes
    // or an old record contains a legacy User id.
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
