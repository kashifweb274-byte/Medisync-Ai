import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true)

  // Safe initial state load from both keys
  const [user, setUser] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('medisync.auth')
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth)
        return parsed.profile || parsed.user || parsed
      }
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  // Mark auth loading complete on mount
  useEffect(() => {
    setLoading(false)
  }, [])

  // Helper function to save session in all localStorage keys
  const saveSession = (jwtToken, userData) => {
    const formattedUser = {
      ...userData,
      name: userData?.name,
      email: userData?.email,
      role: userData?.role
    }

    // Standard Keys
    if (jwtToken) {
      localStorage.setItem('token', jwtToken)
      setToken(jwtToken)
    }
    localStorage.setItem('user', JSON.stringify(formattedUser))

    // UI/Sidebar Compatibility Key
    localStorage.setItem('medisync.auth', JSON.stringify({
      role: userData?.role,
      token: jwtToken,
      profile: formattedUser,
      name: userData?.name,
      email: userData?.email
    }))

    setUser(formattedUser)
  }

  // 1. Real Backend Login Function
  const login = async (email, password) => {
    // Handling Demo Buttons
    if (email === 'patient' || email === 'doctor') {
      const demoUser = { 
        id: 'demo1',
        role: email, 
        email: `${email}@example.com`, 
        name: `${email.toUpperCase()} Demo` 
      }
      saveSession('demo-token', demoUser)
      return demoUser
    }

    // Real Backend Login API Call
    const response = await API.post('/auth/login', { email, password })
    const { token: jwtToken, user: userData } = response.data

    saveSession(jwtToken, userData)
    return userData
  }

  // 2. Real Backend Register Function
  const register = async (userData) => {
    // Real Backend Register API Call
    const response = await API.post('/auth/register', userData)
    const { token: jwtToken, user: newUser } = response.data

    saveSession(jwtToken, newUser)
    return newUser
  }

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('medisync.auth')
    setToken(null)
    setUser(null)
  }

  const role = user?.role || null
  const isAuthenticated = Boolean(user && token)

  return (
    <AuthContext.Provider value={{ user, token, role, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)