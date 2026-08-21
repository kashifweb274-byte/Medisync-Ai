import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  ShieldAlert,
  Users,
  Stethoscope,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import { formatTime, todayISO } from '../../lib/format'

const RISK_TONE = { high: 'red', moderate: 'amber', low: 'green' }
const SEVERITY_ICON = {
  high: <AlertTriangle size={18} className="text-red-600" />,
  moderate: <Activity size={18} className="text-amber-600" />,
  low: <CheckCircle2 size={18} className="text-emerald-600" />,
}

export default function DoctorDashboard() {
  const { profile } = useAuth()
  const {
    appointments = [],
    alerts = [],
    doctorPatients = [],
    newAlertCount = 0,
    loading = false,
  } = useData() || {}

  const today = todayISO()
  const doctorId = profile?.id || profile?._id

  // Format and match appointment dates correctly (handles ISO strings)
  const todays = appointments
    .filter((a) => {
      const apptDocId = a.doctorId?._id || a.doctorId || a.doctor
      const apptDateStr = a.date ? new Date(a.date).toISOString().split('T')[0] : ''
      const isToday = apptDateStr === today || a.date === today
      const isMatchingDoc = !apptDocId || apptDocId === doctorId
      const isUpcomingStatus = ['upcoming', 'pending', 'confirmed'].includes(a.status)

      return isMatchingDoc && isToday && isUpcomingStatus
    })
    .sort((a, b) => {
      const timeA = a.timeSlot || a.time || ''
      const timeB = b.timeSlot || b.time || ''
      return timeA.localeCompare(timeB)
    })

  const pending = appointments.filter((a) => {
    const apptDocId = a.doctorId?._id || a.doctorId || a.doctor
    return (!apptDocId || apptDocId === doctorId) && a.status === 'pending'
  }).length

  const highRisk = doctorPatients.filter((p) => p.risk === 'high' || p.riskLevel === 'high').length
  const lowAdherence = doctorPatients.filter((p) => (p.adherence ?? 100) < 75)

  // Dynamic greeting logic based on time
  const hour = new Date().getHours()
  const greeting =
    hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 17
      ? 'Good afternoon'
      : hour >= 17 && hour < 22
      ? 'Good evening'
      : 'Good night'

  // Clean doctor name formatting
  const doctorRawName = profile?.name || ''
  const cleanDoctorName = doctorRawName.replace(/^Dr\.\s*|^Dr\s*/i, '').trim()
  const doctorFirstName = cleanDoctorName.split(' ')[0] || 'Doctor'

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans p-6 md:p-8 bg-slate-50/50 min-h-screen">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-xl shadow-slate-900/10">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Doctor Portal Active
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {greeting}, Dr. {doctorFirstName} 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              You have <strong className="text-white font-semibold">{todays.length} appointment{todays.length === 1 ? '' : 's'}</strong> today
              {pending > 0 && (
                <>
                  {' '}and <strong className="text-amber-300 font-semibold">{pending} pending request{pending === 1 ? '' : 's'}</strong>
                </>
              )}
              .
              {highRisk > 0 && (
                <>
                  {' '}
                  <span className="text-rose-300 font-medium">
                    {highRisk} patient{highRisk === 1 ? '' : 's'} need{highRisk === 1 ? 's' : ''} urgent attention.
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/doctor/appointments"
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" /> View appointments
            </Link>
            <Link
              to="/doctor/risk-alerts"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Risk alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={CalendarDays}
          value={todays.length}
          label="Appointments today"
          tone="teal"
          trend={todays[0] ? `Next at ${formatTime(todays[0].timeSlot || todays[0].time)}` : 'Clear day'}
          trendDir={todays.length ? 'up' : 'down'}
        />
        <StatCard
          icon={Clock}
          value={pending}
          label="Pending requests"
          tone="amber"
          trend={pending ? 'Needs review' : 'All clear'}
          trendDir="up"
        />
        <StatCard
          icon={Users}
          value={highRisk}
          label="High-risk patients"
          tone="red"
          trend={`${doctorPatients.length} under care`}
          trendDir="up"
        />
        <StatCard
          icon={ShieldAlert}
          value={newAlertCount}
          label="New alerts"
          tone="blue"
          trend={newAlertCount ? 'Act now' : 'No new alerts'}
          trendDir="up"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Schedule & Adherence Watch */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Schedule Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Schedule</h2>
                <p className="text-xs text-slate-500">Scheduled appointments and consults</p>
              </div>
              <Link
                to="/doctor/schedule"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                Manage schedule <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {todays.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No appointments today"
                message="Your day is clear. Use the time to catch up on patient follow-ups."
              />
            ) : (
              <div className="space-y-3">
                {todays.map((a) => {
                  const apptId = a._id || a.id
                  const pName = a.patientName || a.patientId?.name || 'Patient'
                  const slotTime = a.timeSlot || a.time
                  const reason = a.reason || a.symptoms

                  return (
                    <div
                      key={apptId}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-semibold text-slate-900">{pName}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {a.type || 'Consultation'} •{' '}
                            <span className="capitalize">{a.mode === 'video' ? 'Video call' : 'In-person'}</span>
                            {reason && ` • ${reason}`}
                          </p>
                        </div>
                      </div>
                      <Badge tone={a.status === 'pending' ? 'amber' : 'teal'}>
                        {formatTime(slotTime)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Adherence Watch Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Adherence Watch</h2>
                <p className="text-xs text-slate-500">Patients needing medication monitoring</p>
              </div>
              <Link
                to="/doctor/adherence"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {lowAdherence.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Adherence looks good"
                message="No patients below the 75% adherence threshold right now."
              />
            ) : (
              <div className="space-y-3">
                {lowAdherence.map((p, idx) => {
                  const pId = p.id || p._id || idx
                  const pRisk = p.risk || p.riskLevel || 'low'
                  const pAdherence = p.adherence ?? 0

                  return (
                    <div
                      key={pId}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Avatar name={p.name || 'Patient'} size="md" />
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {p.name || 'Unknown Patient'}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            {Array.isArray(p.conditions) ? p.conditions.join(' · ') : p.conditions || 'General'}
                          </p>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full rounded-full ${pAdherence < 60 ? 'bg-rose-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(100, Math.max(0, pAdherence))}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge tone={RISK_TONE[pRisk] || 'green'} dot>
                          {pRisk}
                        </Badge>
                        <p className="text-[11px] font-semibold text-slate-500 mt-1">{pAdherence}% adherence</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Risk Alert Feed */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Risk Alerts</h2>
                <p className="text-xs text-slate-500">Real-time health signals</p>
              </div>
              <Badge tone={newAlertCount ? 'red' : 'green'} dot>
                {newAlertCount ? `${newAlertCount} new` : 'No new'}
              </Badge>
            </div>

            {alerts.length === 0 ? (
              <EmptyState icon={ShieldAlert} title="No alerts" message="Nothing needs attention right now." />
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 4).map((a, idx) => {
                  const alertId = a.id || a._id || idx
                  const p = doctorPatients.find((x) => (x.id || x._id) === (a.patientId?._id || a.patientId))
                  const severity = a.severity || 'low'

                  return (
                    <div
                      key={alertId}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 transition-all flex items-start gap-3 cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-xs">
                        {SEVERITY_ICON[severity] || SEVERITY_ICON.low}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {p?.name || a.patientName || 'Patient'}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {a.time || 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{a.title || 'Health Alert'}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {a.detail || a.description || 'No additional details provided.'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <Link
              to="/doctor/risk-alerts"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Open alert center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}