'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout')
      setLoading(false)
    }, 5000)
    
    try {
      // Dynamic import to avoid SSR issues
      import('@/firebase').then(({ auth }) => {
        clearTimeout(timeoutId)
        if (auth) {
          import('firebase/auth').then(({ onAuthStateChanged }) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
              setUser(user)
              setLoading(false)
            })
            return () => unsubscribe()
          }).catch((error) => {
            console.warn('Firebase auth module error:', error)
            setLoading(false)
          })
        } else {
          console.warn('Firebase auth not initialized')
          setLoading(false)
        }
      }).catch((error) => {
        clearTimeout(timeoutId)
        console.warn('Firebase auth not available:', error)
        setLoading(false)
      })
    } catch (error) {
      clearTimeout(timeoutId)
      console.warn('Auth initialization failed:', error)
      setLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 