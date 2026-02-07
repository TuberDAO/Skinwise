'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, CreditCard, Shield, Clock, Users, LogOut, CheckCircle } from "lucide-react"
import Link from "next/link"
import { stripePromise } from '@/lib/stripe'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { detectUserCurrency, formatPrice, getUserCurrencyFromLocale, type SupportedCurrency } from '@/lib/currency'

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [isClientSide, setIsClientSide] = useState(false)
  const [userCurrency, setUserCurrency] = useState<SupportedCurrency>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  useEffect(() => {
    // Mark that we're on the client side
    setIsClientSide(true)
    
    // Detect user's currency for pricing display
    detectUserCurrency().then(currency => {
      setUserCurrency(currency)
      setCurrencyLoading(false)
    }).catch(() => {
      // Fallback to locale-based detection
      const fallbackCurrency = getUserCurrencyFromLocale()
      setUserCurrency(fallbackCurrency)
      setCurrencyLoading(false)
    })
  }, [])

  useEffect(() => {
    // Only run after component is mounted and user auth is resolved
    if (!isClientSide || authLoading || !user) return

    // Check if we're being accessed with a session_id (indicating successful payment)
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    
    if (sessionId) {
      // If there's a session_id, we should redirect to success page instead
      setShouldRedirect(`/success?session_id=${sessionId}`)
      return
    }
    
    // Get assessment data from session storage
    const data = sessionStorage.getItem('pendingAssessment')
    if (data) {
      setAssessmentData(JSON.parse(data))
    } else {
      // Only redirect back to upload if no data AND no session_id
      setShouldRedirect('/upload')
    }
  }, [isClientSide, authLoading, user])

  // Handle redirects in a separate useEffect to avoid render conflicts
  useEffect(() => {
    if (shouldRedirect) {
      const timeoutId = setTimeout(() => {
        router.push(shouldRedirect)
      }, 100) // Small delay to avoid render conflicts
      
      return () => clearTimeout(timeoutId)
    }
  }, [shouldRedirect, router])

  // Don't render anything during SSR or while loading
  if (!isClientSide || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  // Redirect if not logged in (but don't do it during render)
  if (!user) {
    if (!shouldRedirect) {
      setShouldRedirect('/login')
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const handlePayment = async () => {
    if (!assessmentData) return

    try {
      setLoading(true)
      
      // Create checkout session with detected currency
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentData,
          userId: user.uid,
          userEmail: user.email || 'anonymous@skinwise.com',
          currency: userCurrency,
        }),
      })

      // Get response text first for better error handling
      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${responseText}`)
      }

      const session = JSON.parse(responseText)

      if (session.error) {
        throw new Error(session.error)
      }

      if (!session.id) {
        throw new Error('No session ID returned from API')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Failed to load Stripe.js')
      }
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(`Payment failed: ${error.message}\n\nPlease check the console for more details.`)
    } finally {
      setLoading(false)
    }
  }

  if (!assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading assessment data...</p>
        </div>
      </div>
    )
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
        <div className="ml-auto flex items-center space-x-3">
          <span className="text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-none">
            {user.email}
          </span>
          <button
            onClick={async () => {
              if (auth) {
                try {
                  await signOut(auth)
                  window.location.href = '/login'
                } catch (error) {
                  console.error('Logout failed:', error)
                  window.location.href = '/login'
                }
              }
            }}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 flex items-center"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-blue px-2">
              Complete Your Assessment
            </h1>
            <p className="text-sm sm:text-base text-slate-600 px-2">
              Secure payment for professional skin health analysis
            </p>
          </div>

          {/* Upload success confirmation */}
          <div className="flex items-center space-x-2.5 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Photos uploaded successfully</p>
              <p className="text-xs text-green-600">Quality looks good for review.</p>
            </div>
          </div>

          {/* Assessment Summary */}
          <Card className="medical-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Assessment Summary</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your submission is ready for review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium">Photos uploaded</p>
                  <p className="text-xl sm:text-2xl font-bold text-brand-blue">{assessmentData.files?.length || 0}</p>
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-xs sm:text-sm font-medium">Description provided</p>
                  <p className="text-xl sm:text-2xl font-bold text-brand-blue">
                    {(assessmentData.additionalNotes || assessmentData.description || assessmentData.symptomTypes?.length > 0 || assessmentData.bodyLocation) ? 'Yes' : '-'}
                  </p>
                </div>
              </div>
              
              {(assessmentData.additionalNotes || assessmentData.description) && (
                <div className="border-t pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm font-medium mb-2">Your description:</p>
                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-2 sm:p-3 rounded">
                    {(() => {
                      const desc = assessmentData.additionalNotes || assessmentData.description || ''
                      return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
                    })()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="medical-card">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Skin Analysis</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                One-time payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-brand-blue">
                  {currencyLoading ? '£6' : formatPrice(userCurrency)}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Results within 2-4 hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">AI-assisted professional review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Honest, ethical recommendations</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">What you'll receive:</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• Preliminary skin health analysis</li>
                  <li>• Root-cause possibilities</li>
                  <li>• Product suggestions only when necessary</li>
                  <li>• Optional dermatologist referral if needed</li>
                </ul>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-12 sm:h-12 bg-brand-blue hover:bg-brand-blue/90"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Complete Secure Payment</span>
                  </div>
                )}
              </Button>

              <div className="text-center text-xs text-slate-500 space-y-1">
                <p>Powered by Stripe • 256-bit SSL encryption</p>
                <p>
                  By proceeding, you agree to our{' '}
                  <Link href="/terms" className="text-brand-blue hover:underline">
                    Terms of Service
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 bg-white p-3 sm:p-4 rounded-lg border">
            <Link href="/upload" className="text-xs sm:text-sm text-brand-blue hover:underline order-2 sm:order-1">
              ← Back to upload
            </Link>
            <p className="text-xs text-slate-500 order-1 sm:order-2">
              Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 