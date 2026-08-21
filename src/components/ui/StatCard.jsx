export default function StatCard({ icon: Icon, iconTone, tone, value, label, trend, trendDir = 'up', suffix }) {
  const _tone = iconTone || tone || 'teal'
  const tones = { teal: '#e0f2fe', blue: '#dbeafe', green: '#d1fae5', amber: '#fef3c7', red: '#fee2e2' }
  const colors = { teal: '#0e7490', blue: '#2563eb', green: '#059669', amber: '#d97706', red: '#dc2626' }
  return (
    <div className="card card-pad-sm stat-card">
      <div className="stat-icon" style={{ background: tones[_tone], color: colors[_tone] }}>
        <Icon />
      </div>
      <div className="stat-value">
        {value}
        {suffix && <span className="muted" style={{ fontSize: 18 }}> {suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
      {trend && (
        <span className={`stat-trend ${trendDir}`}>
          <Arrow icon={trendDir} />
          {trend}
        </span>
      )}
    </div>
  )
}

function Arrow({ icon }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {icon === 'down' ? (
        <path d="M12 5v14M19 12l-7 7-7-7" />
      ) : (
        <path d="M12 19V5M5 12l7-7 7 7" />
      )}
    </svg>
  )
}
