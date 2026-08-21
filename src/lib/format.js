/**
 * Shared formatting + date helpers.
 */

const pad = (n) => String(n).padStart(2, '0')

/** "2026-08-12" -> "Aug 12, 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T12:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** ISO date -> weekday short name */
export function weekdayShort(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

/** ISO date -> "Mon, Aug 12" */
export function weekdayLong(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/** ISO date -> "August 12, 2026" */
export function fullDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

/** "14:30" -> "2:30 PM" */
export function formatTime(time) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${pad(m)} ${ampm}`
}

/** ISO date -> today? tomorrow? "in 3 days"? */
export function relativeDay(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(`${dateStr}T00:00:00`)
  const diff = Math.round((d - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return formatDate(dateStr)
}

/** Today as ISO (yyyy-mm-dd) */
export function todayISO() {
  return toISO(new Date())
}

export function toISO(d) {
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  return `${y}-${m}-${day}`
}

/** Add n days to an ISO date */
export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** Minutes until a time on a date; negative if past */
export function minutesUntil(dateStr, time) {
  const [h, m] = time.split(':').map(Number)
  const target = new Date(`${dateStr}T${time}:00`)
  const now = new Date()
  return Math.round((target - now) / 60000)
}

/** Human friendly "in 3h 20m" */
export function humanDuration(minutes) {
  if (minutes < 0) return 'now'
  if (minutes < 60) return `in ${Math.round(minutes)}m`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m ? `in ${h}h ${m}m` : `in ${h}h`
}

/** "Aarav Mehta" -> "AM" */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function money(n) {
  return `₹${n.toLocaleString('en-IN')}`
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}
