'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithGoogle, signInWithEmail, registerWithEmail } from '@/firebase'
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, Shield, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | 'email' | 'register' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setError(null) // Clear any previous errors
      await signInWithGoogle()
      router.push('/upload')
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      setError(error.message || 'Sign-in failed. Please try again.')
      setLoading(null)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    try {
      setLoading('email')
      setError(null)
      await signInWithEmail(email, password)
      router.push('/upload')
    } catch (error: any) {
      console.error('Email sign-in error:', error)
      setError(error.message || 'Sign-in failed. Please try again.')
      setLoading(null)
    }
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    try {
      setLoading('register')
      setError(null)
      await registerWithEmail(email, password)
      router.push('/upload')
    } catch (error: any) {
      console.error('Email registration error:', error)
      setError(error.message || 'Registration failed. Please try again.')
      setLoading(null)
    }
  }

  const toggleRegistration = () => {
    setIsRegistering(!isRegistering)
    setError(null)
    setEmail('')
    setPassword('')
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
              Welcome to SkinWise
            </h1>
            <p className="text-sm sm:text-base text-slate-600 px-2">
              Choose your preferred method to start your skin assessment journey
            </p>
          </div>

          <Card className="medical-card">
            <CardHeader className="text-center pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">
                Get Started
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your information is secure and private
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700 text-center">{error}</p>
                </div>
              )}
              
              {/* Google Sign-In - More Prominent */}
              <div className="space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading !== null}
                  className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold shadow-lg"
                size="lg"
              >
                {loading === 'google' ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                  </div>
                ) : (
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                      <span>Continue with Google</span>
                  </div>
                )}
              </Button>

                <div className="text-center text-xs text-slate-500">
                  <span className="bg-teal-50 px-2 py-1 rounded-full border border-teal-200">
                    ✨ Recommended - Quick & Easy
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                </div>
              </div>

              {/* Login/Register Toggle */}
              <div className="space-y-4">
                <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => isRegistering && toggleRegistration()}
                    disabled={loading !== null}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      !isRegistering
                        ? 'bg-white text-brand-blue shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => !isRegistering && toggleRegistration()}
                    disabled={loading !== null}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                      isRegistering
                        ? 'bg-white text-brand-blue shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Dynamic Heading and Description */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-brand-blue">
                    {isRegistering ? 'Create a New Account' : 'Sign In to Your Account'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {isRegistering 
                      ? 'Register with email and password to begin your skin assessment.'
                      : 'Use your email and password to access your SkinWise account.'
                    }
                  </p>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={isRegistering ? handleEmailRegister : handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-11 border-slate-200 focus:border-brand-blue"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isRegistering ? "Create a password (min. 6 characters)" : "Enter your password"}
                      className="pl-10 pr-10 h-11 border-slate-200 focus:border-brand-blue"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {isRegistering && (
                    <p className="text-xs text-slate-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading !== null}
                  className="w-full h-11 bg-slate-700 hover:bg-slate-800 text-white"
                >
                  {loading === 'email' || loading === 'register' ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isRegistering ? 'Creating Account...' : 'Signing in...'}</span>
                    </div>
                  ) : (
                    <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="text-center space-y-2 mt-4">
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