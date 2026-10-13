const mongoose = require("mongoose");

const sharedReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorEmail: { type: String, required: true, lowercase: true, trim: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedReport", sharedReportSchema);