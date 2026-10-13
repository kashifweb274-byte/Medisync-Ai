const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed, // Allows both MongoDB ObjectId and demo strings like "demo1"
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
      default: "",
    },
    frequency: {
      type: String,
      trim: true,
      default: "",
    },
    time: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    taken: {
      type: Boolean,
      default: false,
    },
    logs: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["taken", "missed"],
          default: "taken",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);