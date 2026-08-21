const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    videoFee: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    about: {
      type: String,
      trim: true,
    },
    online: {
      type: Boolean,
      default: true,
    },
    availability: {
      type: [Number],
      default: [],
    },
    weeklyHours: [
      {
        day: { type: String, required: true }, // "Mon", "Tue", "Wed", etc.
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" },
        isAvailable: { type: Boolean, default: true }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);