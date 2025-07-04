'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, CreditCard, Shield, Clock, Users } from "lucide-react"
import Link from "next/link"
import { stripePromise } from '@/lib/stripe'
import { detectUserCurrency, formatPrice, getUserCurrencyFromLocale, type SupportedCurrency } from '@/lib/currency'

export default function PaymentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [isClientSide, setIsClientSide] = useState(false)
  const [userCurrency, setUserCurrency] = useState<SupportedCurrency>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)

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
    
    // Only access sessionStorage on client side
    if (typeof window !== 'undefined') {
      // Check if we're being accessed with a session_id (indicating successful payment)
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get('session_id')
      
      if (sessionId) {
        // If there's a session_id, we should redirect to success page instead
        console.log('Payment page accessed with session_id, redirecting to success page')
        router.push(`/success?session_id=${sessionId}`)
        return
      }
      
      // Get assessment data from session storage
      const data = sessionStorage.getItem('pendingAssessment')
      if (data) {
        setAssessmentData(JSON.parse(data))
      } else {
        // Only redirect back to upload if no data AND no session_id
        console.log('No pending assessment data found, redirecting to upload')
        router.push('/upload')
      }
    }
  }, [router])

  // Don't render anything during SSR
  if (!isClientSide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login')
    return null
  }

  const handlePayment = async () => {
    if (!assessmentData) return

    try {
      setLoading(true)
      console.log('Starting payment process...', { userId: user.uid, assessmentData, currency: userCurrency })
      
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

      console.log('API response status:', response.status)
      
      // Get response text first for better error handling
      const responseText = await response.text()
      console.log('API response text:', responseText)

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

      console.log('Checkout session created:', session.id)

      // Redirect to Stripe Checkout
      console.log('Loading Stripe...')
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Failed to load Stripe.js')
      }

      console.log('Redirecting to checkout...')
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
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-10 w-auto"
          />
        </Link>
        <div className="ml-auto text-sm text-slate-600">
          {user.email}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-brand-blue">
              Complete Your Assessment
            </h1>
            <p className="text-slate-600">
              Secure payment for professional skin health analysis
            </p>
          </div>

          {/* Assessment Summary */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Assessment Summary</CardTitle>
              <CardDescription>
                Your submission is ready for professional review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Photos uploaded</p>
                  <p className="text-2xl font-bold text-brand-blue">{assessmentData.files?.length || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Description provided</p>
                  <p className="text-2xl font-bold text-brand-blue">
                    {assessmentData.description ? '✓' : '✗'}
                  </p>
                </div>
              </div>
              
              {assessmentData.description && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Your description:</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                    {assessmentData.description.length > 100 
                      ? assessmentData.description.substring(0, 100) + '...'
                      : assessmentData.description
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Card */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Professional Analysis</span>
              </CardTitle>
              <CardDescription>
                One-time payment for comprehensive skin health assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-blue">
                  {currencyLoading ? '$19.95 USD' : formatPrice(userCurrency)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Results within 24-48 hours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm">AI-assisted professional review</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Honest, ethical recommendations</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What you'll receive:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Preliminary skin health analysis</li>
                  <li>• Root-cause recommendations (hydration, diet, lifestyle)</li>
                  <li>• Product suggestions only when necessary</li>
                  <li>• Optional dermatologist referral if needed</li>
                  <li>• Downloadable wellness guide</li>
                </ul>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Complete Secure Payment</span>
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
          <div className="flex justify-between items-center">
            <Link href="/upload" className="text-sm text-brand-blue hover:underline">
              ← Back to upload
            </Link>
            <p className="text-xs text-slate-500">
              Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 