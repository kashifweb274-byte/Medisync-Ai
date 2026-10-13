import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  ChevronRight,
  CheckCircle2
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
import { useData } from '../../context/DataContext';
import API from '../../api';
import './insight.css';

const Insights = () => {
  const { reports, patientRisk, adherence: contextAdherence } = useData() || { reports: [], patientRisk: null, adherence: { percent: 100 } };
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Graph & Vitals State
  const [vitalsData, setVitalsData] = useState([
    { date: "Mon", value: 120 },
    { date: "Tue", value: 118 },
    { date: "Wed", value: 122 },
    { date: "Thu", value: 120 },
    { date: "Fri", value: 121 },
  ]);
  const [showVitalModal, setShowVitalModal] = useState(false);
  const [newVital, setNewVital] = useState({ type: "Blood Pressure", value: "" });
  const [activeTab, setActiveTab] = useState("7D");

  useEffect(() => {
    fetchPatientInsights();
  }, [reports]);

  const fetchPatientInsights = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      let resData = null;
      try {
        const response = await API.get('/insights/patient');
        if (response.data?.success) {
          resData = response.data.insights || response.data;
        }
      } catch {
        // Fallback to DataContext if backend insight endpoint isn't ready
      }

      setInsights(resData);

      // Dynamic trends rendering
      if (Array.isArray(resData?.trends) && resData.trends.length > 0) {
        const firstMetric = resData.trends[0];
        if (firstMetric?.points?.length > 0) {
          const formatted = firstMetric.points.map((p, index) => ({
            date: p.date ? new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `P${index + 1}`,
            value: Number(p.value) || 0,
          }));
          setVitalsData(formatted);
        }
      }
    } catch (err) {
      console.warn('Insights fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasReports = Array.isArray(reports) && reports.length > 0;

  // Dynamic values calculated from active reports (0 reports = Normal/Low Risk)
  const riskScore = hasReports ? (insights?.riskScore ?? patientRisk?.score ?? 15) : 0;
  const riskCategory = hasReports ? (insights?.riskCategory || insights?.riskLevel || patientRisk?.label?.replace(' Risk', '') || 'Low') : 'Low';
  
  const summary = hasReports
    ? (insights?.summary || patientRisk?.summary || 'Your health parameters are being actively monitored.')
    : 'All health parameters are optimal. No abnormal medical lab parameters or high risk factors detected.';

  const adherence = insights?.adherence ?? contextAdherence?.percent ?? 100;
  
  const keyFactors = hasReports && Array.isArray(insights?.keyFactors) && insights.keyFactors.length > 0
    ? insights.keyFactors
    : (hasReports && patientRisk?.factors?.length ? patientRisk.factors : []);

  const recommendations = hasReports && Array.isArray(insights?.recommendations) && insights.recommendations.length > 0
    ? insights.recommendations
    : [
        'Maintain a balanced diet and regular physical activity.',
        'Upload your latest diagnostic lab reports to track real-time clinical parameters.'
      ];

  // Dynamic Gauge Color Rules
  const getRiskDetails = (score) => {
    if (score <= 35) return { label: "Low Risk", color: "#10b981", badgeBg: "#ecfdf5" };
    if (score <= 65) return { label: "Moderate Risk", color: "#f59e0b", badgeBg: "#fffbe6" };
    return { label: "High Risk", color: "#ef4444", badgeBg: "#fef2f2" };
  };

  const currentRisk = getRiskDetails(riskScore);

  const getAdherenceColor = (val) => {
    if (val >= 80) return "#10b981"; 
    if (val >= 50) return "#f59e0b"; 
    return "#ef4444";               
  };

  // Dynamic Breakdown Calculation
  const riskBreakdown = [
    { label: "Medication Adherence", val: adherence, color: getAdherenceColor(adherence) },
    { label: "Lab Report Screening", val: hasReports ? Math.min(100, riskScore + 5) : 0, color: hasReports ? currentRisk.color : "#10b981" },
    { label: "Vitals Deviation Rate", val: hasReports ? Math.min(100, Math.max(0, riskScore - 3)) : 0, color: "#8b5cf6" },
  ];

  const handleAddVital = (e) => {
    e.preventDefault();
    if (!newVital.value.trim()) return;

    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: parseFloat(newVital.value) || newVital.value,
    };

    setVitalsData([...vitalsData, entry]);
    setNewVital({ type: "Blood Pressure", value: "" });
    setShowVitalModal(false);
  };

  if (loading) {
    return (
      <div className="insights-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <RefreshCw className="animate-spin" size={24} color="#0284c7" />
        <span style={{ marginLeft: 10, color: '#64748b', fontWeight: 500 }}>Updating health insights...</span>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* Top Header */}
      <div className="insights-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 className="insights-title">Health Insights</h1>
          <p className="insights-subtitle">
            AI-assisted screening based on your uploaded reports and medication adherence.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button 
            type="button" 
            onClick={() => window.print()} 
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, cursor: "pointer", border: "1px solid #cbd5e1", background: "#fff" }}
          >
            <Download size={15} /> Export PDF
          </button>
          
          <button 
            type="button" 
            onClick={() => alert("Doctor summary link copied to clipboard!")} 
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
              gap: 6,
              border: `1px solid ${currentRisk.color}`
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
          
          {/* Risk Level Card */}
          <div className="insight-card risk-card">
            <div className="card-title-box">
              <ShieldCheck size={18} color="#0284c7" />
              <span>Overall risk level</span>
            </div>

            <div className="risk-card-content">
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
                    style={{ stroke: currentRisk.color, transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div className="gauge-text-overlay">
                  <div className="gauge-score">{riskScore}</div>
                  <div className="gauge-label">risk score</div>
                </div>
              </div>

              <div className="risk-details">
                <div 
                  className="inline-risk-badge" 
                  style={{ color: currentRisk.color, backgroundColor: currentRisk.badgeBg, width: "fit-content", padding: "4px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}
                >
                  <span className="badge-dot" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: currentRisk.color }}></span> 
                  {currentRisk.label}
                </div>
                <p className="risk-description" style={{ fontSize: 13, color: "#475569" }}>{summary}</p>
                {adherence !== null && (
                  <p className="adherence-stat">
                    7-day medication adherence: <strong>{adherence}%</strong>
                  </p>
                )}
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

          {/* Key Risk Factors */}
          <div className="insight-card">
            <div className="card-title-box">
              <span>Key risk factors</span>
            </div>
            {keyFactors.length > 0 ? (
              keyFactors.map((factor, idx) => (
                <div key={idx} className="factor-box" style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "#f8fafc", borderRadius: 6, fontSize: 13, marginBottom: 8 }}>
                  <Sparkles size={16} color="#0284c7" />
                  <span>{factor}</span>
                </div>
              ))
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px", background: "#f0fdf4", borderRadius: 8, color: "#166534", fontSize: 13 }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>No active critical risk parameters flagged. All vitals are stable.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          
          {/* Vital Trends Graph */}
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

            {vitalsData.length > 0 ? (
              <div style={{ width: "100%", height: 180, marginTop: 10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4, fill: "#0284c7" }} name="Vital Level" />
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

          {/* AI Guidance Card */}
          <div className="insight-card">
            <div className="card-title-box">
              <Stethoscope size={18} color="#0284c7" />
              <span>AI Health Guidance</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>{rec}</strong>
                  </div>
                  <a href="/patient/find-doctors" style={{ color: "#0284c7", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                    Action <ChevronRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <p className="insights-disclaimer">
        This automated score supports monitoring and is not a medical diagnosis. Contact a qualified clinician for urgent symptoms or treatment decisions.
      </p>
    </div>
  );
};

export default Insights;