import { Link } from 'react-router-dom'
import { Compass, HeartPulse, UserRound, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="public-shell">
      <div className="land-nav">
        <div className="land-nav-inner">
          <Link to="/" className="land-brand">
            <span className="land-brand-logo">
              <HeartPulse />
            </span>
            MediSync AI
          </Link>
        </div>
      </div>
      <main className="public-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div className="empty" style={{ maxWidth: 420 }}>
          <div className="empty-icon">
            <Compass />
          </div>
          <h4>Page not found</h4>
          <p>The page you're looking for doesn't exist or has moved.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/" className="btn btn-primary">
              <ArrowRight /> Back to home
            </Link>
            <Link to="/login" className="btn btn-outline">
              <UserRound /> Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
