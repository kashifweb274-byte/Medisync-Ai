import { CheckCircle2, AlertCircle, Info, TriangleAlert } from 'lucide-react'
import { useData } from '../context/DataContext'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
}

export default function Toasts() {
  const { toasts, dismissToast } = useData()
  if (!toasts.length) return null
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info
        return (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <Icon />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button className="icon-btn" style={{ color: '#94a3b8' }} onClick={() => dismissToast(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
