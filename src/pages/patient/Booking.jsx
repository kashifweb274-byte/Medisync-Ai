import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Video,
  MapPin,
  Star,
  Clock,
  Languages,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { SlotPicker } from '../../components/feature/SlotPicker'
import { allocateSlots, TIME_OF_DAY } from '../../lib/slotAllocator'
import { formatTime, relativeDay, money } from '../../lib/format'
import API from '../../api'
import { getAvailability as seedGetAvailability } from '../../data/seed'

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { savedSlots, toast } = useData()
  const [mode, setMode] = useState('video')
  const [pref, setPref] = useState('morning')
  const [urgency, setUrgency] = useState(false)
  const [selected, setSelected] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [doctor, setDoctor] = useState(null)
  const [doctorLoading, setDoctorLoading] = useState(true)

  // Fetch doctor details from API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setDoctorLoading(true)
        setError(null)
        const response = await API.get(`/doctors/${id}`)
        const data = response.data.doctor || response.data
        setDoctor(data)
      } catch (err) {
        console.error('Fetch doctor error:', err)
        setError(err.response?.data?.message || 'Failed to load doctor details')
      } finally {
        setDoctorLoading(false)
      }
    }
    fetchDoctor()
  }, [id])

  // Get availability from doctor data (from API) or fallback to seed
  const availability = useMemo(() => {
    if (doctor?.availability && doctor.availability.length > 0) {
      const windows = []
      const start = new Date()
      for (let i = 0; i < 14; i++) {
        const dow = (start.getDay() + i) % 7
        if (doctor.availability.includes(dow)) {
          const date = new Date(start)
          date.setDate(start.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          windows.push({ date: dateStr, start: '09:00', end: '18:00' })
        }
      }
      return windows
    }
    return seedGetAvailability(id)
  }, [doctor, id])

  const slots = useMemo(() => {
    const booked = savedSlots.filter((s) => {
      return availability.some((a) => a.date === s.date && s.time >= a.start)
    })
    return allocateSlots({
      availability,
      bookings: booked,
      slotDuration: 30,
      patientPrefs: { timeOfDay: pref, urgency },
      mode,
      daysAhead: 14,
    })
  }, [availability, savedSlots, pref, urgency, mode])

  if (doctorLoading) {
    return (
      <div className="fade-up">
        <Link to="/patient/doctors" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
          <ArrowLeft /> Back to doctors
        </Link>
        <div className="portal-card-grid" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="skeleton-row" style={{ marginBottom: '16px' }}>
                <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '50%', height: '28px', borderRadius: 'var(--r-sm)', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ width: '30%', height: '16px', borderRadius: 'var(--r-sm)', marginBottom: '6px' }} />
                  <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: 'var(--r-sm)' }} />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="skeleton" style={{ height: '24px', width: '30%', borderRadius: 'var(--r-sm)', marginBottom: '16px' }} />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '56px', borderRadius: 'var(--r-md)', marginBottom: '14px' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="card">
              <div className="skeleton" style={{ height: '24px', width: '30%', borderRadius: 'var(--r-sm)', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '14px', width: '60%', borderRadius: 'var(--r-sm)', marginBottom: '14px' }} />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '48px', borderRadius: 'var(--r-md)', marginBottom: '8px' }} />
              ))}
              <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--r-md)', marginTop: '20px' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="fade-up">
        <div className="empty">
          <AlertTriangle style={{ width: 48, height: 48, color: 'var(--gray-300)' }} />
          <h4>Doctor not found</h4>
          <p>This doctor may no longer be available.</p>
          <Link to="/patient/doctors" className="btn btn-primary">Browse doctors</Link>
        </div>
      </div>
    )
  }

  const handleConfirm = async () => {
    if (!selected || loading) return

    // 1. Mandatory input check for reason
    if (!reason.trim()) {
      setError('Please enter reason for visit / symptoms.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // The doctor API exposes both a Doctor profile id and its User id.
      // Prefer the profile id; the server also accepts a User id for compatibility.
      const doctorBookingId = doctor._id || doctor.id || doctor.userId || id

      if (!doctorBookingId) {
        setError('This doctor has no valid booking profile. Please return to the doctors list and try again.')
        return
      }

      const response = await API.post('/appointments/book', {
        doctorId: doctorBookingId,
        date: selected.date,
        timeSlot: selected.time,
        mode,
        reason: reason.trim(),
      })

      if (response.data.success || response.status === 200 || response.status === 201) {
        toast('Appointment booked successfully! Waiting for doctor confirmation.', 'success')
        navigate('/patient/appointments')
      } else {
        setError(response.data.message || 'Failed to book appointment')
      }
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <Link to="/patient/doctors" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>
        <ArrowLeft /> Back to doctors
      </Link>

      <div className="portal-card-grid" style={{ alignItems: 'flex-start' }}>
        {/* Left: doctor info + options */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="doctor-card">
              <Avatar name={doctor.name} size="xl" />
              <div className="doctor-card-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 22 }}>{doctor.name}</h1>
                  {doctor.online && <Badge tone="green" dot>Online</Badge>}
                </div>
                <p className="doctor-spec">{doctor.specialty}</p>
                <div className="doctor-meta">
                  <span><Star size={14} fill="#f59e0b" /> {doctor.rating} ({doctor.reviews})</span>
                  <span>{doctor.experience} yrs experience</span>
                  <span><MapPin /> {doctor.location}</span>
                  <span><Languages /> {doctor.languages?.join(', ')}</span>
                </div>
                <p className="small" style={{ color: 'var(--gray-600)', marginTop: 8 }}>{doctor.about}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Appointment details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label className="small" style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Appointment type</label>
                <div className="segmented" style={{ width: '100%' }}>
                  <button className={mode === 'video' ? 'active' : ''} style={{ flex: 1 }} onClick={() => setMode('video')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Video size={14} /> Video call · {money(doctor.videoFee)}</span>
                  </button>
                  <button className={mode === 'inperson' ? 'active' : ''} style={{ flex: 1 }} onClick={() => setMode('inperson')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> In-person · {money(doctor.fee)}</span>
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="small" style={{ color: 'var(--gray-600)', fontWeight: 600 }}>Preferred time of day</label>
                <div className="segmented" style={{ width: '100%' }}>
                  {Object.values(TIME_OF_DAY).map((t) => (
                    <button key={t} className={pref === t ? 'active' : ''} style={{ flex: 1 }} onClick={() => setPref(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className={`switch ${urgency ? 'on' : ''}`} onClick={() => setUrgency(!urgency)} />
                <span className="small" style={{ fontWeight: 500 }}>Urgent appointment</span>
                <span className="small muted">— prioritizes earliest slots</span>
              </div>

              <div className="field">
                <label className="small" style={{ color: 'var(--gray-600)', fontWeight: 600 }}>
                  Reason for visit / Symptoms <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="Describe your symptoms, reason for visit, or any concerns..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid var(--gray-300)',
                    borderRadius: 'var(--r-md)',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand-500)'
                    e.target.style.boxShadow = '0 0 0 3px var(--brand-100)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--gray-300)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
                <p className="small muted" style={{ marginTop: 4 }}>
                  This helps the doctor prepare for your consultation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: slot picker */}
        <div>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Choose a time slot</h3>
            <p className="small muted" style={{ marginBottom: 14 }}>
              AI engine ranks slots by preference, lead time, contiguity and mode suitability.
            </p>
            {slots.length ? (
              <SlotPicker 
                slots={slots} 
                selected={selected} 
                onSelect={(s) => {
                  setSelected(s)
                  if (error) setError(null)
                }} 
              />
            ) : (
              <p className="small muted">No availability for these preferences in the next 14 days.</p>
            )}
            {error && (
              <div className="card" style={{ marginTop: 16, background: 'var(--danger-soft)', borderColor: 'var(--danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
                  <AlertTriangle size={16} />
                  <span className="small">{error}</span>
                </div>
              </div>
            )}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {selected && (
                <p className="small" style={{ color: 'var(--gray-600)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--success)', verticalAlign: -2, marginRight: 4 }} />
                  Selected: <strong>{relativeDay(selected.date)}</strong> at <strong>{formatTime(selected.time)}</strong> · {mode === 'video' ? 'Video call' : 'In-person'}
                </p>
              )}
              <button
                className="btn btn-primary btn-block btn-lg"
                disabled={!selected || loading}
                onClick={handleConfirm}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Confirm appointment · {money(mode === 'video' ? doctor.videoFee : doctor.fee)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
