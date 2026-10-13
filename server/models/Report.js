const mongoose = require("mongoose");

const keyMetricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    referenceRange: { type: String, default: "N/A" },
    status: { type: String, default: "normal" },
    unit: { type: String, default: "" },
  },
  { _id: false }
);

const aiSummarySchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      default: "Medical report uploaded and analyzed successfully.",
    },
    executiveSummary: {
      type: String,
      default: "Medical report uploaded and analyzed successfully.",
    },
    keyMetrics: {
      type: [keyMetricSchema],
      default: [],
    },
    overallRisk: {
      type: String,
      default: "Unknown",
    },
    abnormalFindings: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    disclaimer: { type: String, default: "" },
  },
  { _id: false }
);

// Doctor sharing schema with case-insensitive email matching
const sharedWithSchema = new mongoose.Schema(
  {
    doctorEmail: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true 
    },
    patientId: { 
      type: mongoose.Schema.Types.Mixed, 
      ref: "User" 
    },
    notes: { 
      type: String, 
      default: "" 
    },
    sharedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed, // ObjectId aur demo string dono support karega
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      default: "Health Report",
    },
    aiSummary: {
      type: aiSummarySchema,
      default: () => ({}),
    },
    // Doctor sharing field
    sharedWith: {
      type: [sharedWithSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
