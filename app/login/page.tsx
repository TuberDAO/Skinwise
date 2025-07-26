'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithGoogle } from '@/firebase'
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, Shield } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  // Use useEffect for redirect to avoid render-time state changes
  useEffect(() => {
    if (user) {
      router.push('/upload')
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading('google')
      await signInWithGoogle()
      router.push('/upload')
    } catch (error) {
      console.error('Google sign-in error:', error)
      setLoading(null)
    }
  }



  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-3 sm:px-4 lg:px-6 h-12 sm:h-14 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-8 sm:h-10 w-auto"
          />
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-blue px-2">
              Secure Login
            </h1>
            <p className="text-sm sm:text-base text-slate-600 px-2">
              Choose your preferred sign-in method to start your skin assessment
            </p>
          </div>

          <Card className="medical-card">
            <CardHeader className="text-center pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Get Started</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your information is secure and private
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading !== null}
                className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90"
                size="lg"
              >
                {loading === 'google' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm sm:text-base">Continue with Google</span>
                  </div>
                )}
              </Button>

              <div className="text-center space-y-2 mt-3 sm:mt-4">
                <div className="flex items-center justify-center space-x-1 text-xs text-slate-500">
                  <Shield className="w-3 h-3" />
                  <span>Secure & Private</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  Your privacy is protected. We only collect necessary information for assessments.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-xs sm:text-sm text-brand-blue hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 