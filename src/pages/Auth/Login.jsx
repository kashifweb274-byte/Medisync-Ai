import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Mail, Lock, Eye, EyeOff, UserRound, Stethoscope } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function Login() {
  const { user, login } = useAuth()
  const { toast } = useData()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Agar user pehle se logged in hai, toh use direct portal par bhejo
  useEffect(() => {
    if (user) {
      const targetPath = user.role === 'doctor' ? '/doctor' : '/patient'
      navigate(targetPath, { replace: true })
    }
  }, [user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Backend se login call
      const userData = await login(email, password)
      
      toast(`Welcome back, ${userData.name || 'User'}!`)
      
      // Role ke hisaab se redirect
      const targetRole = userData?.role || 'patient'
      navigate(targetRole === 'doctor' ? '/doctor' : '/patient', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoRole) => {
    setLoading(true)
    try {
      const demoUser = await login(demoRole, '')
      toast(`Logged in as Demo ${demoRole.toUpperCase()}`)
      navigate(demoRole === 'doctor' ? '/doctor' : '/patient', { replace: true })
    } catch (err) {
      setError('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div>
          <Link to="/" className="land-brand" style={{ color: '#fff' }}>
            <span className="land-brand-logo">
              <HeartPulse />
            </span>
            MediSync AI
          </Link>
        </div>
        <div>
          <h2>Your health, coordinated by intelligence.</h2>
          <p>One platform for appointments, reports, medications and risk insights — built for both sides of care.</p>
        </div>
        <div className="auth-quote">
          <p>“The AI-suggested slot fit my workday perfectly, and the report analysis was clearer than the lab printout.”</p>
          <footer>— Aarav M., patient</footer>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap fade-up">
          <h1>Welcome back</h1>
          <p>Log in to your MediSync AI account</p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  id="email"
                  className="input"
                  style={{ paddingLeft: 38 }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  className="input"
                  style={{ paddingLeft: 38, paddingRight: 38 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="icon-btn"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShow(!show)}
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--gray-400)', fontWeight: 600 }}>
              Or explore a demo
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flexDirection: 'column', padding: '12px 8px', gap: 4, height: 'auto' }}
                onClick={() => handleDemoLogin('patient')}
                disabled={loading}
              >
                <UserRound size={18} />
                <strong style={{ fontSize: 13 }}>Patient demo</strong>
                <span className="small muted">Explore patient portal</span>
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flexDirection: 'column', padding: '12px 8px', gap: 4, height: 'auto' }}
                onClick={() => handleDemoLogin('doctor')}
                disabled={loading}
              >
                <Stethoscope size={18} />
                <strong style={{ fontSize: 13 }}>Doctor demo</strong>
                <span className="small muted">Explore doctor portal</span>
              </button>
            </div>
          </div>

          <p className="small muted" style={{ marginTop: 24, textAlign: 'center' }}>
            New to MediSync AI? <Link to="/register" style={{ color: 'var(--brand-700)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}