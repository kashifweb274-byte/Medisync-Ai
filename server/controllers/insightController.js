const Report = require("../models/Report");
const Medication = require("../models/Medication");
const User = require("../models/User");

// Safe YYYY-MM-DD Date Normalizer
const toDay = (value = new Date()) => {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const activeOn = (medication, day) => {
  const start = toDay(medication.startDate);
  const end = medication.endDate ? toDay(medication.endDate) : null;
  return day >= start && (!end || day <= end);
};

// Calculate 7-day adherence percentage safely
const adherencePercent = (medications, days = 7) => {
  let scheduled = 0;
  let taken = 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - index);
    const day = toDay(date);

    medications.forEach((medication) => {
      if (!activeOn(medication, day)) return;
      scheduled += 1;

      const isTaken = medication.logs?.some(
        (log) => toDay(log.date) === day && log.status === "taken"
      );
      if (isTaken) taken += 1;
    });
  }
  return scheduled ? Math.round((taken / scheduled) * 100) : null;
};

const trendsFromReports = (reports = []) => {
  const tracked = ["Fasting glucose", "HbA1c", "LDL cholesterol", "Hemoglobin", "Creatinine"];
  return tracked.reduce((trends, metricName) => {
    const points = reports
      .slice()
      .reverse()
      .flatMap((report) =>
        (report.aiSummary?.keyMetrics || [])
          .filter((metric) => metric.name === metricName && Number.isFinite(Number(metric.value)))
          .map((metric) => ({
            date: report.uploadDate,
            value: Number(metric.value),
            unit: metric.unit || "",
          }))
      );
    if (points.length) trends.push({ metric: metricName, points });
    return trends;
  }, []);
};

const buildInsight = (reports = [], medications = []) => {
  const latestReport = reports[0];
  const abnormalMetrics = reports
    .flatMap((report) => report.aiSummary?.keyMetrics || [])
    .filter((metric) => metric.status === "high" || metric.status === "low");

  const adherence = adherencePercent(medications);
  let score = 0;
  const factors = [];

  // Report risk evaluation
  if (latestReport?.aiSummary?.riskLevel === "High") {
    score += 42;
    factors.push("Latest health report has a high-risk result");
  } else if (latestReport?.aiSummary?.riskLevel === "Moderate") {
    score += 25;
    factors.push("Latest health report needs follow-up");
  } else if (latestReport) {
    score += 5;
  }

  // Out-of-range lab metrics evaluation
  const uniqueAbnormal = [...new Set(abnormalMetrics.map((metric) => metric.name))];
  if (uniqueAbnormal.length) {
    score += Math.min(uniqueAbnormal.length * 10, 30);
    factors.push(`Out-of-range results: ${uniqueAbnormal.join(", ")}`);
  }

  // Adherence evaluation
  if (adherence !== null && adherence < 70) {
    score += 28;
    factors.push(`${adherence}% medication adherence in the last 7 days`);
  } else if (adherence !== null && adherence < 85) {
    score += 12;
    factors.push(`${adherence}% medication adherence in the last 7 days`);
  }

  score = Math.min(score, 100);
  const category = score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Moderate" : "Low";

  // Dynamic Clinical Guidance
  const recommendations = [];
  if (category === "Critical" || category === "High") {
    recommendations.push("Arrange a clinician review promptly to confirm these screening findings and decide on next steps.");
  }
  if (uniqueAbnormal.length) {
    recommendations.push("Bring the original laboratory report to your appointment so values, units, and reference ranges can be confirmed.");
  }
  if (adherence !== null && adherence < 85) {
    recommendations.push("Use a reminder routine and discuss any missed-dose barriers or side effects with your clinician.");
  }
  if (!recommendations.length) {
    recommendations.push("Continue routine follow-up and discuss any new symptoms with your healthcare professional.");
  }
  recommendations.push("Do not start, stop, or change medication based solely on this automated screening.");

  return {
    score,
    category,
    adherence,
    factors,
    recommendations,
    summary:
      category === "Low"
        ? "No strong risk signals were found in the records currently available. This score updates as new reports and adherence data are added."
        : `Your current screening score is ${score}/100, driven by ${factors.join("; ")}. This is not a diagnosis and should be reviewed in clinical context.`,
    trends: trendsFromReports(reports),
  };
};

const baselineInsight = () => ({
  riskScore: 10,
  riskCategory: "Low",
  summary: "Baseline health profile created. Upload medical reports or track medications to unlock real-time AI risk analysis.",
  keyFactors: ["Baseline profile created"],
  recommendations: ["Schedule routine checkups", "Maintain balanced hydration and daily activity"],
  trends: [],
  adherence: null,
});

const clientInsight = (insight) => ({
  riskScore: insight.score,
  riskCategory: insight.category,
  summary: insight.summary,
  keyFactors: insight.factors,
  recommendations: insight.recommendations,
  trends: insight.trends,
  adherence: insight.adherence,
});

// GET /api/insights/patient
const getPatientInsights = async (req, res) => {
  try {
    const [reports, medications] = await Promise.all([
      Report.find({ patientId: req.user._id }).sort({ uploadDate: -1 }).lean(),
      Medication.find({ patientId: req.user._id }).lean(),
    ]);

    if (!reports.length && !medications.length) {
      return res.status(200).json({
        success: true,
        insights: baselineInsight(),
      });
    }

    return res.status(200).json({
      success: true,
      insights: clientInsight(buildInsight(reports, medications)),
    });
  } catch (error) {
    console.error("Get Patient Insights Error:", error);
    return res.status(200).json({
      success: true,
      insights: baselineInsight(),
    });
  }
};

// GET /api/insights/doctor-alerts
const getDoctorRiskAlerts = async (req, res) => {
  try {
    const medications = await Medication.find({ doctorId: req.user._id }).lean();
    const patientIds = [...new Set(medications.map((m) => String(m.patientId)))];

    if (!patientIds.length) return res.json({ success: true, alerts: [] });

    const [patients, reports] = await Promise.all([
      User.find({ _id: { $in: patientIds }, role: "patient" }).select("name email profileImage").lean(),
      Report.find({ patientId: { $in: patientIds } }).sort({ uploadDate: -1 }).lean(),
    ]);

    const alerts = patients
      .map((patient) => {
        const patientId = String(patient._id);
        const pReports = reports.filter((r) => String(r.patientId) === patientId);
        const pMeds = medications.filter((m) => String(m.patientId) === patientId);
        const risk = buildInsight(pReports, pMeds);
        return {
          patientId,
          name: patient.name,
          email: patient.email,
          profileImage: patient.profileImage,
          ...risk,
        };
      })
      .filter((patient) => patient.category === "High" || patient.category === "Critical")
      .sort((a, b) => b.score - a.score);

    return res.json({ success: true, alerts });
  } catch (error) {
    console.error("Get Doctor Risk Alerts Error:", error);
    return res.status(200).json({ success: true, alerts: [] });
  }
};

module.exports = { getPatientInsights, getDoctorRiskAlerts };