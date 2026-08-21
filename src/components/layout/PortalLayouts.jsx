import { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  FileSearch,
  Pill,
  Sparkles,
  Activity,
  CalendarClock,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  HeartPulse as HeartLogo,
} from 'lucide-react'
import API from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { Avatar } from '../ui/Avatar'

const PATIENT_NAV = [
  { to: '/patient', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
  { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
  { to: '/patient/reports', label: 'Health Reports', icon: FileSearch },
  { to: '/patient/medications', label: 'Medications', icon: Pill },
  { to: '/patient/insights', label: 'Health Insights', icon: Sparkles },
]

const DOCTOR_NAV = [
  { to: '/doctor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/doctor/schedule', label: 'My Schedule', icon: CalendarClock },
  { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/doctor/patients', label: 'My Patients', icon: Users },
  { to: '/doctor/adherence', label: 'Adherence', icon: Activity },
  { to: '/doctor/risk-alerts', label: 'Risk Alerts', icon: ShieldAlert },
]

function Brand() {
  return (
    <Link to="/" className="side-brand">
      <span className="side-logo">
        <HeartLogo />
      </span>
      <span>
        <span className="side-brand-name">MediSync AI</span>
        <span className="side-brand-sub">Healthcare Co-ordination</span>
      </span>
    </Link>
  )
}

export function PatientLayout({ children }) {
  const { user, profile, logout } = useAuth()
  const { patientRisk } = useData() || {}
  const [open, setOpen] = useState(false)
  const activeProfile = user || profile

  return (
    <PortalShell
      open={open}
      setOpen={setOpen}
      nav={PATIENT_NAV}
      badgeMap={{ '/patient/insights': patientRisk?.level === 'high' ? 1 : 0 }}
      profile={activeProfile}
      logout={logout}
      title="Patient Portal"
    >
      {children}
    </PortalShell>
  )
}

export function DoctorLayout({ children }) {
  const { user, profile, logout } = useAuth()
  const [alertCount, setAlertCount] = useState(0)
  const [open, setOpen] = useState(false)
  const activeProfile = user || profile

  useEffect(() => {
    const fetchLiveAlertsCount = async () => {
      try {
        const { data } = await API.get('/insights/doctor/alerts')
        const alertsList = Array.isArray(data.alerts) ? data.alerts : Array.isArray(data) ? data : []
        setAlertCount(alertsList.length)
      } catch {
        setAlertCount(0)
      }
    }

    fetchLiveAlertsCount()
  }, [])

  return (
    <PortalShell
      open={open}
      setOpen={setOpen}
      nav={DOCTOR_NAV}
      badgeMap={{ '/doctor/risk-alerts': alertCount }}
      profile={activeProfile}
      logout={logout}
      title="Doctor Portal"
    >
      {children}
    </PortalShell>
  )
}

function PortalShell({ children, nav, profile, logout, title, open, setOpen, badgeMap }) {
  const navigate = useNavigate()
  const today = new Date()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="portal-shell">
      <aside className={`portal-sidebar ${open ? 'open' : ''}`}>
        <Brand />
        <nav className="side-nav">
          <div className="side-nav-label">Menu</div>
          {nav.map((item) => {
            const badge = badgeMap?.[item.to]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <item.icon />
                <span>{item.label}</span>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </NavLink>
            )
          })}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <Avatar name={profile?.name || 'User'} size="sm" />
            <div className="side-user-info">
              <strong>{profile?.name || 'User'}</strong>
              <span>{profile?.specialty || profile?.email || ''}</span>
            </div>
            <button className="side-logout" onClick={onLogout} title="Log out">
              <LogOut />
            </button>
          </div>
        </div>
      </aside>

      <div className="portal-main">
        <header className="topbar">
          <button className="icon-btn topbar-hamburger" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <div className="topbar-title">{title}</div>
          <div className="topbar-actions">
            <span className="topbar-date">
              {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ·{' '}
              {today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <Avatar name={profile?.name || 'User'} size="sm" />
          </div>
        </header>

        <main className="portal-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}