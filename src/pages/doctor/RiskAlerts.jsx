import { useEffect, useState } from 'react'
import { AlertTriangle, CalendarPlus, Loader2, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import API from '../../api'
import { Avatar } from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'

const tone = { High: 'amber', Critical: 'red' }

export default function DoctorRiskAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/insights/doctor/alerts')
      setAlerts(Array.isArray(data.alerts) ? data.alerts : Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Risk alerts load warning:', err.message)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  if (loading) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: 'var(--brand-600)', margin: '0 auto 12px' }} />
        <p className="small muted">Checking patient risk alerts...</p>
      </div>
    )
  }

  const hasCritical = alerts.some((alert) => alert.category === 'Critical')

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1>Risk alerts</h1>
          <p>High-priority patient screening signals from reports and medication adherence.</p>
        </div>
        <Badge tone={hasCritical ? 'red' : alerts.length ? 'amber' : 'green'} dot>
          {alerts.length ? `${alerts.length} priority alert${alerts.length === 1 ? '' : 's'}` : 'All caught up'}
        </Badge>
      </div>

      {!alerts.length ? (
        <div className="card">
          <EmptyState
            icon={ShieldAlert}
            title="No high-risk alerts"
            message="High and critical screening signals for patients you prescribe for will appear here."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((alert, idx) => {
            const isCritical = alert.category === 'Critical'
            const badgeTone = tone[alert.category] || 'amber'
            const factorsList = Array.isArray(alert.factors) ? alert.factors : []

            return (
              <div
                key={alert.patientId || alert._id || idx}
                className="card card-pad-sm alert-item"
                style={{
                  borderLeftWidth: 4,
                  borderLeftStyle: 'solid',
                  borderLeftColor: isCritical ? 'var(--danger)' : 'var(--warning)',
                }}
              >
                <span className={`alert-severity ${isCritical ? 'high' : 'moderate'}`}>
                  <AlertTriangle size={20} />
                </span>

                <div className="alert-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Avatar name={alert.name || alert.patientName || 'Patient'} size="sm" />
                    <h4>{alert.name || alert.patientName || 'Unknown Patient'}</h4>
                    <Badge tone={badgeTone} dot>
                      {alert.category || 'High'}
                    </Badge>
                    <span className="small muted">Risk score {alert.score ?? 0}/100</span>
                  </div>

                  <p className="small" style={{ marginTop: 8, color: 'var(--gray-700)' }}>
                    {alert.summary || alert.message || 'Anomaly detected in patient telemetry.'}
                  </p>

                  {factorsList.length > 0 && (
                    <div className="chips" style={{ marginTop: 8 }}>
                      {factorsList.map((factor, fIdx) => (
                        <span className="chip" key={fIdx}>
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="appt-actions">
                  <Link className="btn btn-primary btn-sm" to="/doctor/appointments">
                    <CalendarPlus size={15} /> Book urgent consultation
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}