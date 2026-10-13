const { GoogleGenAI } = require("@google/genai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.7-flash,gemini-3.6-flash")
  .split(",")
  .map((model) => model.trim())
  .filter((model, index, models) => model && model !== GEMINI_MODEL && models.indexOf(model) === index)
  .slice(0, 2);
const GEMINI_MODELS = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
const MEDICAL_DISCLAIMER = "AI-generated report analysis for informational purposes only. This analysis is not a medical diagnosis. Please consult a qualified healthcare professional.";
const RETRYABLE_STATUS = new Set([429, 500, 503]);
const isTransientNetworkError = (error) => error.name === "AbortError" || /timeout|timed out|network|fetch failed/i.test(error.message || "");

class GeminiServiceError extends Error {
  constructor(message, status = 502, reason = "Gemini request failed") {
    super(message);
    this.name = "GeminiServiceError";
    this.status = status;
    this.reason = reason;
  }
}

function parseJsonResponse(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new GeminiServiceError("Gemini returned an empty response.", 502, "Empty response");
  }
  const candidates = [raw.trim(), raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()];
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) candidates.push(raw.slice(start, end + 1));
  for (const candidate of candidates) {
    try { return JSON.parse(candidate); } catch { /* try the next safe extraction */ }
  }
  throw new GeminiServiceError("Gemini returned an unreadable analysis. Please try again.", 502, "Malformed JSON response");
}

function validateAnalysis(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.summary !== "string") {
    throw new GeminiServiceError("Gemini returned an incomplete analysis. Please try again.", 502, "Response schema validation failed");
  }
  const risk = ["Low Risk", "Moderate Risk", "High Risk", "Unknown"].find((item) => item.toLowerCase() === String(value.overallRisk || "").toLowerCase()) || "Unknown";
  const keyMetrics = Array.isArray(value.keyMetrics) ? value.keyMetrics.filter((metric) => metric && typeof metric.name === "string").map((metric) => ({
    name: metric.name.slice(0, 120),
    value: String(metric.value ?? "Not reported").slice(0, 120),
    unit: String(metric.unit || "").slice(0, 40),
    referenceRange: String(metric.referenceRange || "N/A").slice(0, 120),
    status: String(metric.status || "Unknown").slice(0, 40),
  })) : [];
  return {
    summary: value.summary.slice(0, 3000),
    executiveSummary: String(value.executiveSummary || value.summary).slice(0, 3000),
    keyMetrics,
    overallRisk: risk,
    abnormalFindings: Array.isArray(value.abnormalFindings) ? value.abnormalFindings.filter((x) => typeof x === "string").slice(0, 30) : [],
    recommendations: Array.isArray(value.recommendations) ? value.recommendations.filter((x) => typeof x === "string").slice(0, 20) : [],
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

function errorDetails(error) {
  const status = Number(error.status || error.statusCode || error.code) || 0;
  if (status === 400) return new GeminiServiceError("The uploaded report could not be processed. Please check the file and try again.", 400, "Invalid request");
  if (status === 401 || status === 403) return new GeminiServiceError("Report analysis is temporarily unavailable. Please contact support.", 503, "Gemini API authentication failed");
  if (status === 404) return new GeminiServiceError("The configured Gemini model is unavailable. Please contact support.", 503, "Configured model unavailable");
  if (status === 429) return new GeminiServiceError("The analysis service is busy. Please try again later.", 503, "API quota or rate limit exceeded");
  if (status === 500 || status === 503) return new GeminiServiceError("The analysis service is temporarily unavailable. Please try again later.", 503, "Temporary Gemini server failure");
  if (error.name === "AbortError" || /timeout|timed out|network|fetch failed/i.test(error.message || "")) return new GeminiServiceError("The analysis request timed out. Please try again.", 504, "Network or timeout error");
  return new GeminiServiceError("We could not analyze this report right now. Please try again later.", 502, "Unexpected Gemini error");
}

async function analyzeReport(buffer, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiServiceError("Report analysis is not configured. Please contact support.", 503, "GEMINI_API_KEY is not configured");
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60000 } });
  const prompt = `Analyze this medical report and extract only information clearly present in it. Never invent values. Do not diagnose conditions or prescribe medicines. Keep recommendations informational and suggest clinician follow-up when appropriate. Return JSON only with this schema: {"summary":"string","executiveSummary":"string","keyMetrics":[{"name":"string","value":"string or number","referenceRange":"string","status":"Normal, High, Low, Abnormal, or Unknown"}],"overallRisk":"Low Risk | Moderate Risk | High Risk | Unknown","abnormalFindings":["string"],"recommendations":["string"]}. If the report is unreadable, say so in summary, return empty arrays and overallRisk Unknown. Avoid making risk judgments beyond the document's stated findings.`;
  const contents = [{ inlineData: { data: buffer.toString("base64"), mimeType } }, { text: prompt }];
  let lastMappedError;
  for (let modelIndex = 0; modelIndex < GEMINI_MODELS.length; modelIndex += 1) {
    const model = GEMINI_MODELS[modelIndex];
    try {
      const result = await ai.models.generateContent({
        model,
        contents,
        config: { responseMimeType: "application/json", responseSchema: {
          type: "OBJECT", required: ["summary", "keyMetrics", "overallRisk"],
          properties: {
            summary: { type: "STRING" }, executiveSummary: { type: "STRING" },
            keyMetrics: { type: "ARRAY", items: { type: "OBJECT", required: ["name", "value"], properties: { name: { type: "STRING" }, value: { type: "STRING" }, unit: { type: "STRING" }, referenceRange: { type: "STRING" }, status: { type: "STRING" } } } },
            overallRisk: { type: "STRING", enum: ["Low Risk", "Moderate Risk", "High Risk", "Unknown"] },
            abnormalFindings: { type: "ARRAY", items: { type: "STRING" } }, recommendations: { type: "ARRAY", items: { type: "STRING" } },
          },
        } },
      });
      return validateAnalysis(parseJsonResponse(result.text));
    } catch (error) {
      if (error instanceof GeminiServiceError) throw error;
      const mapped = errorDetails(error);
      console.error(`Gemini API request failed for ${model}. Status: ${error.status || error.statusCode || "unknown"}. Reason: ${mapped.reason}.`);
      const status = Number(error.status || error.statusCode);
      lastMappedError = mapped;
      const hasFallback = modelIndex < GEMINI_MODELS.length - 1;
      if (hasFallback && (status === 404 || RETRYABLE_STATUS.has(status) || isTransientNetworkError(error))) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }
      throw mapped;
    }
  }
  throw lastMappedError || new GeminiServiceError("We could not analyze this report right now. Please try again later.");
}

async function checkGeminiConnection() {
  if (!process.env.GEMINI_API_KEY) return { configured: false, model: GEMINI_MODEL, ok: false };
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 15000 } });
  let lastError;
  for (const model of GEMINI_MODELS) {
    try {
      const result = await ai.models.generateContent({ model, contents: "Reply with OK" });
      return { configured: true, configuredModel: GEMINI_MODEL, model, ok: Boolean(result.text) };
    } catch (error) {
      lastError = error;
      const status = Number(error.status || error.statusCode);
      if (status !== 404 && !RETRYABLE_STATUS.has(status) && !isTransientNetworkError(error)) throw error;
    }
  }
  throw lastError;
}

module.exports = { analyzeReport, checkGeminiConnection, GEMINI_MODEL, GeminiServiceError, MEDICAL_DISCLAIMER };
