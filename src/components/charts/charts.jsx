import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { Activity, TrendingUp, HeartPulse } from 'lucide-react'

export function VitalsChart({ data, metric = 'bpSystolic', color = '#0891b2' }) {
  return (
    <div style={{ height: 220, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={46} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 8px 24px rgba(8,51,68,.1)' }}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#grad-${metric})`} name={metricLabel(metric)} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdherenceChart({ series }) {
  return (
    <div style={{ height: 220, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={46} unit="%" />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.12)' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13, boxShadow: '0 8px 24px rgba(8,51,68,.1)' }}
            formatter={(v) => [`${v}%`, 'Adherence']}
          />
          <Bar dataKey="percent" fill="#0891b2" radius={[6, 6, 0, 0]} maxBarSize={38} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RiskGauge({ score }) {
  const color = score >= 70 ? '#dc2626' : score >= 40 ? '#d97706' : '#059669'
  const pct = (score / 100) * 270 // 270° arc
  return (
    <div style={{ position: 'relative', width: 180, height: 110, margin: '0 auto' }}>
      <svg viewBox="0 0 200 120" width="180" height="110">
        <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${pct} 270`}
          style={{ transition: 'all 0.8s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 12 }}>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 1, color: 'var(--gray-900)' }}>{score}</strong>
        <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>risk score</span>
      </div>
    </div>
  )
}

function metricLabel(m) {
  const map = {
    bpSystolic: 'Systolic BP',
    glucose: 'Fasting glucose',
    heartRate: 'Heart rate',
    spo2: 'SpO₂',
  }
  return map[m] || m
}
