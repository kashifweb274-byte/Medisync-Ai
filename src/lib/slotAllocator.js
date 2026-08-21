/**
 * Smart time-slot allocation engine.
 *
 * Given a doctor's availability windows, an already-booked set of slots, the
 * requested appointment type (video / in-person) and the patient's preferred
 * time of day, this engine generates candidate slots and scores each one so
 * the UI can present them ranked with a "Recommended" pick.
 */

import { addDays, todayISO } from './format'

export const TIME_OF_DAY = { MORNING: 'morning', AFTERNOON: 'afternoon', EVENING: 'evening' }

const PREFERENCE_WINDOW = {
  morning: [9, 12],
  afternoon: [12, 16],
  evening: [16, 20],
}

/** Convert "HH:MM" -> minutes since midnight */
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** minutes since midnight -> "HH:MM" */
const toTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/**
 * @param {object} opts
 * @param {Array<{date:string, start:string, end:string}>} availability
 *   The doctor's free windows (a window may span the whole day).
 * @param {Array<{date:string, time:string}>} bookings  Already-taken slots.
 * @param {object} patientPrefs  { timeOfDay, urgency }
 * @returns {Array<{date:string, time:string, end:string, score:number, recommended:boolean, preference:boolean}>}
 */
export function allocateSlots({
  availability = [],
  bookings = [],
  slotDuration = 30,
  patientPrefs = {},
  mode = 'video',
  daysAhead = 14,
}) {
  const startDate = todayISO()
  const booked = new Map()
  bookings.forEach((b) => {
    if (!booked.has(b.date)) booked.set(b.date, new Set())
    booked.get(b.date).add(b.time)
  })

  const pref = patientPrefs.timeOfDay || null
  const urgency = !!patientPrefs.urgency
  const [prefStart, prefEnd] = pref ? PREFERENCE_WINDOW[pref] : [0, 1440]

  const slots = []

  for (let day = 0; day < daysAhead; day++) {
    const date = addDays(startDate, day)
    const windows = availability.filter((w) => w.date === date)
    if (!windows.length) continue

    for (const win of windows) {
      let cursor = toMin(win.start)
      const endMin = toMin(win.end)
      while (cursor + slotDuration <= endMin) {
        const time = toTime(cursor)
        const taken = booked.get(date)?.has(time)
        if (!taken) {
          const startH = cursor / 60
          let score = 50

          // 1. Patient time-of-day preference fit (+0..+25)
          if (pref) {
            const morningness = startH >= prefStart && startH < prefEnd
            if (morningness) score += 25
            else score -= 12
          }

          // 2. Lead time — sooner is better, but a little buffer is nicer for prep (+0..+10)
          const lead = day
          if (lead === 0) score += 6
          else if (lead <= 2) score += 10
          else if (lead <= 5) score += 4
          else score += 1

          // 3. Contiguity — first slot of a free run is marginally better
          const prevTaken = booked.get(date)?.has(toTime(cursor - slotDuration))
          if (!prevTaken) score += 5

          // 4. Online mode slightly prefers early hours; offline prefers late morning
          if (mode === 'video') score += startH >= 8 && startH < 12 ? 3 : 0
          else score += startH >= 11 && startH < 16 ? 3 : 0

          // 5. Urgency — compress to earliest slots
          if (urgency) score += Math.max(0, 12 - lead * 3)

          score = Math.max(0, Math.min(99, Math.round(score)))

          slots.push({
            date,
            time,
            end: toTime(cursor + slotDuration),
            score,
            preference: pref ? (startH >= prefStart && startH < prefEnd) : false,
          })
        }
        cursor += slotDuration
      }
    }
  }

  slots.sort((a, b) => b.score - a.score)

  // Mark the top-scoring slot (and any near-tie) as "recommended"
  const topScore = slots[0]?.score ?? 0
  return slots.map((s) => ({
    ...s,
    recommended: s.score >= topScore - 4 && s.score > 60,
  }))
}
