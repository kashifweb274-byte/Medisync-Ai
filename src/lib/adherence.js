/**
 * Medication adherence engine.
 *
 * Computes adherence metrics from a dose log: overall %, 7-day trend, streak,
 * next scheduled dose and per-day taken/scheduled counts.
 */

import { addDays, todayISO } from './format'

/**
 * @param {Array<object>} meds  [{ id, doses: [{ id, time, taken: boolean|null, date }] }]
 * @returns {object} metrics + per-day chart series
 */
export function computeAdherence(meds) {
  const today = todayISO()
  const days = []
  for (let i = 6; i >= 0; i--) {
    days.push(addDays(today, -i))
  }

  // Aggregate all doses across meds for the last 7 days
  const byDay = days.reduce((acc, d) => {
    acc[d] = { scheduled: 0, taken: 0, skipped: 0 }
    return acc
  }, {})

  let totalScheduled = 0
  let totalTaken = 0

  meds.forEach((med) => {
    ;(med.doses || []).forEach((dose) => {
      if (byDay[dose.date] === undefined) return
      byDay[dose.date].scheduled += 1
      totalScheduled += 1
      if (dose.taken) {
        byDay[dose.date].taken += 1
        totalTaken += 1
      }
      if (dose.taken === false) {
        byDay[dose.date].skipped += 1
      }
    })
  })

  const percent = totalScheduled ? Math.round((totalTaken / totalScheduled) * 100) : 0

  // Streak = consecutive days (ending today or yesterday) where every scheduled dose was taken
  let streak = 0
  let cursor = today
  if (byDay[today]?.scheduled && byDay[today]?.taken === byDay[today]?.scheduled) {
    streak = 1
  }
  for (let i = 1; i <= 30; i++) {
    const d = addDays(today, -i)
    const day = byDay[d]
    if (day?.scheduled && day.taken === day.scheduled) streak += 1
    else break
  }

  // Next upcoming dose (from all meds)
  const now = new Date()
  const allDoses = meds
    .flatMap((med) => med.doses || [])
    .filter((d) => d.date === today && d.taken === null && d.time)
    .sort((a, b) => a.time.localeCompare(b.time))

  let nextDose = null
  if (allDoses.length) {
    const [h, m] = allDoses[0].time.split(':').map(Number)
    const dueAt = new Date()
    dueAt.setHours(h, m, 0, 0)
    nextDose = { time: allDoses[0].time, inMinutes: Math.round((dueAt - now) / 60000) }
    if (nextDose.inMinutes < 0) nextDose.inMinutes = 0
  }

  const series = days.map((d) => ({
    day: d,
    label: new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
    taken: byDay[d].taken,
    scheduled: byDay[d].scheduled,
    percent: byDay[d].scheduled ? Math.round((byDay[d].taken / byDay[d].scheduled) * 100) : null,
  }))

  return {
    percent,
    totalScheduled,
    totalTaken,
    missed: totalScheduled - totalTaken,
    streak,
    nextDose,
    series,
  }
}
