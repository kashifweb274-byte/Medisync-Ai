const mongoose = require("mongoose");

const keyMetricSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    referenceRange: { type: String, default: "N/A" },
    status: { type: String, default: "normal" },
  },
  { _id: false }
);

const aiSummarySchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      required: true,
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
      default: "Low Risk",
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);