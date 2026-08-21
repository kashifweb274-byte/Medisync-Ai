import { Avatar } from '../ui/Avatar'
import { formatDate, weekdayLong, formatTime, initials, money } from '../../lib/format'
import { doctors } from '../../data/seed'
import Badge from '../ui/Badge'
import { Video, MapPin, Calendar, Repeat, CheckCircle2 } from 'lucide-react'

const STATUS_TONE = {
  upcoming: 'teal',
  pending: 'amber',
  completed: 'green',
  cancelled: 'gray',
  requested: 'amber',
}

export function AppointmentCard({ appt, actions, showDoctor = true }) {
  const doc = doctors.find((d) => d.id === appt.doctorId)
  const tone = STATUS_TONE[appt.status] || 'gray'
  const past = appt.status === 'completed' || appt.status === 'cancelled'

  return (
    <div className="card card-pad-sm">
      <div className="appt-card">
        <div className={`appt-date ${past ? 'past' : ''}`}>
          <span className="month">{new Date(`${appt.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short' })}</span>
          <span className="day">{new Date(`${appt.date}T12:00:00`).getDate()}</span>
        </div>
        <div className="appt-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4>{appt.type} appointment</h4>
            <Badge tone={tone}>{appt.status}</Badge>
          </div>
          {showDoctor && (
            <div className="appt-line" style={{ marginTop: 6 }}>
              <Avatar name={doc?.name || 'Dr'} size="sm" />
              <strong style={{ color: 'var(--gray-800)' }}>{doc?.name}</strong>
              <span style={{ color: 'var(--gray-400)' }}>·</span>
              <span>{doc?.specialty}</span>
            </div>
          )}
          <div className="appt-line">
            <Calendar />
            <span>{weekdayLong(appt.date)} · {formatTime(appt.time)}</span>
            <span style={{ color: 'var(--gray-400)' }}>·</span>
            <Repeat />
            <span>{appt.mode === 'video' ? 'Video call' : 'In-person'}</span>
            <span style={{ color: 'var(--gray-400)' }}>·</span>
            <MapPin />
            <span>{appt.mode === 'video' ? 'Online' : doc?.location}</span>
          </div>
        </div>
        {actions && <div className="appt-actions">{actions}</div>}
      </div>
    </div>
  )
}
