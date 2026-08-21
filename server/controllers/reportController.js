const { GoogleGenerativeAI } = require("@google/generative-ai");
const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");

// Active Gemini Models supported by your API Key
const MODELS_TO_TRY = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite"
];

const stripGeminiJsonMarkdown = (rawText) => {
  if (typeof rawText !== "string") return rawText;
  return rawText
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
};

async function analyzeWithGemini(fileBuffer, mimeType, apiKey) {
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY environment variable is missing!");
    throw new Error("GEMINI_API_KEY is missing in server environment");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const base64Data = fileBuffer.toString("base64");

  const prompt = `You are an expert medical report parser AI.
Analyze this medical report (PDF or scanned image) thoroughly.
Extract ALL lab tests, values, units, reference ranges, and findings present in the document.

CRITICAL INSTRUCTIONS:
1. Extract actual values directly from the document. Do NOT make up values.
2. If Blood Pressure is 150/95 or elevated, set overallRisk to "High Risk".
3. Return ONLY a raw JSON object matching this schema without markdown code blocks:

{
  "summary": "Detailed 2-line summary of extracted health metrics and abnormal values.",
  "executiveSummary": "Short executive summary of findings.",
  "keyMetrics": [
    { "name": "Parameter Name", "value": "Extracted Value", "referenceRange": "Normal Range", "status": "normal/high/low" }
  ],
  "overallRisk": "Low Risk / Moderate Risk / High Risk"
}`;

  let lastError = null;

  for (const currentModel of MODELS_TO_TRY) {
    try {
      console.log(`➡️ Attempting extraction with model: ${currentModel}`);
      const model = genAI.getGenerativeModel({
        model: currentModel,
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || "application/pdf",
          },
        },
        prompt,
      ]);

      const rawText = result.response.text();
      console.log(`✅ Extraction successful using model: ${currentModel}`);
      const cleaned = stripGeminiJsonMarkdown(rawText);
      return JSON.parse(cleaned);
    } catch (err) {
      console.error(`❌ Model [${currentModel}] failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Gemini Parsing Failed for all models: ${lastError?.message || "Unknown error"}`);
}

// 1. Upload & Analyze Handler
exports.uploadReport = async (req, res) => {
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

    const apiKey = process.env.GEMINI_API_KEY || "";
    let mimeType = req.file.mimetype;
    if (!mimeType || mimeType === "application/octet-stream") {
      mimeType = req.file.originalname.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg";
    }

    const extractedData = await analyzeWithGemini(fileBuffer, mimeType, apiKey);

    const summaryText = extractedData.summary || extractedData.executiveSummary || "Medical report uploaded and analyzed successfully.";

    const formattedAiSummary = {
      summary: summaryText,
      executiveSummary: summaryText,
      keyMetrics: extractedData.keyMetrics || [],
      overallRisk: extractedData.overallRisk || "Low Risk"
    };

    const patientId = req.user ? (req.user._id || req.user.id) : "64b73734a633bfb613e9c4ae";
    const filename = req.file.filename || req.file.originalname;

    const newReport = new Report({
      patientId,
      title: req.file.originalname,
      fileUrl: `/uploads/reports/${filename}`,
      reportType: "Health Report",
      aiSummary: formattedAiSummary,
    });

    await newReport.save();

    return res.status(200).json({
      success: true,
      message: "Report uploaded and analyzed successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("❌ Upload Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process report",
    });
  }
};

// 2. Fetch Patient Reports
exports.getPatientReports = async (req, res) => {
  try {
    const patientId = req.user ? (req.user._id || req.user.id) : "64b73734a633bfb613e9c4ae";
    const reports = await Report.find({ patientId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Fetch Single Report By ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    return res.status(200).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    if (report.fileUrl) {
      const relativeUrl = report.fileUrl.startsWith("/") ? report.fileUrl.slice(1) : report.fileUrl;
      const filePath = path.join(__dirname, "..", relativeUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};