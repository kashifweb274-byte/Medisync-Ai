import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './insight.css';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientInsights = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. LocalStorage se JWT token nikalein
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Session token missing. Please log in again.');
          setLoading(false);
          return;
        }

        // 2. Express Backend ko GET Request bhejein
        const response = await axios.get('http://localhost:5000/api/insights/patient', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setInsights(response.data.insights || response.data);
        } else {
          setError('Failed to fetch health insights.');
        }
      } catch (err) {
        console.error('Insights fetch error:', err);
        if (err.response?.status === 401) {
          setError('Session expired or unauthorized. Please logout and login again.');
        } else {
          setError('Failed to load health insights. Check server connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatientInsights();
  }, []);

  if (loading) {
    return (
      <div className="insights-container">
        <p>Loading health insights...</p>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="insights-container">
        <p style={{ color: '#ef4444' }}>{error || 'No data found'}</p>
      </div>
    );
  }

  // Safe Extraction (Fallbacks to prevent .map() crashes)
  const riskCategory = insights.riskCategory || insights.riskLevel || 'Low';
  const riskScore =
    insights.riskScore ??
    (insights.adherenceRate !== undefined ? Math.max(0, 100 - insights.adherenceRate) : 10);
  const summary =
    insights.summary || 'Your health insights and adherence levels are regularly tracked.';
  const adherence = insights.adherence ?? insights.adherenceRate ?? null;
  const keyFactors = Array.isArray(insights.keyFactors) ? insights.keyFactors : [];
  const recommendations = Array.isArray(insights.recommendations)
    ? insights.recommendations
    : ['Maintain regular medicine schedule.', 'Upload recent lab reports for deeper evaluation.'];
  const trends = Array.isArray(insights.trends) ? insights.trends : [];

  return (
    <div className="insights-container">
      {/* Header */}
      <div className="insights-header">
        <div>
          <h1 className="insights-title">Health Insights</h1>
          <p className="insights-subtitle">
            AI-assisted screening based on your uploaded reports and medication adherence.
          </p>
        </div>
        <div className="top-risk-badge">
          <span className="badge-dot"></span>
          <span>{riskCategory} risk</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="insights-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Risk Card */}
          <div className="insight-card risk-card">
            <div className="card-title-box">
              <span>Overall risk level</span>
            </div>
            <div className="risk-card-content">
              <div className="gauge-container">
                <div className="gauge-text-overlay">
                  <div className="gauge-score">{riskScore}</div>
                  <div className="gauge-label">Risk Score</div>
                </div>
              </div>
              <div className="risk-details">
                <div className="inline-risk-badge">{riskCategory}</div>
                <p className="risk-description">{summary}</p>
                {adherence !== null && (
                  <p className="adherence-stat">
                    7-day medication adherence: {adherence}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Key Risk Factors */}
          <div className="insight-card">
            <div className="card-title-box">Key risk factors</div>
            {keyFactors.length > 0 ? (
              keyFactors.map((factor, idx) => (
                <div key={idx} className="factor-box" style={{ marginBottom: '8px' }}>
                  <span>{factor}</span>
                </div>
              ))
            ) : (
              <p className="guidance-p">No critical risk factors flagged.</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* AI Guidance Card */}
          <div className="insight-card">
            <div className="card-title-box">AI health guidance</div>
            <div className="guidance-text-box">
              {recommendations.map((rec, idx) => (
                <p key={idx} className="guidance-p">• {rec}</p>
              ))}
            </div>
          </div>

          {/* Vitals / Trends */}
          <div className="insight-card">
            <div className="card-title-box">Vital trends</div>
            {trends.length > 0 ? (
              <div>
                {trends.map((t, idx) => (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <strong>{t.metric}: </strong>
                    {t.points?.[t.points.length - 1]?.value} {t.points?.[t.points.length - 1]?.unit}
                  </div>
                ))}
              </div>
            ) : (
              <div className="vitals-empty-card">
                <div className="vital-icon-circle">📈</div>
                <p className="vital-empty-title">No vital trends yet</p>
                <p className="vital-empty-subtitle">
                  Machine-readable values from uploaded reports will appear here over time.
                </p>
              </div>
            )}
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