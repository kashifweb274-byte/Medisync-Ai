import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Activity, 
  PlusCircle, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import API from "../../api";
import "./HealthInsights.css";

export default function HealthInsights() {
  const [riskScore, setRiskScore] = useState(28);
  const [adherence, setAdherence] = useState(85);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Vital Entry State
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [newVital, setNewVital] = useState({ type: "Blood Pressure", value: "" });

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/health-insights");
      if (response.data) {
        if (response.data.riskScore !== undefined) setRiskScore(response.data.riskScore);
        if (response.data.adherence !== undefined) setAdherence(response.data.adherence);
        if (response.data.vitals) setVitals(response.data.vitals);
      }
    } catch (error) {
      console.warn("Using default insights data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Risk Level & Gauge Color Setup
  const getRiskDetails = (score) => {
    if (score <= 30) return { label: "Low Risk", color: "#10b981", badgeBg: "#ecfdf5" };
    if (score <= 65) return { label: "Moderate Risk", color: "#f59e0b", badgeBg: "#fffbe6" };
    return { label: "High Risk", color: "#ef4444", badgeBg: "#fef2f2" };
  };

  const currentRisk = getRiskDetails(riskScore);

  const handleAddVital = (e) => {
    e.preventDefault();
    if (!newVital.value.trim()) return;

    const entry = {
      id: Date.now(),
      type: newVital.type,
      value: newVital.value,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    setVitals([entry, ...vitals]);
    setNewVital({ type: "Blood Pressure", value: "" });
    setShowVitalModal(false);
  };

  return (
    <div className="insights-container">
      
      {/* Top Header */}
      <div className="insights-header">
        <div>
          <h1 className="insights-title">Health insights</h1>
          <p className="insights-subtitle">
            AI-assisted screening based on your uploaded reports and medication adherence.
          </p>
        </div>

        <div 
          className="top-risk-badge" 
          style={{ 
            color: currentRisk.color, 
            backgroundColor: currentRisk.badgeBg,
            borderColor: currentRisk.color 
          }}
        >
          <span className="badge-dot" style={{ backgroundColor: currentRisk.color }}></span> 
          {currentRisk.label}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="insights-grid">
        
        {/* Left Column */}
        <div className="left-column">
          
          {/* Card 1: Overall Risk Level */}
          <div className="insight-card risk-card">
            <div className="card-title-box">
              <ShieldCheck size={18} color="#0284c7" />
              <span>Overall risk level</span>
              {loading && <RefreshCw size={14} className="animate-spin" style={{ marginLeft: "auto" }} />}
            </div>

            <div className="risk-card-content">
              {/* Semi-Circle SVG Gauge */}
              <div className="gauge-container">
                <svg className="gauge-svg" viewBox="0 0 100 55">
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={currentRisk.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (125.6 * riskScore) / 100}
                  />
                </svg>
                <div className="gauge-text-overlay">
                  <div className="gauge-score">{riskScore}</div>
                  <div className="gauge-label">risk score</div>
                </div>
              </div>

              {/* Risk Details Text */}
              <div className="risk-details">
                <div 
                  className="inline-risk-badge" 
                  style={{ color: currentRisk.color, backgroundColor: currentRisk.badgeBg }}
                >
                  <span className="badge-dot" style={{ backgroundColor: currentRisk.color }}></span> 
                  {currentRisk.label}
                </div>
                <p className="risk-description">
                  Your current screening score is {riskScore}/100, driven by {adherence}% medication adherence in the last 7 days. This is not a diagnosis and should be reviewed in clinical context.
                </p>
                <p className="adherence-stat">
                  7-day medication adherence: <strong>{adherence}%</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Key Risk Factors */}
          <div className="insight-card">
            <div className="card-title-box">
              <span>Key risk factors</span>
            </div>

            <div className="factor-box">
              <Sparkles size={16} color="#0284c7" />
              <span>{adherence}% medication adherence in the last 7 days</span>
            </div>
            {riskScore > 50 && (
              <div className="factor-box" style={{ marginTop: 8 }}>
                <AlertCircle size={16} color="#ef4444" />
                <span>Elevated risk score detected from recent screening reports</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="right-column">
          
          {/* Card 3: AI Health Guidance */}
          <div className="insight-card">
            <div className="card-title-box">
              <Stethoscope size={18} color="#0284c7" />
              <span>AI health guidance</span>
            </div>

            <div className="guidance-text-box">
              <p className="guidance-p">
                Use a reminder routine and discuss any missed-dose barriers or side effects with your clinician.
              </p>
              <p className="guidance-p">
                Do not start, stop, or change medication based solely on this automated screening.
              </p>
            </div>
          </div>

          {/* Card 4: Vital Trends */}
          <div className="insight-card vitals-empty-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
              <div className="card-title-box" style={{ margin: 0 }}>
                <Activity size={18} color="#0284c7" />
                <span>Vital Trends</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowVitalModal(!showVitalModal)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0284c7",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                <PlusCircle size={16} /> Log Vital
              </button>
            </div>

            {vitals.length > 0 ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                {vitals.map((item) => (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "8px 12px", 
                      backgroundColor: "#f8fafc", 
                      borderRadius: 6,
                      fontSize: 13 
                    }}
                  >
                    <span><strong>{item.type}:</strong> {item.value}</span>
                    <span style={{ color: "#64748b" }}>{item.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="vital-icon-circle">
                  <Activity size={24} />
                </div>
                <h3 className="vital-empty-title">No vital trends yet</h3>
                <p className="vital-empty-subtitle">
                  Machine-readable values from uploaded reports will appear here over time.
                </p>
              </>
            )}

            {/* Inline Modal for adding Vitals */}
            {showVitalModal && (
              <form 
                onSubmit={handleAddVital} 
                style={{ 
                  marginTop: 12, 
                  padding: 12, 
                  backgroundColor: "#f1f5f9", 
                  borderRadius: 8, 
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                <select 
                  value={newVital.type} 
                  onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                  style={{ padding: 6, borderRadius: 4, border: "1px solid #cbd5e1" }}
                >
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="Blood Sugar">Blood Sugar</option>
                  <option value="SpO2">SpO2</option>
                </select>
                <input 
                  type="text" 
                  placeholder="e.g. 120/80 mmHg or 72 BPM" 
                  value={newVital.value}
                  onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                  style={{ padding: 6, borderRadius: 4, border: "1px solid #cbd5e1" }}
                  required
                />
                <button 
                  type="submit" 
                  style={{ 
                    backgroundColor: "#0284c7", 
                    color: "#fff", 
                    border: "none", 
                    padding: "6px 12px", 
                    borderRadius: 4, 
                    cursor: "pointer" 
                  }}
                >
                  Save Entry
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Bottom Medical Disclaimer */}
      <footer className="insights-disclaimer">
        This automated score supports monitoring and is not a medical diagnosis. Contact a qualified clinician for urgent symptoms or treatment decisions.
      </footer>

    </div>
  );
}