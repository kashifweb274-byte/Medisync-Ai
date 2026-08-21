import { useState } from 'react'
import { Video, MapPin } from 'lucide-react'

/**
 * SlotPicker — renders ranked slots from the slotAllocator grouped by day.
 * @param {Array<{date, time, end, score, recommended}>} slots
 */
export function SlotPicker({ slots, selected, onSelect }) {
  const [date, setDate] = useState(null)

  // Group by date
  const days = []
  const map = {}
  slots.forEach((s) => {
    if (!map[s.date]) {
      map[s.date] = { date: s.date, slots: [] }
      days.push(map[s.date])
    }
    map[s.date].slots.push(s)
  })
  const activeDate = date ?? days[0]?.date ?? null
  const activeSlots = map[activeDate]?.slots ?? []

  return (
    <div className="fade-up">
      <div className="slot-days">
        {days.slice(0, 7).map((d) => (
          <button key={d.date} className={`slot-day ${d.date === activeDate ? 'active' : ''}`} onClick={() => setDate(d.date)}>
            <span className="dow">{new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span className="day">{new Date(`${d.date}T12:00:00`).getDate()}</span>
            <span className="avail">{d.slots.length} free</span>
          </button>
        ))}
      </div>
      <div className="slot-grid" style={{ marginTop: 16 }}>
        {activeSlots.map((s) => (
          <button
            key={s.time}
            className={`slot-btn ${selected?.date === activeDate && selected?.time === s.time ? 'selected' : ''} ${s.recommended ? 'recommended' : ''}`}
            onClick={() => onSelect({ date: activeDate, time: s.time, end: s.end, doctorId: null })}
          >
            <span className="slot-time">{s.time}</span>
            {s.recommended && <span className="slot-tag ai">✨ Recommended</span>}
            {s.score > 80 && <span className="slot-score">{s.score}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
