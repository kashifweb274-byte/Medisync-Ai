import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, Loader2 } from 'lucide-react'
import API from '../../api'
import { Avatar } from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { AdherenceChart } from '../../components/charts/charts'

const tone = (percent = 0) => (percent < 70 ? 'red' : percent < 80 ? 'amber' : 'green')
const color = (percent = 0) => (percent < 70 ? 'var(--danger)' : percent < 80 ? 'var(--warning)' : 'var(--success)')

export default function DoctorAdherence() {
  const [patients, setPatients] = useState([])
  const [average, setAverage] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const { data } = await API.get('/medications/doctor/adherence')
      const patientList = Array.isArray(data?.patients) ? data.patients : []
      setPatients(patientList)
      setAverage(data?.averageAdherence ?? 0)
      setSelectedId((current) => current || patientList[0]?.patientId || patientList[0]?._id || null)
    } catch (err) {
      console.warn('Adherence stats load warning:', err.message)
      setPatients([])
      setAverage(0)
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const selected = patients.find(
    (patient) => (patient.patientId || patient._id) === selectedId
  )
  const flagged = patients.filter((patient) => patient.riskFlag || (patient.adherence?.percent ?? 100) < 70)

  if (loading) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: 'var(--brand-600)', margin: '0 auto 12px' }} />
        <p className="small muted">Loading patient adherence data...</p>
      </div>
    )
  }

  const selectedPercent = selected?.adherence?.percent ?? 0
  const selectedSeries = selected?.adherence?.series || []
  const selectedTaken = selected?.adherence?.taken ?? 0
  const selectedScheduled = selected?.adherence?.scheduled ?? 0

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1>Medication adherence</h1>
          <p>Monitor adherence across patients you have prescribed medication for.</p>
        </div>
        <Badge tone={tone(average)} dot>
          Average {average}%
        </Badge>
      </div>

      {flagged.length > 0 && (
        <div
          className="care-strip"
          style={{ marginBottom: 18, background: 'var(--danger-soft)', borderColor: 'var(--danger)' }}
        >
          <AlertTriangle style={{ color: 'var(--danger)' }} />
          <span>
            {flagged.length} patient{flagged.length === 1 ? '' : 's'} below the 70% adherence threshold.
          </span>
        </div>
      )}

      {!patients.length ? (
        <div className="card">
          <EmptyState
            icon={Activity}
            title="No adherence data yet"
            message="Patients will appear here once active prescriptions are monitored."
          />
        </div>
      ) : (
        <div className="portal-card-grid" style={{ alignItems: 'flex-start' }}>
          {/* Patients List Column */}
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Patients</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {patients.map((patient, idx) => {
                const pId = patient.patientId || patient._id || idx
                const pPercent = patient.adherence?.percent ?? 0
                const isSelected = selectedId === pId

                return (
                  <button
                    key={pId}
                    className="history-item"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--brand-400)' : undefined,
                      borderRadius: 'var(--r-md, 8px)',
                      padding: '12px',
                    }}
                    onClick={() => setSelectedId(pId)}
                  >
                    <Avatar name={patient.name || 'Patient'} size="md" />

                    <div className="history-item-body" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <h4>{patient.name || 'Unknown Patient'}</h4>
                        <strong style={{ color: color(pPercent) }}>{pPercent}%</strong>
                      </div>

                      <p className="small muted">
                        {patient.medicationCount ?? 0} active prescription
                        {(patient.medicationCount ?? 0) === 1 ? '' : 's'}
                      </p>

                      <div className="progress" style={{ marginTop: 7, height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
                        <span
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${Math.min(100, Math.max(0, pPercent))}%`,
                            background: color(pPercent),
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    <Badge tone={tone(pPercent)}>
                      {patient.riskFlag || pPercent < 70 ? 'Risk flag' : pPercent < 80 ? 'Watch' : 'On track'}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detailed Adherence Chart Column */}
          <div>
            {selected ? (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Avatar name={selected.name} size="lg" />
                  <div>
                    <h2 style={{ fontSize: 18 }}>{selected.name}</h2>
                    <p className="small muted">{selected.email || 'No email provided'}</p>
                  </div>
                </div>

                <div className="care-strip" style={{ marginBottom: 16 }}>
                  {selected.riskFlag || selectedPercent < 70 ? (
                    <AlertTriangle style={{ color: 'var(--danger)' }} />
                  ) : (
                    <Activity style={{ color: 'var(--success)' }} />
                  )}
                  <span>
                    {selected.riskFlag || selectedPercent < 70
                      ? 'Adherence is below 70%. Consider sending a dose reminder or scheduling a medication review.'
                      : 'Adherence is healthy and above the monitoring threshold.'}
                  </span>
                </div>

                <h3 style={{ fontSize: 15, marginBottom: 8 }}>Last 7 days</h3>
                <AdherenceChart series={selectedSeries} />

                <p className="small muted" style={{ marginTop: 12 }}>
                  {selectedTaken} of {selectedScheduled} scheduled doses marked taken in the last 7 days.
                </p>
              </div>
            ) : (
              <div className="card">
                <EmptyState icon={Activity} title="Select a patient" message="Choose a patient from the list to review detailed adherence stats." />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}