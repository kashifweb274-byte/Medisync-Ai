const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { authMiddleware, isPatient } = require("../middleware/authMiddleware");
const {
  uploadReport,
  getPatientReports,
  getReportById,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "..", "uploads", "reports");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

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

router.use(authMiddleware, isPatient);

router.get("/", getPatientReports);
router.get("/patient", getPatientReports);
router.post("/upload", handleUpload, uploadReport);
router.get("/:id", getReportById);
router.delete("/:id", deleteReport);

router.use((error, _req, res, _next) =>
  res.status(400).json({ success: false, message: error.message || "Invalid upload request" })
);

module.exports = router;