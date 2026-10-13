import React, { useState, useEffect } from "react";

import API from "../../api";

import "./Reports.css";



const Reports = () => {

  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [isDragging, setIsDragging] = useState(false);



  // Share Feature States

  const [showShareModal, setShowShareModal] = useState(false);

  const [doctorEmail, setDoctorEmail] = useState("");

  const [shareNote, setShareNote] = useState("");

  const [shareLoading, setShareLoading] = useState(false);

  const [shareSuccess, setShareSuccess] = useState("");



  useEffect(() => {

    fetchPatientReports();

  }, []);



  const fetchPatientReports = async () => {

    setError("");

    try {

      const response = await API.get("/reports");

      if (response.data?.reports && response.data.reports.length > 0) {

        setReport(response.data.reports[0]);

      } else {

        setReport(null);

      }

    } catch (err) {

      console.warn("Could not fetch existing reports:", err.message);

      setError("");

      setReport(null);

    }

  };



  const uploadFile = async (file) => {

    if (!file || loading) return;



    const formData = new FormData();

    formData.append("file", file);



    setLoading(true);

    setError("");



    try {

      const response = await API.post("/reports/upload", formData, {

        headers: { "Content-Type": undefined },

      });



      if (response.data?.report) {

        setReport(response.data.report);

        setError("");

        return;

      }

      throw new Error("Invalid response format from backend");

    } catch (err) {

      setError(

        err.response?.data?.message || "We could not analyze this report right now. Please try again later."

      );

    } finally {

      setLoading(false);

    }

  };



  const handleFileUpload = (e) => {

    const file = e.target.files[0];

    uploadFile(file);

  };



  // Drag & Drop Handlers

  const handleDragOver = (e) => {

    e.preventDefault();

    setIsDragging(true);

  };



  const handleDragLeave = () => {

    setIsDragging(false);

  };



  const handleDrop = (e) => {

    e.preventDefault();

    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {

      uploadFile(e.dataTransfer.files[0]);

    }

  };



  const handleDelete = async () => {

    if (!window.confirm("Are you sure you want to delete this report?")) return;



    if (report?._id) {

      try {

        await API.delete(`/reports/${report._id}`);

      } catch (err) {

        console.warn("Failed to delete report from DB:", err.message);

      }

    }

    setReport(null);

    setError("");

  };



  // Data Extraction

  const aiSummary = report?.aiSummary || report || {};

  const summaryText =

    aiSummary.executiveSummary || aiSummary.summary || "No summary available.";

  const riskText = aiSummary.overallRisk || aiSummary.riskLevel || "Low Risk";

  const metricsList = Array.isArray(aiSummary.keyMetrics)

    ? aiSummary.keyMetrics

    : [];



  const isHighRisk = riskText.toLowerCase().includes("high");

  const isModerateRisk = riskText.toLowerCase().includes("moderate");



  // Visual Bar Percentage Helper

  const getRangePercentage = (statusStr) => {

    if (statusStr.includes("high")) return 85;

    if (statusStr.includes("low")) return 25;

    return 50;

  };



  // Export AI Summary (PDF Print)

  const handleExportSummary = () => {

    if (!report) return;



    const printWindow = window.open("", "_blank");

    printWindow.document.write(`

      <!DOCTYPE html>

      <html>

      <head>

        <title>${report.title || "Medical Report"} - AI Summary</title>

        <style>

          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; }

          .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }

          .logo { font-size: 24px; font-weight: 800; color: #2563eb; }

          .logo span { color: #0f172a; }

          .badge { padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 13px; text-transform: uppercase; }

          .badge-high { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

          .badge-low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

         

          .meta-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px solid #e2e8f0; }

          .meta-info p { margin: 4px 0; }

         

          .summary-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; border-radius: 6px; margin-bottom: 25px; }

          .summary-title { font-size: 11px; font-weight: 800; color: #166534; letter-spacing: 0.05em; text-transform: uppercase; margin: 0 0 6px 0; }

          .summary-text { margin: 0; color: #14532d; font-size: 14px; line-height: 1.6; }

         

          h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 25px; }

          th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 12px; color: #475569; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; }

          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }

         

          .status-tag { padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 12px; }

          .status-high { background: #fef2f2; color: #dc2626; }

          .status-normal { background: #f0fdf4; color: #16a34a; }

         

          .recommendations { background: #eff6ff; border-radius: 8px; padding: 15px; border: 1px solid #dbeafe; }

          .recommendations ul { margin: 8px 0 0 20px; padding: 0; color: #1e3a8a; font-size: 14px; }

          .recommendations li { margin-bottom: 6px; }



          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }



          @media print {

            body { padding: 0; }

          }

        </style>

      </head>

      <body>

        <div class="report-header">

          <div>

            <div class="logo">MediSync <span>AI</span></div>

            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">AI Medical Lab Report & Metric Analysis</p>

          </div>

          <div>

            <span class="badge ${isHighRisk ? 'badge-high' : 'badge-low'}">${riskText}</span>

          </div>

        </div>



        <div class="meta-info">

          <p><strong>Document Title:</strong> ${report.title || "Medical Lab Report"}</p>

          <p><strong>Analysis Date:</strong> ${new Date(report.createdAt || Date.now()).toLocaleString("en-IN")}</p>

        </div>



        <div class="summary-box">

          <p class="summary-title">Executive Summary</p>

          <p class="summary-text">${summaryText}</p>

        </div>



        <h3>Key Metrics & Findings</h3>

        <table>

          <thead>

            <tr>

              <th>Test / Metric</th>

              <th>Observed Value</th>

              <th>Reference Range</th>

              <th style="text-align: right;">Status</th>

            </tr>

          </thead>

          <tbody>

            ${

              metricsList.length > 0

                ? metricsList

                    .map((m) => {

                      const isHigh = (m.status || m.finding || "")

                        .toLowerCase()

                        .includes("high");

                      return `

                      <tr>

                        <td><strong>${m.name || m.metric}</strong></td>

                        <td>${m.value || m.result}${m.unit ? ` ${m.unit}` : ""}</td>

                        <td>${m.referenceRange || m.range || "N/A"}</td>

                        <td style="text-align: right;">

                          <span class="status-tag ${

                            isHigh ? "status-high" : "status-normal"

                          }">

                            ${m.status || m.finding || "Normal"}

                          </span>

                        </td>

                      </tr>

                    `;

                    })

                    .join("")

                : '<tr><td colspan="4" style="text-align:center;">No metrics extracted</td></tr>'

            }

          </tbody>

        </table>



        ${

          aiSummary.recommendations && aiSummary.recommendations.length > 0

            ? `

          <div class="recommendations">

            <h3 style="margin:0; color:#1e40af; font-size:14px;">Actionable Recommendations</h3>

            <ul>

              ${aiSummary.recommendations.map((r) => `<li>${r}</li>`).join("")}

            </ul>

          </div>

        `

            : ""

        }



        <div class="footer">

          Generated automatically by MediSync AI Healthcare Assistant

        </div>



        <script>

          window.onload = function() {

            window.print();

          };

        </script>

      </body>

      </html>

    `);

    printWindow.document.close();

  };



  // Share Report with Doctor Submit Handler

  const handleShareSubmit = async (e) => {

    e.preventDefault();

    if (!doctorEmail || !report?._id) return;



    setShareLoading(true);

    setShareSuccess("");

    setError("");



    try {

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");



      await API.post("/reports/share", {

        patientId: savedUser._id || savedUser.id,

        doctorEmail: doctorEmail,

        reportId: report._id,

        notes: shareNote,

      });



      setShareSuccess("Report successfully shared with doctor!");

      setTimeout(() => {

        setShowShareModal(false);

        setShareSuccess("");

        setDoctorEmail("");

        setShareNote("");

      }, 1800);

    } catch (err) {

      setError(

        err.response?.data?.message || "Failed to share report with doctor."

      );

    } finally {

      setShareLoading(false);

    }

  };



  return (

    <div className="reports-container">

      {/* Header Bar */}

      <div className="reports-header">

        <div>

          <h1 className="page-title">Health Reports & AI Analysis</h1>

          <p className="page-subtitle">

            Upload medical lab reports for AI metric extraction and risk evaluations.

          </p>

        </div>

        <div className="top-action-btns">

          <button

            className="btn-outline"

            onClick={handleExportSummary}

            disabled={!report}

          >

            📄 Export AI Summary

          </button>

          <button

            className="btn-primary-glow"

            onClick={() => setShowShareModal(true)}

            disabled={!report}

          >

            ✉️ Share with Doctor

          </button>

        </div>

      </div>



      {/* Drag & Drop Upload Zone */}

      {!report && (

        <div

          className={`upload-zone ${isDragging ? "dragging" : ""}`}

          onDragOver={handleDragOver}

          onDragLeave={handleDragLeave}

          onDrop={handleDrop}

        >

          <input

            type="file"

            id="report-upload"

            accept=".pdf,.png,.jpg,.jpeg"

            onChange={handleFileUpload}

            style={{ display: "none" }}

            disabled={loading}

          />

          <label htmlFor="report-upload" className="upload-label">

            <div className="upload-icon-circle">☁️</div>

            <div className="upload-text">

              <h3>Drag & drop your medical lab report here or browse</h3>

              <p>Supports PDF, PNG, JPG (up to 10MB)</p>

            </div>

            <span className="browse-file-btn">Browse File</span>

          </label>



          {loading && (

            <div className="loading-box">

              <span className="spinner"></span>

              Analyzing medical report with Gemini AI...

            </div>

          )}



          {error && <p className="error-box">⚠️ {error}</p>}

        </div>

      )}



      {/* Main Report Card */}

      {report && (

        <div className="report-card">

          <div className="card-header">

            <div className="header-info">

              <div className="doc-type-icon">📑</div>

              <div className="header-title">

                <h2>{report.title || "Medical Report"}</h2>

                <p>

                  Uploaded:{" "}

                  {report.createdAt

                    ? new Date(report.createdAt).toLocaleString("en-IN")

                    : new Date().toLocaleString("en-IN")}

                </p>

              </div>

            </div>



            <div className="header-actions">

              <span

                className={`badge ${

                  isHighRisk

                    ? "badge-high"

                    : isModerateRisk

                    ? "badge-moderate"

                    : "badge-low"

                }`}

              >

                {isHighRisk ? <span className="pulse-dot"></span> : null}

                {riskText}

              </span>



              {report.fileUrl && (

                <a

                  href={`http://localhost:5000${report.fileUrl}`}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="btn-view"

                >

                  🔍 View Document

                </a>

              )}



              <button

                onClick={handleDelete}

                className="btn-delete"

                title="Delete Report & Upload New"

              >

                🗑️

              </button>

            </div>

          </div>



          <div className="card-body">

            <div className="ai-insights-header">

              <span className="sparkle-icon">✨</span>

              <h2>Gemini AI Insights</h2>

            </div>



            <div className="summary-box">

              <p className="summary-label">EXECUTIVE SUMMARY</p>

              <p className="summary-text">{summaryText}</p>

            </div>



            <div className="metrics-section">

              <p className="table-section-title">

                KEY METRICS & VISUAL RANGE FINDINGS

              </p>

              <div className="table-container">

                <table className="metrics-table">

                  <thead>

                    <tr>

                      <th>Test / Metric</th>

                      <th>Observed Value</th>

                      <th>Visual Range Indicator</th>

                      <th>Reference Range</th>

                      <th style={{ textAlign: "right" }}>Status</th>

                    </tr>

                  </thead>

                  <tbody>

                    {metricsList.length > 0 ? (

                      metricsList.map((metric, idx) => {

                        const statusStr = (

                          metric.status ||

                          metric.finding ||

                          "Normal"

                        ).toLowerCase();

                        const isMetricHigh = statusStr.includes("high");

                        const isMetricLow = statusStr.includes("low");

                        const fillPercent = getRangePercentage(statusStr);



                        return (

                          <tr key={idx}>

                            <td className="metric-name">

                              {metric.name || metric.metric}

                            </td>

                            <td className="metric-value">

                              {metric.value || metric.result}{metric.unit ? ` ${metric.unit}` : ""}

                            </td>

                            <td className="range-bar-cell">

                              <div className="range-bar-bg">

                                <div

                                  className={`range-bar-fill ${

                                    isMetricHigh

                                      ? "fill-high"

                                      : isMetricLow

                                      ? "fill-low"

                                      : "fill-normal"

                                  }`}

                                  style={{ width: `${fillPercent}%` }}

                                ></div>

                              </div>

                            </td>

                            <td className="metric-range">

                              {metric.referenceRange ||

                                metric.range ||

                                "N/A"}

                            </td>

                            <td style={{ textAlign: "right" }}>

                              <span

                                className={`badge ${

                                  isMetricHigh

                                    ? "badge-high"

                                    : isMetricLow

                                    ? "badge-moderate"

                                    : "badge-low"

                                }`}

                              >

                                {metric.status || metric.finding || "Normal"}

                              </span>

                            </td>

                          </tr>

                        );

                      })

                    ) : (

                      <tr>

                        <td

                          colSpan="5"

                          style={{

                            textAlign: "center",

                            padding: "1.5rem",

                            color: "#6b7280",

                          }}

                        >

                          No report metrics extracted.

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>



            {aiSummary.recommendations &&

              aiSummary.recommendations.length > 0 && (

                <div className="recommendations-box">

                  <p className="summary-label">Actionable Recommendations</p>

                  <ul>

                    {aiSummary.recommendations.map((rec, index) => (

                      <li key={index}>{rec}</li>

                    ))}

                  </ul>

                </div>

              )}

            {aiSummary.abnormalFindings && aiSummary.abnormalFindings.length > 0 && (
              <div className="recommendations-box">
                <p className="summary-label">Abnormal Findings</p>
                <ul>{aiSummary.abnormalFindings.map((finding, index) => <li key={index}>{finding}</li>)}</ul>
              </div>
            )}

            <p className="report-disclaimer">
              {aiSummary.disclaimer || "AI-generated report analysis for informational purposes only. This analysis is not a medical diagnosis. Please consult a qualified healthcare professional."}
            </p>

          </div>

        </div>

      )}



      {/* Feature Modal: Share Report with Doctor */}

      {showShareModal && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h3>✉️ Share Report with Doctor</h3>

            <p>Send AI Analysis & raw file directly to your healthcare provider.</p>



            <form onSubmit={handleShareSubmit}>

              <div className="form-group">

                <label>Doctor's Email Address:</label>

                <input

                  type="email"

                  required

                  placeholder="doctor@hospital.com"

                  value={doctorEmail}

                  onChange={(e) => setDoctorEmail(e.target.value)}

                />

              </div>



              <div className="form-group">

                <label>Additional Notes (Optional):</label>

                <textarea

                  placeholder="Please review my cholesterol levels..."

                  rows="3"

                  value={shareNote}

                  onChange={(e) => setShareNote(e.target.value)}

                />

              </div>



              {shareSuccess && <p className="success-msg">✅ {shareSuccess}</p>}

              {error && <p className="error-box">⚠️ {error}</p>}



              <div className="modal-actions">

                <button

                  type="button"

                  className="btn-outline"

                  onClick={() => setShowShareModal(false)}

                >

                  Cancel

                </button>

                <button

                  type="submit"

                  className="btn-primary-glow"

                  disabled={shareLoading}

                >

                  {shareLoading ? "Sending..." : "Send Report"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

};



export default Reports; 
