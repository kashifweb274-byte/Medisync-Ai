import { useState, useMemo } from 'react'
import { Users, Search, Phone, Mail } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { Avatar } from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { RiskGauge } from '../../components/charts/charts'
import { formatDate } from '../../lib/format'

const RISK_TONE = { high: 'red', moderate: 'amber', low: 'green' }
const FILTERS = ['All', 'High risk', 'Moderate', 'Low risk']

const VITAL_ROWS = [
  { key: 'bpSystolic', label: 'Systolic BP', unit: 'mmHg', normal: '120 / 80' },
  { key: 'heartRate', label: 'Heart rate', unit: 'bpm', normal: '60 – 100' },
  { key: 'glucose', label: 'Fasting glucose', unit: 'mg/dL', normal: '70 – 100' },
  { key: 'spo2', label: 'SpO₂', unit: '%', normal: '≥ 95' },
  { key: 'bmi', label: 'BMI', unit: '', normal: '18.5 – 24.9' },
]

function flag(v, key) {
  if (key === 'bpSystolic') return v > 140 || v < 90
  if (key === 'heartRate') return v > 100 || v < 60
  if (key === 'glucose') return v > 125
  if (key === 'spo2') return v < 95
  if (key === 'bmi') return v > 30 || v < 18.5
  return false
}

export default function DoctorPatients() {
  const { doctorPatients } = useData()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(doctorPatients[0]?.id)

  const filtered = useMemo(
    () =>
      doctorPatients.filter((p) => {
        const q = query.trim().toLowerCase()
        const matchQ = !q || p.name.toLowerCase().includes(q) || p.conditions.some((c) => c.toLowerCase().includes(q))
        const matchF =
          filter === 'All' ||
          (filter === 'High risk' && p.risk === 'high') ||
          (filter === 'Moderate' && p.risk === 'moderate') ||
          (filter === 'Low risk' && p.risk === 'low')
        return matchQ && matchF
      }),
    [doctorPatients, query, filter]
  )

  const selected = doctorPatients.find((p) => p.id === selectedId)

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1>My patients</h1>
          <p>Monitor risk levels, latest vitals and care notes for every patient under your care.</p>
        </div>
        <Badge tone="teal">{doctorPatients.length} patients</Badge>
      </div>

      <div className="portal-card-grid" style={{ alignItems: 'flex-start' }}>
        {/* List */}
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="Search patients or conditions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="chips" style={{ marginBottom: 14 }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="card">
              <EmptyState icon={Users} title="No patients match" message="Try a different search term or risk filter." />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map((p) => (
                <button
                  key={p.id}
                  className="history-item"
                  style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: selectedId === p.id ? '1px solid var(--brand-400)' : undefined, background: selectedId === p.id ? 'var(--brand-50)' : '#fff' }}
                  onClick={() => setSelectedId(p.id)}
                >
                  <Avatar name={p.name} size="md" />
                  <div className="history-item-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4>{p.name}</h4>
                      <Badge tone={RISK_TONE[p.risk]} dot>{p.risk}</Badge>
                    </div>
                    <p>{p.age} yrs · {p.gender} · {p.conditions.join(' · ')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong className="small" style={{ color: 'var(--gray-800)' }}>{p.riskScore}</strong>
                    <p className="small muted">risk score</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <div className="card">
              <div className="doctor-card" style={{ marginBottom: 18 }}>
                <Avatar name={selected.name} size="xl" />
                <div className="doctor-card-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 19 }}>{selected.name}</h2>
                    <Badge tone={RISK_TONE[selected.risk]} dot>{selected.risk} risk</Badge>
                  </div>
                  <p className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                    {selected.age} yrs · {selected.gender} · Blood {selected.bloodGroup} · Last visit {formatDate(selected.lastVisit)}
                  </p>
                  <div className="chips" style={{ marginTop: 8 }}>
                    {selected.conditions.map((c) => (
                      <span key={c} className="chip">{c}</span>
                    ))}
                  </div>
                  <div className="doctor-meta" style={{ marginTop: 10 }}>
                    <span><Phone size={14} /> {selected.phone}</span>
                    <span><Mail size={14} /> {selected.email}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                <RiskGauge score={selected.riskScore} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p className="small muted" style={{ marginBottom: 8 }}>Adherence</p>
                  <div className="progress" style={{ height: 10 }}>
                    <span
                      style={{
                        width: `${selected.adherence}%`,
                        background: selected.adherence < 60 ? 'var(--danger)' : selected.adherence < 75 ? 'var(--warning)' : 'var(--success)',
                      }}
                    />
                  </div>
                  <p className="small" style={{ marginTop: 6, color: 'var(--gray-600)' }}>
                    <strong>{selected.adherence}%</strong> medication adherence
                    {selected.adherence < 75 && ' — below target'}
                  </p>
                </div>
              </div>

              <h3 style={{ fontSize: 15, marginBottom: 10 }}>Latest vitals</h3>
              <div className="table-wrap" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                      <th>Normal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VITAL_ROWS.map((v) => {
                      const value = selected.vitals?.[v.key]
                      const isFlag = flag(value, v.key)
                      return (
                        <tr key={v.key}>
                          <td style={{ fontWeight: 500 }}>{v.label}</td>
                          <td style={{ color: isFlag ? 'var(--danger)' : 'var(--gray-800)', fontWeight: isFlag ? 700 : 500 }}>
                            {value} {v.unit}
                            {isFlag && <Badge tone="red" style={{ marginLeft: 8 }}>High</Badge>}
                          </td>
                          <td className="muted">{v.normal}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card">
              <EmptyState icon={Users} title="Select a patient" message="Choose a patient from the list to see their profile, vitals and risk assessment." />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
