'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
  const [loading, setLoading] = useState(true) // Start with loading=true
  const timeoutRef = useRef<NodeJS.Timeout>()
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication listener...')
    
    // Add timeout to prevent hanging
    timeoutRef.current = setTimeout(() => {
      console.warn('Auth initialization timeout')
      setLoading(false)
    }, 10000)
    
    const initializeAuth = async () => {
      try {
        // Import Firebase auth
        const { auth } = await import('@/firebase')
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        if (auth) {
          console.log('AuthProvider: Firebase auth available, setting up listener')
          const { onAuthStateChanged } = await import('firebase/auth')
          
          unsubscribeRef.current = onAuthStateChanged(
            auth,
            (user) => {
              console.log('AuthProvider: Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out')
              setUser(user)
              setLoading(false)
            },
            (error) => {
              console.error('AuthProvider: Auth state change error:', error)
              setLoading(false)
            }
          )
        } else {
          console.error('AuthProvider: Firebase auth not initialized')
          setLoading(false)
        }
      } catch (error) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        console.error('AuthProvider: Auth initialization failed:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Cleanup function
    return () => {
      console.log('AuthProvider: Cleaning up auth listener')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, []) // No dependencies - run once on mount

  console.log('AuthProvider: Current state:', { user: user?.email || 'not logged in', loading })

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