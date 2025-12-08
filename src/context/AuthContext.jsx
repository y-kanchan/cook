import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth } from '../utils/api'
 

const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
 
  // Initialize user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = auth.me()
      if (savedUser) {
        setUser(savedUser)
      }
    } catch (error) {
      console.error('Error restoring user session:', error)
    } finally {
      setInitializing(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      initializing,
      async login(email, password) {
        setLoading(true)
        try {
          const u = await auth.login(email, password)
          setUser(u)
          return u
        } finally {
          setLoading(false)
        }
      },
      async register(data) {
        setLoading(true)
        try {
          const u = await auth.register(data)
          setUser(u)
          return u
        } finally {
          setLoading(false)
        }
      },
      logout() {
        auth.logout()
        setUser(null)
      },
    }),
    [user, loading, initializing]
  )

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}

export function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return null
  return children
}
