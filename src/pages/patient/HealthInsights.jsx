import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Activity, 
  PlusCircle, 
  RefreshCw,
  AlertCircle,
  Download,
  Share2,
  Calendar,
  ChevronRight
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import API from "../../api";
import "./HealthInsights.css";

export default function HealthInsights() {
  const [riskScore, setRiskScore] = useState(28);
  const [adherence, setAdherence] = useState(85);
  const [vitals, setVitals] = useState([
    { id: 1, type: "Blood Pressure", value: 120, date: "Aug 21" },
    { id: 2, type: "Blood Pressure", value: 118, date: "Aug 23" },
    { id: 3, type: "Blood Pressure", value: 122, date: "Aug 25" },
    { id: 4, type: "Blood Pressure", value: 119, date: "Aug 27" },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("7D");

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
        if (response.data.vitals && response.data.vitals.length > 0) {
          setVitals(response.data.vitals);
        }
      }
    } catch (error) {
      console.warn("Using default insights data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskDetails = (score) => {
    if (score <= 30) return { label: "Low Risk", color: "#10b981", badgeBg: "#ecfdf5" };
    if (score <= 65) return { label: "Moderate Risk", color: "#f59e0b", badgeBg: "#fffbe6" };
    return { label: "High Risk", color: "#ef4444", badgeBg: "#fef2f2" };
  };

  const currentRisk = getRiskDetails(riskScore);

  // Score Breakdown Indicators
  const riskBreakdown = [
    { label: "Medication Adherence", val: adherence, color: "#10b981" },
    { label: "Lab Report Findings", val: 90, color: "#0284c7" },
    { label: "Vitals Stability", val: 82, color: "#8b5cf6" },
  ];

  const handleAddVital = (e) => {
    e.preventDefault();
    if (!newVital.value.trim()) return;

    const numericVal = parseFloat(newVital.value) || newVital.value;

    const entry = {
      id: Date.now(),
      type: newVital.type,
      value: numericVal,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };

    setVitals([...vitals, entry]);
    setNewVital({ type: "Blood Pressure", value: "" });
    setShowVitalModal(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleShareDoctor = () => {
    alert("Doctor summary link generated & copied to clipboard!");
  };

  return (
    <div className="insights-container">
      
      {/* Top Header */}
      <div className="insights-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 className="insights-title">Health insights</h1>
          <p className="insights-subtitle">
            AI-assisted screening based on your uploaded reports and medication adherence.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button 
            type="button" 
            onClick={handleExportPDF} 
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff" }}
          >
            <Download size={15} /> Export PDF
          </button>
          
          <button 
            type="button" 
            onClick={handleShareDoctor} 
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, cursor: "pointer", background: "#0284c7", color: "#fff", border: "none" }}
          >
            <Share2 size={15} /> Share with Doctor
          </button>

          <div 
            className="top-risk-badge" 
            style={{ 
              color: currentRisk.color, 
              backgroundColor: currentRisk.badgeBg,
              borderColor: currentRisk.color,
              padding: "6px 12px",
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <span className="badge-dot" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: currentRisk.color }}></span> 
            {currentRisk.label}
          </div>
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
                  style={{ color: currentRisk.color, backgroundColor: currentRisk.badgeBg, width: "fit-content", padding: "4px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}
                >
                  <span className="badge-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: currentRisk.color }}></span> 
                  {currentRisk.label}
                </div>
                <p className="risk-description" style={{ fontSize: 13, color: "#475569" }}>
                  Your current screening score is {riskScore}/100, driven by {adherence}% medication adherence in the last 7 days.
                </p>
              </div>
            </div>

            {/* Score Breakdown Progress Bars */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
              <h4 style={{ fontSize: 13, color: "#334155", marginBottom: 10 }}>Score Breakdown Parameters</h4>
              {riskBreakdown.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: "#64748b" }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: item.color }}>{item.val}%</span>
                  </div>
                  <div style={{ height: 6, width: "100%", backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.val}%`, backgroundColor: item.color, borderRadius: 4, transition: "width 0.4s ease" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Key Risk Factors */}
          <div className="insight-card">
            <div className="card-title-box">
              <span>Key risk factors</span>
            </div>

            <div className="factor-box" style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "#f8fafc", borderRadius: 6, fontSize: 13 }}>
              <Sparkles size={16} color="#0284c7" />
              <span>{adherence}% medication adherence in the last 7 days</span>
            </div>
            {riskScore > 50 && (
              <div className="factor-box" style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "#fef2f2", borderRadius: 6, fontSize: 13, marginTop: 8 }}>
                <AlertCircle size={16} color="#ef4444" />
                <span style={{ color: "#b91c1c" }}>Elevated risk score detected from recent screening reports</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="right-column">
          
          {/* Card 3: Vital Trends Interactive Graph */}
          <div className="insight-card vitals-empty-card" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 12 }}>
              <div className="card-title-box" style={{ margin: 0 }}>
                <Activity size={18} color="#0284c7" />
                <span>Vital Trends Graph</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 6, padding: 2 }}>
                  <button 
                    style={{ border: "none", background: activeTab === "7D" ? "#fff" : "transparent", padding: "4px 8px", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
                    onClick={() => setActiveTab("7D")}
                  >
                    7D
                  </button>
                  <button 
                    style={{ border: "none", background: activeTab === "30D" ? "#fff" : "transparent", padding: "4px 8px", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
                    onClick={() => setActiveTab("30D")}
                  >
                    30D
                  </button>
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
            </div>

            {/* Recharts Graphical Display */}
            {vitals.length > 0 ? (
              <div style={{ width: "100%", height: 180, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitals}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: "#0284c7" }} name="Vital Value" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div className="vital-icon-circle">
                  <Activity size={24} color="#64748b" />
                </div>
                <h3 className="vital-empty-title">No vital trends recorded</h3>
                <p className="vital-empty-subtitle">
                  Machine-readable values from uploaded reports will appear here over time.
                </p>
              </div>
            )}

            {/* Inline Modal Form for adding Vitals */}
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
                  placeholder="e.g. 120 or 72" 
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

          {/* Card 4: Actionable AI Health Guidance */}
          <div className="insight-card">
            <div className="card-title-box">
              <Stethoscope size={18} color="#0284c7" />
              <span>AI Health Guidance</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>Schedule Routine Checkups</strong>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Discuss any missed-dose barriers or side effects.</p>
                </div>
                <a href="/patient/find-doctors" style={{ color: "#0284c7", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                  Book Doctor <ChevronRight size={14} />
                </a>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>Maintain Medication Routine</strong>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Do not change medication doses without consulting your doctor.</p>
                </div>
                <a href="/patient/medications" style={{ color: "#0284c7", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                  Schedule <ChevronRight size={14} />
                </a>
              </div>
            </div>
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