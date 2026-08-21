import { useState, useEffect } from 'react'
import {
  CalendarDays,
  X,
  Check,
  CheckCircle2,
  Video,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Avatar } from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { formatTime } from '../../lib/format'
import API from '../../api'

const STATUS_TONE = {
  pending: 'amber',
  confirmed: 'teal',
  completed: 'green',
  cancelled: 'gray',
}

const TABS = [
  { key: 'upcoming', label: 'Upcoming', statuses: ['confirmed', 'pending'] },
  { key: 'completed', label: 'Completed', statuses: ['completed', 'cancelled'] },
]

export default function DoctorAppointments() {
  const { toast } = useData() || { toast: () => {} }
  const [tab, setTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const getParsedDate = (dateStr) => {
    if (!dateStr) return new Date()
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? new Date() : d
  }

  const formatDisplayDate = (dateStr) => {
    const d = getParsedDate(dateStr)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPatientName = (appt) => appt.patientId?.name || appt.patientName || 'Patient'

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await API.get('/appointments/doctor')
      const data = response.data.appointments || response.data
      setAppointments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch doctor appointments error:', err)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, nextStatus) => {
    if (nextStatus === 'cancelled' && !window.confirm('Are you sure you want to cancel this appointment?')) {
      return
    }

    setActionLoading(id)
    try {
      try {
        await API.patch(`/appointments/${id}/status`, { status: nextStatus })
      } catch {
        await API.patch(`/appointments/${id}/${nextStatus}`)
      }

      setAppointments((prev) =>
        prev.map((a) => {
          const currentId = a._id || a.id
          return currentId === id ? { ...a, status: nextStatus } : a
        })
      )

      const statusMessages = {
        confirmed: 'Appointment confirmed successfully',
        cancelled: 'Appointment cancelled successfully',
        completed: 'Appointment marked as completed',
      }
      toast(statusMessages[nextStatus] || 'Status updated', 'success')
    } catch (err) {
      console.error('Status update error:', err)
      toast(err.response?.data?.message || 'Failed to update appointment status', 'danger')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter((a) => {
    const tabConfig = TABS.find((t) => t.key === tab)
    return tabConfig?.statuses.includes(a.status)
  })

  if (loading) {
    return (
      <div className="fade-up">
        <div className="page-head">
          <div>
            <h1>My Appointments</h1>
            <p>Manage upcoming consultations and view your appointment history.</p>
          </div>
        </div>
        <div className="card" style={{ padding: '24px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-row" style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
              <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '40%', height: '18px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '60%', height: '14px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1>Appointments</h1>
          <p>Review and manage consultations booked with you.</p>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="badge" style={{ marginLeft: 6 }}>
              {appointments.filter((a) => t.statuses.includes(a.status)).length}
            </span>
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card" style={{ padding: '48px' }}>
          <EmptyState
            icon={CalendarDays}
            title={tab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            message={
              tab === 'upcoming'
                ? "You don't have any scheduled appointments right now."
                : 'Your completed or cancelled appointment history will appear here.'
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredAppointments.map((a) => {
            const apptId = a._id || a.id
            const patientName = getPatientName(a)
            const dateObj = getParsedDate(a.date)
            const isPending = a.status === 'pending'
            const isConfirmed = a.status === 'confirmed'
            const isActionable = isPending || isConfirmed
            const isLoadingThis = actionLoading === apptId

            return (
              <div key={apptId} className="card card-pad-sm">
                <div className="appt-card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className={`appt-date ${!isActionable ? 'past' : ''}`}>
                    <span className="month">
                      {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="day">{dateObj.getDate()}</span>
                  </div>

                  <div className="appt-main" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <Avatar name={patientName} size="sm" />
                      <div>
                        <h4 style={{ fontSize: 15, marginBottom: 2 }}>{patientName}</h4>
                        <span className="small" style={{ color: 'var(--gray-500)' }}>
                          {a.patientId?.email || 'Patient consultation'}
                        </span>
                      </div>
                      <Badge tone={STATUS_TONE[a.status] || 'gray'}>{a.status}</Badge>
                    </div>

                    <div className="appt-line" style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <CalendarDays size={14} />
                      <span>
                        {formatDisplayDate(a.date)} &middot; {formatTime(a.timeSlot || a.time)}
                      </span>
                      <span style={{ color: 'var(--gray-400)' }}>&middot;</span>
                      {a.mode === 'video' ? <Video size={14} /> : <MapPin size={14} />}
                      <span>{a.mode === 'video' ? 'Video call' : 'In-person'}</span>
                    </div>

                    {a.reason && (
                      <div className="appt-line" style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Clock size={14} />
                        <span className="small">Reason: {a.reason}</span>
                      </div>
                    )}
                  </div>

                  <div className="appt-actions" style={{ display: 'flex', gap: 8 }}>
                    {isLoadingThis ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        {/* Confirm Action for Pending */}
                        {isPending && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdateStatus(apptId, 'confirmed')}
                          >
                            <Check size={14} /> Accept
                          </button>
                        )}

                        {/* Complete & Video Join Actions for Confirmed */}
                        {isConfirmed && (
                          <>
                            {a.mode === 'video' && (
                              <Link className="btn btn-secondary btn-sm" to={`/doctor/video-call?room=${apptId}`}>
                                <Video size={14} /> Start Call
                              </Link>
                            )}
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateStatus(apptId, 'completed')}
                            >
                              <CheckCircle2 size={14} /> Complete
                            </button>
                          </>
                        )}

                        {/* Cancel Action */}
                        {isActionable && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateStatus(apptId, 'cancelled')}
                          >
                            <X size={14} /> Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}