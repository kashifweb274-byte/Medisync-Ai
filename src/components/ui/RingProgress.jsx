import { useState } from 'react'
import Badge from './Badge'

/**
 * RingProgress — circular progress with color based on value thresholds.
 * Pass a `color` from 'auto' (green/amber/red by value) or 'brand'.
 */
export default function RingProgress({ value = 0, size = 88, stroke = 9, label, sublabel, color = 'auto', max = 100 }) {
  const [hovered, setHovered] = useState(false)
  const pct = Math.max(0, Math.min(max, value)) / max
  const C = 2 * Math.PI * ((size - stroke) / 2)
  const offset = C * (1 - pct)
  const tone =
    color === 'brand'
      ? 'var(--brand-600)'
      : value >= 80
        ? 'var(--danger)'
        : value >= 60
          ? 'var(--warning)'
          : 'var(--success)'

  return (
    <div className="ring-progress" style={{ width: size, height: size }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-bg" cx={size / 2} cy={size / 2} r={(size - stroke) / 2} />
        <circle
          className="ring-fg"
          cx={size / 2}
          cy={size / 2}
          r={(size - stroke) / 2}
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ stroke: tone }}
        />
      </svg>
      <div className="ring-label">
        <strong>{label ?? `${Math.round(value)}%`}</strong>
        {sublabel && <small>{hovered ? 'of target' : sublabel}</small>}
      </div>
    </div>
  )
}
