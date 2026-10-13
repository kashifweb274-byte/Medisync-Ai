import { Link } from 'react-router-dom'
import {
  HeartPulse,
  CalendarClock,
  Sparkles,
  FileSearch,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserRound,
  ArrowRight,
  Star,
  Activity,
  Video,
  MapPin,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const FEATURES = [
  {
    icon: CalendarClock,
    tone: 'teal',
    title: 'Intelligent time-slot allocation',
    desc: 'Our scheduling engine analyzes doctor availability, your preferences and urgency, then ranks the best slots for every appointment — online or in-person.',
  },
  {
    icon: FileSearch,
    tone: 'blue',
    title: 'AI health-report analysis',
    desc: 'Upload lab reports and get instant structured analysis: parameters cross-checked against reference ranges, flagged values and a plain-language summary.',
  },
  {
    icon: Pill,
    tone: 'green',
    title: 'Medication adherence monitoring',
    desc: 'Track every dose, get timely reminders, and watch your adherence trend so treatment plans actually work — visible to you and your doctor.',
  },
  {
    icon: Sparkles,
    tone: 'amber',
    title: 'AI-assisted health-risk insights',
    desc: 'Continuous monitoring of vitals, labs and habits surfaces early risk signals with confidence scores — before they become emergencies.',
  },
  {
    icon: ShieldCheck,
    tone: 'purple',
    title: 'Doctor risk alerts',
    desc: 'Doctors get a prioritized alert feed of patients trending toward high risk, with one-click review and coordinated follow-up.',
  },
  {
    icon: Stethoscope,
    tone: 'teal',
    title: 'Care coordination in one place',
    desc: 'Appointments, reports, medications and insights unify patient and doctor journeys in a single, clean healthcare workspace.',
  },
]

const STEPS = [
  { n: '01', title: 'Create your profile', desc: 'Join as a patient or doctor in seconds with a one-tap demo login.' },
  { n: '02', title: 'Book smart appointments', desc: 'Pick a time-slot the AI recommends based on availability and your routine.' },
  { n: '03', title: 'Share & analyze reports', desc: 'Upload health reports and get instant AI analysis with flagged parameters.' },
  { n: '04', title: 'Stay continuously monitored', desc: 'Track medication adherence and risk insights between visits.' },
]

export default function Landing() {
  const { isAuthenticated, role } = useAuth()
  const portalHref = isAuthenticated ? (role === 'doctor' ? '/doctor' : '/patient') : '/login'

  return (
    <div className="public-shell">
      <nav className="land-nav">
        <div className="land-nav-inner">
          <Link to="/" className="land-brand">
            <span className="land-brand-logo">
              <HeartPulse />
            </span>
            MediSync AI
          </Link>
          <div className="land-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#doctors">For doctors</a>
          </div>
          <div className="land-nav-actions">
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/register" className="btn btn-primary">
              <UserRound /> Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="hero-kicker">
              <span className="pulse-dot pulse" /> AI-powered healthcare coordination
            </span>
            <h1>
              Smarter care, from <span className="grad">booking to recovery</span>
            </h1>
            <p className="hero-sub">
              MediSync AI connects patients and doctors with intelligent appointments, instant lab-report
              analysis, medication adherence tracking and AI-assisted risk insights — all in one place.
            </p>
            <div className="hero-cta">
              <Link to={portalHref} className="btn btn-primary btn-lg">
                Explore the platform <ArrowRight />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                See how it works
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>50K+</strong>
                <span>Appointments coordinated</span>
              </div>
              <div className="hero-stat">
                <strong>12K+</strong>
                <span>Reports analyzed</span>
              </div>
              <div className="hero-stat">
                <strong>92%</strong>
                <span>Adherence improvement</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-head">
                <div className="avatar avatar-md" style={{ background: 'linear-gradient(135deg,#22d3ee,#0e7490)' }}>
                  PS
                </div>
                <div>
                  <h4>Dr. Priya Sharma</h4>
                  <span>Cardiologist · 4.9 ★</span>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>
                  <span className="badge-dot" /> Online
                </span>
              </div>
              <p className="small muted" style={{ marginBottom: 10 }}>AI-recommended slots for tomorrow:</p>
              <div className="hero-slot">
                <span>9:30 AM</span>
                <span className="badge badge-teal">✨ Recommended</span>
              </div>
              <div className="hero-slot">
                <span>11:00 AM</span>
                <span className="badge badge-gray">Good fit</span>
              </div>
              <div className="hero-slot">
                <span>4:00 PM</span>
                <span className="badge badge-gray">Available</span>
              </div>
            </div>
            <div className="hero-float top-left">
              <span className="float-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                <Pill />
              </span>
              <div>
                <strong>Adherence 96%</strong>
                <span>7-day streak</span>
              </div>
            </div>
            <div className="hero-float bottom-right">
              <span className="float-icon" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
                <Activity />
              </span>
              <div>
                <strong>Risk level: Low</strong>
                <span>Monitoring active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-title">
            <span className="section-eyebrow">Platform</span>
            <h2>Six AI pillars, one coordinated care journey</h2>
            <p>Everything a patient and a doctor need, powered by a scheduling, analysis and risk engine working together.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon ${f.tone}`}>
                  <f.icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how" style={{ background: 'var(--gray-50)' }}>
        <div className="section-inner">
          <div className="section-title">
            <span className="section-eyebrow">How it works</span>
            <h2>From first login to continuous monitoring</h2>
            <p>A simple four-step loop keeps patients cared for between visits.</p>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTOR BAND */}
      <section className="section" id="doctors">
        <div className="section-inner">
          <div className="portal-card-grid" style={{ alignItems: 'center' }}>
            <div>
              <span className="section-eyebrow">For doctors</span>
              <h2 style={{ fontSize: 30, marginBottom: 12 }}>Your patients, monitored between visits</h2>
              <p style={{ color: 'var(--gray-500)', maxWidth: 480 }}>
                See every patient's vitals trends, report analyses and adherence at a glance. A prioritized risk
                feed tells you who needs attention — so you can act early instead of react late.
              </p>
              <ul style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: ShieldCheck, text: 'Prioritized risk alerts with severity & confidence' },
                  { icon: Video, text: 'Approve, reschedule or start consultations' },
                  { icon: MapPin, text: 'Own your availability — the AI allocates around it' },
                ].map((it) => (
                  <li key={it.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="float-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                      <it.icon style={{ width: 18, height: 18 }} />
                    </span>
                    <span style={{ fontSize: 14.5, fontWeight: 500 }}>{it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ borderColor: 'var(--brand-200)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h4 style={{ fontSize: 15 }}>Risk alert feed</h4>
                <span className="badge badge-red">2 new</span>
              </div>
              {[
                { s: 'high', t: 'Sunita Rao — BP 164/98, adherence 47%', time: '12 min ago' },
                { s: 'high', t: 'Meera Nair — glucose 168 mg/dL', time: '2 hr ago' },
                { s: 'moderate', t: 'Aarav Mehta — LDL 138 mg/dL', time: 'Yesterday' },
              ].map((a) => (
                <div key={a.t} className="alert-item" style={{ marginBottom: 10 }}>
                  <span className={`alert-severity ${a.s}`}>
                    <Sparkles />
                  </span>
                  <div className="alert-body">
                    <h4>{a.t}</h4>
                    <p>{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="section-inner">
          <div className="cta-band">
            <h2>Ready to coordinate smarter care?</h2>
            <p>Explore the full platform — no setup, seeded demo data, both portals included.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-primary btn-lg">I'm a patient</Link>
              <Link to="/login" className="btn btn-outline btn-lg">I'm a doctor</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="land-footer">
        <div className="land-footer-inner">
          <div>
            <div className="land-brand" style={{ color: '#fff' }}>
              <span className="land-brand-logo">
                <HeartPulse />
              </span>
              MediSync AI
            </div>
            <p className="footer-desc">
              An AI-powered digital healthcare coordination platform for patients and doctors.
              College project demonstration — all data is simulated.
            </p>
          </div>
          <div>
            <h5>Platform</h5>
            <a href="#features">Intelligent scheduling</a>
            <a href="#features">Report analysis</a>
            <a href="#features">Adherence tracking</a>
            <a href="#features">Risk insights</a>
          </div>
          <div>
            <h5>Portals</h5>
            <Link to="/login">Patient portal</Link>
            <Link to="/login">Doctor portal</Link>
            <Link to="/register">Create account</Link>
          </div>
          <div>
            <h5>Resources</h5>
            <a href="#how">How it works</a>
            <a href="#doctors">For doctors</a>
            <a href="#doctors">Risk alerts</a>
          </div>
        </div>
        <div className="land-footer-bottom">
          <span>© {new Date().getFullYear()} MediSync AI · College project</span>
          <span>Made with ♥ for better healthcare</span>
        </div>
      </footer>
    </div>
  )
}
