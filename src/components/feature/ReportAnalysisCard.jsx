import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileText } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatDate, formatTime } from '../../lib/format'

const STATUS_TONE = { Good: 'green', Monitor: 'amber', 'Needs attention': 'red' }

/**
 * AnalyzingState — animated multi-step progress while a report is "processed".
 */
export function AnalyzingState() {
  const [step, setStep] = useState(0)
  const steps = ['Extracting text from report', 'Detecting test panel & units', 'Cross-checking against reference ranges', 'Generating clinical summary']

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1100)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="analyzing">
      <div className="analyzing-spinner" />
      <div className="analyzing-steps">
        {steps.map((s, i) => (
          <div key={s} className={`analyzing-step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
            {i < step ? <CheckCircle2 /> : i === step ? <Loader2 className="pulse" style={{ color: 'var(--brand-600)' }} /> : <Circle />}
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * ReportAnalysisCard — the structured AI result for one report.
 */
export function ReportAnalysisCard({ report, compact = false }) {
  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <span className="report-file-chip">
          <FileText size={17} /> {report.fileName}
        </span>
        <Badge tone={STATUS_TONE[report.status] || 'gray'}>{report.status}</Badge>
        <span className="muted small">Analyzed {formatDate(report.analyzedAt?.slice(0, 10))}</span>
      </div>

      <div className="portal-card-grid">
        <div>
          <h3 style={{ marginBottom: 12 }}>Key parameters</h3>
          <div className="table-wrap">
            <table className="table param-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Value</th>
                  <th>Reference range</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(report.params.length ? report.params : fallbackParams(report)).map((p) => (
                  <tr key={p.name}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className={p.flag === 'high' ? 'flag-high' : p.flag === 'low' ? 'flag-low' : ''}>
                      {p.value} <span className="muted small">{p.unit}</span>
                    </td>
                    <td className="muted small">{p.range}</td>
                    <td>
                      <span className={`param-status text-${p.flag === 'normal' ? 'success' : 'danger'}`}>
                        {p.flag === 'normal' ? <CheckCircle2 /> : <AlertTriangle />}
                        {p.flag === 'normal' ? 'Normal' : p.flag === 'high' ? 'High' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ marginTop: 16, background: 'var(--gray-50)' }}>
            <h4 style={{ marginBottom: 8 }}>AI clinical summary</h4>
            <p className="small" style={{ color: 'var(--gray-700)' }}>
              {report.summary}
            </p>
            <div style={{ marginTop: 12 }}>
              <strong className="small" style={{ color: 'var(--gray-600)' }}>Recommendations</strong>
              <ul style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(report.recommendations || []).map((r) => (
                  <li key={r} className="small" style={{ color: 'var(--gray-600)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="small muted" style={{ marginBottom: 8 }}>Health score</p>
            <div className="gauge-value" style={{ color: healthColor(report.healthScore) }}>
              {report.healthScore}
              <span className="muted" style={{ fontSize: 20 }}>/100</span>
            </div>
            <p className="small muted" style={{ marginTop: 8 }}>
              {report.flaggedCount === 0 ? 'No parameters flagged' : `${report.flaggedCount} parameter(s) flagged`}
            </p>
            <div className="progress" style={{ marginTop: 12 }}>
              <span style={{ width: `${report.healthScore}%`, background: healthColor(report.healthScore) }} />
            </div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
            <h4 className="small" style={{ marginBottom: 8 }}>Report details</h4>
            <dl className="dl">
              <dt>Category</dt>
              <dd>{report.categoryLabel}</dd>
              <dt>Analyzed for</dt>
              <dd>{report.patientName}</dd>
              <dt>Reviewed by</dt>
              <dd>{report.doctorName}</dd>
              <dt>Size</dt>
              <dd>{(report.size / 1024).toFixed(0)} KB</dd>
              <dt>Analyzed at</dt>
              <dd>{formatTime(report.analyzedAt?.slice(11, 16))}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

function fallbackParams(report) {
  return (
    report.flags?.map((f) => ({ name: f.name, value: f.value, unit: f.unit, range: f.range, flag: f.flag })) || []
  )
}

function healthColor(score) {
  if (score >= 85) return 'var(--success)'
  if (score >= 65) return 'var(--warning)'
  return 'var(--danger)'
}
