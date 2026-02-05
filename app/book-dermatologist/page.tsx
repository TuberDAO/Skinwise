'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield, CheckCircle, User, CreditCard, FileText, Clock, Mail, LogOut } from "lucide-react"
import Link from "next/link"
import { detectUserCurrency, formatDermatologistPrice } from '@/lib/currency'
import { stripePromise } from '@/lib/stripe'
import { useAuth } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'

export default function DermatologistReviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userCurrency, setUserCurrency] = useState<'USD' | 'CHF' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SEK' | 'NOK' | 'DKK'>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)
  
  // Helper: Check if user is anonymous (guest)
  const isAnonymousUser = user?.isAnonymous === true
  
  // Helper: Get the email to use
  const getEmail = (): string => {
    if (user?.email) return user.email
    if (isAnonymousUser && guestEmail) return guestEmail
    return ''
  }
  
  // Helper: Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  // Helper: Check if form can be submitted
  const canSubmit = (): boolean => {
    if (isLoading) return false
    const email = getEmail()
    return isValidEmail(email)
  }

  // Load user currency
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const currency = await detectUserCurrency()
        setUserCurrency(currency)
      } catch (error) {
        console.error('Failed to detect currency:', error)
        setUserCurrency('USD')
      } finally {
        setCurrencyLoading(false)
      }
    }
    loadCurrency()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const email = getEmail()
    if (!email || !isValidEmail(email)) {
      alert('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Create checkout session for dermatologist case review
      const response = await fetch('/api/create-dermatologist-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentData: {
            patientName: email.split('@')[0] || 'User', // Use email prefix as name
            patientEmail: email,
            additionalInfo,
            serviceType: 'anonymous_case_review',
            submissionDate: new Date().toISOString(),
          },
          userEmail: email,
          currency: userCurrency
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe checkout
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Failed to load Stripe.js')
      }
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.id,
      })

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Error creating case review request:', error)
      alert('Failed to process request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link className="flex items-center space-x-3" href="/">
              <img 
                src="/skinwise-logo.png.png" 
                alt="SkinWise App" 
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">SkinWise</h1>
                <p className="text-sm text-gray-500">Dermatologist Review</p>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/success" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Success
              </Link>
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
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Page Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Request a Dermatologist Review
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A certified dermatologist will examine your preliminary report, photos and case details. 
            No live call required: just expert answers within 48-72 hours.
          </p>
        </div>

        {/* What You Get Section */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">What You Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Personal case examination by a certified dermatologist</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Detailed written response</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Private and secure: no ID or video call needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Anonymous Case Review
                </h3>
                <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                    <span>48-72 hours</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-green-600" />
                    <span>Certified</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    <span>Completely private</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {currencyLoading ? 'Loading...' : formatDermatologistPrice(userCurrency)}
                </div>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Additional Information (Optional)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Any extra context that might help with the dermatologist's review of your case.
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">
                    Additional Details
                  </Label>
                  <textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Any additional details about your skin concern, symptoms, or questions you'd like the dermatologist to address..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Any extra context that might help with the review
                  </p>
                </div>
              </div>

              {/* Process Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  How It Works
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• After payment, you'll receive an email confirmation with your reference number</li>
                  <li>• A certified dermatologist will review your preliminary report and photos</li>
                  <li>• You'll receive a detailed written response within 48-72 hours</li>
                  <li>• The dermatologist may ask follow-up questions via email if needed</li>
                  <li>• All communication is private and secure - no personal ID required</li>
                </ul>
              </div>

              {/* Email input for anonymous/guest users */}
              {isAnonymousUser && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <Label htmlFor="guestEmail" className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-teal-600" />
                    Email for your results
                  </Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={`border-2 ${guestEmail && !isValidEmail(guestEmail) ? 'border-red-300' : 'border-gray-300'} bg-white font-medium placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:border-teal-500`}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Used only to send your dermatologist report. No marketing.
                  </p>
                  {guestEmail && !isValidEmail(guestEmail) && (
                    <p className="text-xs text-red-500">Please enter a valid email address</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={!canSubmit()}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 text-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment ({currencyLoading ? 'Loading...' : formatDermatologistPrice(userCurrency)})
                    </div>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  You'll receive an email confirmation with your reference number and next steps within 24hrs.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-600" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-green-600" />
              <span>Certified Dermatologists</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-green-600" />
              <span>Anonymous & Private</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">🔒 Your Privacy & Security</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your case review is completely anonymous. No personal identifying details are required. 
                All communications are encrypted and secure. The dermatologist will only see your photos, 
                preliminary report & any additional context, NOT your name, email address or any other personally identifiable information.
              </p>
            </div>
          </CardContent>
        </Card>
              </div>
      </div>
    )
  } 