import { useState, useEffect } from 'react'
import { CalendarClock, Save, Sun, Lock, Sparkles, Clock, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useData } from '../../context/DataContext'
import Badge from '../../components/ui/Badge'
import { formatTime, todayISO, weekdayLong } from '../../lib/format'

// Backend Port URL (agar aapka backend kisi doosre port par h toh yahan update kar dein)
const API_BASE_URL = 'http://localhost:5000'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon → Sun display order

const DEFAULT_SCHEDULE = [
  { day: 0, start: '09:00', end: '17:00', on: false }, // Sun
  { day: 1, start: '09:00', end: '18:00', on: true },  // Mon
  { day: 2, start: '09:00', end: '18:00', on: true },  // Tue
  { day: 3, start: '09:00', end: '18:00', on: true },  // Wed
  { day: 4, start: '09:00', end: '18:00', on: true },  // Thu
  { day: 5, start: '09:00', end: '18:00', on: true },  // Fri
  { day: 6, start: '09:00', end: '14:00', on: true },  // Sat
]

function buildSlots(start, end) {
  if (!start || !end) return []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const slots = []
  let cur = sh * 60 + sm
  const last = eh * 60 + em
  while (cur < last) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`)
    cur += 30
  }
  return slots
}

export default function DoctorSchedule() {
  const { toast } = useData()
  const [draft, setDraft] = useState(DEFAULT_SCHEDULE)
  const [bookedTimes, setBookedTimes] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const today = todayISO()

  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      // 1. Fetch Doctor Schedule
      try {
        const schedRes = await axios.get(`${API_BASE_URL}/api/doctors/schedule`, { headers })
        const rawSchedule = schedRes.data?.schedule || schedRes.data?.weeklyHours || schedRes.data?.data

        if (Array.isArray(rawSchedule) && rawSchedule.length > 0) {
          const normalized = rawSchedule.map((item, idx) => ({
            day: typeof item.day === 'number' ? item.day : idx,
            start: item.start || '09:00',
            end: item.end || '18:00',
            on: item.on !== undefined ? Boolean(item.on) : Boolean(item.available),
          }))
          setDraft(normalized)
        }
      } catch (err) {
        console.warn('Schedule backend endpoint unavailable, using default schedule fallback.')
        // Red error toast nahi dikhayega agar backend response na de, quiet fallback use hoga
      }

      // 2. Fetch Today's Appointments
      try {
        const apptRes = await axios.get(`${API_BASE_URL}/api/appointments/doctor`, { headers })
        const appointments = apptRes.data?.appointments || apptRes.data?.data
        if (Array.isArray(appointments)) {
          const todayBookings = appointments
            .filter((a) => a.date === today && a.status !== 'cancelled')
            .map((a) => a.timeSlot)
          setBookedTimes(new Set(todayBookings))
        }
      } catch (err) {
        console.warn('Appointments fetch skipped or failed:', err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorSchedule()
  }, [today])

  const setDay = (index, patch) => {
    setDraft((days) => days.map((d) => (d.day === index ? { ...d, ...patch } : d)))
  }

  const save = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      await axios.post(
        `${API_BASE_URL}/api/doctors/schedule`,
        { schedule: draft, weeklyHours: draft },
        { headers }
      )
      toast('Schedule saved — live for patients', 'success')
    } catch (err) {
      console.error('Error saving schedule:', err)
      toast('Failed to save schedule', 'error')
    } finally {
      setSaving(false)
    }
  }

  const todayIdx = new Date().getDay()
  const todaySchedule = draft.find((d) => d.day === todayIdx) || draft[todayIdx]
  const freeSlots = todaySchedule?.on ? buildSlots(todaySchedule.start, todaySchedule.end) : []

  const openCount = draft.filter((d) => d.on).length
  const weekMinutes = draft.reduce((sum, d) => {
    if (!d.on) return sum
    const [sh, sm] = d.start.split(':').map(Number)
    const [eh, em] = d.end.split(':').map(Number)
    return sum + (eh * 60 + em - (sh * 60 + sm))
  }, 0)

  if (loading) {
    return (
      <div className="empty" style={{ padding: '60px 0' }}>
        <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: 'var(--brand-600)' }} />
        <p className="small muted" style={{ marginTop: 12 }}>Loading schedule...</p>
      </div>
    )
  }

  return (
    <div className="fade-up">
      <div className="page-head">
        <div>
          <h1>My schedule</h1>
          <p>Set your weekly clinic hours. Changes go live instantly and drive the AI slot allocator patients see.</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
          {saving ? 'Saving...' : 'Save schedule'}
        </button>
      </div>

      <div className="portal-card-grid" style={{ alignItems: 'flex-start' }}>
        {/* Weekly editor */}
        <div>
          <div className="card">
            <div className="section-head" style={{ marginBottom: 8 }}>
              <h2 style={{ fontSize: 17 }}>Weekly hours</h2>
              <Badge tone="teal">{openCount} working day{openCount === 1 ? '' : 's'}</Badge>
            </div>
            <p className="small muted" style={{ marginBottom: 6 }}>
              {openCount} day{openCount === 1 ? '' : 's'} open · {Math.round((weekMinutes / 60) * 10) / 10} hrs / week
            </p>

            {ORDER.map((dayIdx) => {
              const d = draft.find((item) => item.day === dayIdx) || draft[dayIdx] || DEFAULT_SCHEDULE[dayIdx]
              return (
                <div key={dayIdx} className="sched-day-row">
                  <div className="sched-day-name">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span className="icon-btn" style={{ width: 26, height: 26 }}>
                        <Sun size={14} style={{ color: d.on ? 'var(--brand-600)' : 'var(--gray-300)' }} />
                      </span>
                      {d.day === 0 ? 'Sunday' : DAY_NAMES[d.day]}
                    </span>
                  </div>
                  <div className="sched-times">
                    <input
                      type="time"
                      className="input"
                      value={d.start}
                      disabled={!d.on}
                      onChange={(e) => setDay(d.day, { start: e.target.value })}
                      aria-label={`${DAY_NAMES[d.day]} start time`}
                    />
                    <span className="muted">to</span>
                    <input
                      type="time"
                      className="input"
                      value={d.end}
                      disabled={!d.on}
                      onChange={(e) => setDay(d.day, { end: e.target.value })}
                      aria-label={`${DAY_NAMES[d.day]} end time`}
                    />
                    <span className="sched-chips">
                      <span className={`sched-chip ${d.on ? 'free' : ''}`}>{d.on ? 'Available' : 'Off'}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`switch ${d.on ? 'on' : ''}`}
                    onClick={() => setDay(d.day, { on: !d.on })}
                    aria-pressed={d.on}
                    aria-label={`Toggle ${DAY_NAMES[d.day]}`}
                  />
                </div>
              )
            })}

            <div className="care-strip" style={{ marginTop: 14 }}>
              <Lock size={14} /> Changes sync to booking in real time for all patients.
            </div>
          </div>
        </div>

        {/* Today preview */}
        <div>
          <div className="card">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 17 }}>Today · {weekdayLong(today)}</h2>
              <Badge tone={todaySchedule?.on ? 'green' : 'gray'} dot>
                {todaySchedule?.on ? 'Open' : 'Closed'}
              </Badge>
            </div>

            {!todaySchedule?.on ? (
              <div className="empty" style={{ padding: '24px 12px' }}>
                <CalendarClock style={{ width: 40, height: 40, color: 'var(--gray-300)' }} />
                <p className="small muted" style={{ marginTop: 8 }}>You're off today. No slots available for patients.</p>
              </div>
            ) : (
              <>
                <p className="small muted" style={{ marginBottom: 12 }}>
                  <Clock size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                  {formatTime(todaySchedule.start)} – {formatTime(todaySchedule.end)} · 30-minute slots
                </p>
                <div className="slot-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))' }}>
                  {freeSlots.map((t) => {
                    const booked = bookedTimes.has(t)
                    return (
                      <button key={t} type="button" className="slot-btn" disabled={booked} style={{ opacity: booked ? 0.45 : 1 }}>
                        <span className="slot-time">{formatTime(t)}</span>
                        {booked ? (
                          <span className="slot-tag" style={{ color: 'var(--danger)' }}>Booked</span>
                        ) : (
                          <span className="slot-tag ai">Free</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="small muted" style={{ marginTop: 12 }}>
                  <Sparkles size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
                  {bookedTimes.size} of {freeSlots.length} slots booked today. Free slots are offered to patients through the smart allocator.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}