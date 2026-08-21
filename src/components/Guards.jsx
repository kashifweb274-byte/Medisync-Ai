import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Redirects to login when not authenticated. */
export function RequireAuth({ children }) {
  const { user, token, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Wait until Auth Context initial state load completes
  if (loading) {
    return null
  }

  const isAuthed = isAuthenticated ?? Boolean(user || token)

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/** Redirects to the portal home when already logged in (login/register pages). */
export function RedirectIfAuthed({ children }) {
  const { user, token, isAuthenticated, role, loading } = useAuth()

  // Wait until Auth Context initial state load completes
  if (loading) {
    return null
  }

  const isAuthed = isAuthenticated ?? Boolean(user || token)
  const currentRole = user?.role || role || 'patient'

  if (isAuthed) {
    return <Navigate to={currentRole === 'doctor' ? '/doctor' : '/patient'} replace />
  }

  return children
}