const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { protect: authMiddleware, isPatient } = require("../middleware/authMiddleware");
const SharedReport = require("../models/SharedReport");
const {
  uploadReport,
  getPatientReports,
  getReportById,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

// Upload Directory Setup
const uploadDirectory = path.join(__dirname, "..", "uploads", "reports");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer Storage Configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, done) =>
      done(
        null,
        `${Date.now()}-${Math.round(Math.random() * 1e9)}${path
          .extname(file.originalname)
          .toLowerCase()}`
      ),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, done) => {
    const mimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    const validExtensions = /\.(?:pdf|png|jpe?g)$/i;
    const isValid = mimeTypes.includes(file.mimetype) || validExtensions.test(file.originalname);

    done(isValid ? null : new Error("Only PDF, PNG, and JPG files are supported"), isValid);
  },
});

const handleUpload = (req, res, next) => {
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "report", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);

    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        req.file = req.files.file[0];
      } else if (req.files.report && req.files.report[0]) {
        req.file = req.files.report[0];
      }
    }
    next();
  });
};

// -------------------------------------------------------------
// 1. Doctor Route (Public/Doctor Token Access - isPatient se PEHLE)
// -------------------------------------------------------------
router.get("/doctor-shared", async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Doctor email is required" });
    }

    const sharedDocs = await SharedReport.find({ doctorEmail: email.toLowerCase() })
      .populate("patientId", "name email")
      .populate("reportId")
      .sort({ createdAt: -1 });

    const reports = sharedDocs
      .filter((doc) => doc.reportId)
      .map((doc) => ({
        _id: doc._id,
        sharedId: doc._id,
        notes: doc.notes,
        patientId: doc.patientId,
        createdAt: doc.createdAt,
        title: doc.reportId?.title || "Medical Report",
        fileUrl: doc.reportId?.fileUrl || "",
        aiSummary: doc.reportId?.aiSummary || {},
      }));

    return res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// 2. Patient Middleware (Niche ke routes Patient Only hain)
// -------------------------------------------------------------
router.use(authMiddleware, isPatient);

// Patient: Report Share Endpoint (POST /api/reports/share)
router.post("/share", async (req, res, next) => {
  try {
    const { patientId, doctorEmail, reportId, notes } = req.body;

    if (!patientId || !doctorEmail || !reportId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Duplicate Check
    const existingShare = await SharedReport.findOne({
      patientId,
      reportId,
      doctorEmail: doctorEmail.toLowerCase(),
    });

    if (existingShare) {
      return res.status(400).json({ success: false, message: "Already shared with this doctor." });
    }

    const newShare = new SharedReport({
      patientId,
      doctorEmail: doctorEmail.toLowerCase(),
      reportId,
      notes: notes || "",
    });

    await newShare.save();
    return res.status(201).json({ success: true, message: "Report shared successfully!" });
  } catch (error) {
    next(error);
  }
});

// Patient Dashboard Operations
router.get("/", getPatientReports);
router.get("/patient", getPatientReports);
router.post("/upload", handleUpload, uploadReport);
router.get("/:id", getReportById);
router.delete("/:id", deleteReport);

// Upload Error Handler
router.use((error, _req, res, _next) =>
  res.status(400).json({ success: false, message: error.message || "Invalid upload request" })
);

module.exports = router;
