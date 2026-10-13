const Report = require("../models/Report");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const { analyzeReport, GeminiServiceError, MEDICAL_DISCLAIMER } = require("../services/geminiService");

// 1. Upload & Analyze Handler
const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let fileBuffer;
    if (req.file.buffer) {
      fileBuffer = req.file.buffer;
    } else if (req.file.path && fs.existsSync(req.file.path)) {
      fileBuffer = fs.readFileSync(req.file.path);
    }

    if (!fileBuffer) {
      return res.status(400).json({ success: false, message: "Unable to read uploaded file buffer" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const mimeType = ({ ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" })[ext];
    if (!mimeType || (req.file.mimetype && req.file.mimetype !== "application/octet-stream" && req.file.mimetype !== mimeType && !(ext === ".jpg" && req.file.mimetype === "image/jpg"))) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch { /* ignore cleanup failure */ }
      }
      return res.status(400).json({ success: false, message: "Only valid PDF, PNG, and JPG files are supported." });
    }
    const extractedData = await analyzeReport(fileBuffer, mimeType);

    const summaryText = extractedData.summary || extractedData.executiveSummary || "Medical report uploaded and analyzed successfully.";

    const formattedAiSummary = {
      summary: summaryText,
      executiveSummary: summaryText,
      keyMetrics: extractedData.keyMetrics || [],
      overallRisk: extractedData.overallRisk || "Unknown",
      recommendations: extractedData.recommendations || [],
      abnormalFindings: extractedData.abnormalFindings || [],
      disclaimer: MEDICAL_DISCLAIMER
    };

    const patientId = req.user ? (req.user._id || req.user.id || req.user.userId) : "demo1";
    const filename = req.file.filename || req.file.originalname;

    const newReport = new Report({
      patientId,
      title: req.file.originalname,
      fileUrl: `/uploads/reports/${filename}`,
      reportType: "Health Report",
      aiSummary: formattedAiSummary,
      sharedWith: []
    });

    await newReport.save();

    return res.status(200).json({
      success: true,
      message: "Report uploaded and analyzed successfully",
      report: newReport,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch { /* retain the original request error */ }
    }
    if (error instanceof GeminiServiceError) {
      console.error(`Report analysis failed. Status: ${error.status}. Reason: ${error.reason}.`);
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Report upload failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "We could not analyze this report right now. Please try again later.",
    });
  }
};

// 2. Fetch Patient Reports
const getPatientReports = async (req, res) => {
  try {
    const rawUserId = req.user ? (req.user._id || req.user.id || req.user.userId) : "demo1";
    const userEmail = String(req.user?.email || "").toLowerCase();

    const reports = await Report.find({
      $or: [
        { patientId: rawUserId },
        { "sharedWith.doctorEmail": userEmail },
        { "sharedWith.doctorEmail": { $regex: new RegExp(`^${userEmail}$`, "i") } }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Share Report With Doctor
const shareReport = async (req, res) => {
  try {
    const reportId = req.params.id || req.body.reportId;
    const { email, doctorEmail, notes } = req.body;
    const targetEmail = String(doctorEmail || email || "").trim().toLowerCase();

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: "Doctor email address is required" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    if (!Array.isArray(report.sharedWith)) {
      report.sharedWith = [];
    }

    const isAlreadyShared = report.sharedWith.some(
      (s) => String(s.doctorEmail || s).toLowerCase() === targetEmail
    );

    if (isAlreadyShared) {
      return res.status(400).json({ success: false, message: "Already shared with this doctor." });
    }

    const patientId = req.user ? (req.user._id || req.user.id) : report.patientId;

    report.sharedWith.push({
      doctorEmail: targetEmail,
      patientId: patientId,
      notes: notes || "",
      sharedAt: new Date()
    });

    await report.save();

    return res.status(200).json({
      success: true,
      message: `Report successfully shared with ${targetEmail}`,
      report
    });
  } catch (error) {
    console.error("❌ Share Report Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to share report" });
  }
};

// 4. Fetch Doctor Shared Reports
const getDoctorReports = async (req, res) => {
  try {
    const doctorEmail = String(req.user?.email || "faisal@gmail.com").toLowerCase();
    const doctorId = req.user?._id || req.user?.id;

    const reports = await Report.find({
      $or: [
        { "sharedWith.doctorEmail": doctorEmail },
        { "sharedWith.doctorEmail": { $regex: new RegExp(`^${doctorEmail}$`, "i") } },
        { "sharedWith.patientId": doctorId }
      ]
    })
      .populate("patientId", "name email phone profileImage")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      reports: reports || []
    });
  } catch (error) {
    console.error("❌ Get Doctor Reports Error:", error);
    return res.status(500).json({ success: true, reports: [] });
  }
};

// 5. Fetch Single Report By ID
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    return res.status(200).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Delete Report
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    if (report.fileUrl) {
      const relativeUrl = report.fileUrl.startsWith("/") ? report.fileUrl.slice(1) : report.fileUrl;
      const filePath = path.join(__dirname, "..", relativeUrl);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    await Report.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadReport,
  getPatientReports,
  getReports: getPatientReports,
  shareReport,
  shareReportWithDoctor: shareReport,
  getDoctorReports,
  getReportById,
  deleteReport,
};
