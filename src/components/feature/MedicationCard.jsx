import { Check, X, Bell, Clock } from 'lucide-react'
import Badge from '../ui/Badge'
import { humanDuration } from '../../lib/format'

/** MedicationCard — shows a medication, its schedule, and today's dose toggles. */
export function MedicationCard({ med, today, onToggle }) {
  const todayDoses = (med.doses || []).filter((d) => d.date === today)
  const takenCount = todayDoses.filter((d) => d.taken === true).length
  const scheduledToday = todayDoses.filter((d) => d.taken === null).length
  const pending = todayDoses.find((d) => d.taken === null)
  const pct = todayDoses.length ? Math.round((takenCount / todayDoses.length) * 100) : 0

  return (
    <div className="card card-pad-sm">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="history-item-icon" style={{ background: `${med.color}1a`, color: med.color }}>
          <PillIcon />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h4 style={{ fontSize: 15.5 }}>{med.name}</h4>
          <p className="muted small">{med.dosage} · {med.doseCount}×/day</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong className="small" style={{ color: 'var(--gray-800)' }}>{takenCount}/{todayDoses.length}</strong>
          <p className="small muted">taken today</p>
        </div>
      </div>

      <div className="med-dose-row">
        {todayDoses.map((dose) => (
          <button
            key={dose.id}
            className={`check-pill ${dose.taken === true ? 'on' : dose.taken === false ? 'off' : ''}`}
            onClick={() => onToggle(med.id, dose.id)}
            disabled={scheduledToday === 0 && dose.taken === null}
          >
            {dose.taken === true ? <Check /> : dose.taken === false ? <X /> : <Clock />}
            {dose.time} {dose.taken === true ? 'Taken' : dose.taken === false ? 'Missed' : 'Pending'}
          </button>
        ))}
      </div>

      {pending && (
        <p className="small" style={{ marginTop: 10, color: 'var(--brand-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Bell size={14} /> Next dose due {humanDuration(pending.inMinutes)}
        </p>
      )}
    </div>
  )
}

function PillIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="6" width="18" height="12" rx="6" transform="rotate(45 12 12)" />
    </svg>
  )
}
