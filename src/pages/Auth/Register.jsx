import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, UserRound, Stethoscope, User, Mail, Lock, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function Register() {
  const { register } = useAuth()
  const dataContext = useData()
  const toast = dataContext?.toast || console.log
  const navigate = useNavigate()
  
  const [role, setRole] = useState('patient')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all required fields.')
      return
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Real Backend API Request
      const newUser = await register({ name, email, phone, password, role })
      
      if (typeof toast === 'function') {
        toast(`Account created — welcome to the ${role} portal, ${name.split(' ')[0]}!`)
      }
      
      const userRole = newUser?.role || role
      navigate(userRole === 'doctor' ? '/doctor' : '/patient')
    } catch (err) {
      // Network Error Detection
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to backend server. Please make sure Node.js server is running on port 5000.')
      } else {
        const serverError = 
          err.response?.data?.message || 
          err.response?.data?.error || 
          (typeof err.response?.data === 'string' ? err.response.data : null) || 
          err.message || 
          'Registration failed. Please try again.'

        setError(serverError)
      }
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
          <h2>Join a care network that never sleeps.</h2>
          <p>Patients get continuous monitoring; doctors get an intelligent command center.</p>
        </div>
        <div className="auth-quote">
          <p>“Risk alerts told me about Sunita two days before she'd have walked into the ER. That's the difference.”</p>
          <footer>— Dr. Sara Iyer, General Physician</footer>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap fade-up">
          <h1>Create your account</h1>
          <p>Join as a patient or a doctor — takes under a minute.</p>

          <div className="segmented" style={{ width: '100%', marginBottom: 20 }}>
            <button 
              type="button"
              className={role === 'patient' ? 'active' : ''} 
              style={{ flex: 1 }} 
              onClick={() => setRole('patient')}
              disabled={loading}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <UserRound size={15} /> Patient
              </span>
            </button>
            <button 
              type="button"
              className={role === 'doctor' ? 'active' : ''} 
              style={{ flex: 1 }} 
              onClick={() => setRole('doctor')}
              disabled={loading}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Stethoscope size={15} /> Doctor
              </span>
            </button>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label htmlFor="r-name">{role === 'doctor' ? 'Full name & qualification' : 'Full name'}</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input 
                  id="r-name" 
                  className="input" 
                  style={{ paddingLeft: 38 }} 
                  placeholder={role === 'doctor' ? 'Dr. Jane Doe, MD' : 'Aarav Mehta'} 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setError('') }} 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="r-email">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input 
                  id="r-email" 
                  type="email"
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
              <label htmlFor="r-phone">Phone number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input 
                  id="r-phone" 
                  type="tel"
                  className="input" 
                  style={{ paddingLeft: 38 }} 
                  placeholder="+91 98xxx xxxxx" 
                  value={phone} 
                  onChange={(e) => { setPhone(e.target.value); setError('') }} 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="r-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input 
                  id="r-password" 
                  type="password" 
                  className="input" 
                  style={{ paddingLeft: 38 }} 
                  placeholder="At least 6 characters" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError('') }} 
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600, margin: '4px 0 0 0' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  {role === 'doctor' ? <Stethoscope size={18} /> : <UserRound size={18} />} Create account
                </>
              )}
            </button>
          </form>

          <p className="small muted" style={{ marginTop: 24, textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--brand-700)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}