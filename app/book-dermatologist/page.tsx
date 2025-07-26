'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, User, CreditCard, ArrowLeft, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { detectUserCurrency, formatDermatologistPrice } from '@/lib/currency'
import { stripePromise } from '@/lib/stripe'

export default function BookDermatologistPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userCurrency, setUserCurrency] = useState<'USD' | 'CHF' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'SEK' | 'NOK' | 'DKK'>('USD')
  const [currencyLoading, setCurrencyLoading] = useState(true)

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
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
    
    if (!selectedDate || !selectedTime || !patientName || !patientEmail) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Create checkout session for dermatologist appointment
      const response = await fetch('/api/create-dermatologist-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentData: {
            date: selectedDate,
            time: selectedTime,
            patientName,
            patientEmail,
            phoneNumber,
            appointmentType: 'dermatologist_consultation',
            duration: 15
          },
          userEmail: patientEmail,
          currency: userCurrency
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe checkout
      console.log('Loading Stripe...')
      const stripe = await stripePromise
      
      if (!stripe) {
        throw new Error('Failed to load Stripe.js')
      }

      console.log('Redirecting to checkout...')
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.id,
      })

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Failed to create appointment. Please try again.')
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
                <p className="text-sm text-gray-500">Dermatologist Booking</p>
              </div>
            </Link>
            
            <Link href="/success" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Success
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Page Header */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Book Your Dermatologist Consultation
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Schedule a 15-minute online consultation with a board-certified dermatologist
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  15-Minute Online Consultation
                </h3>
                <div className="flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-green-600" />
                    <span>Board-certified</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    <span>Secure & Private</span>
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

        {/* Booking Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="patientName"
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="mt-1"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientEmail" className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="mt-1"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div className="md:max-w-md">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Select Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentDate" className="text-sm font-medium text-gray-700">
                      Appointment Date *
                    </Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="mt-1"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bookings start from tomorrow
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="appointmentTime" className="text-sm font-medium text-gray-700">
                      Appointment Time *
                    </Label>
                    <select
                      id="appointmentTime"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      required
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      All times are in your local timezone
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Important Information</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• You'll receive a video call link via email after payment</li>
                  <li>• The consultation will be conducted via secure video call</li>
                  <li>• Please have good lighting and a stable internet connection</li>
                  <li>• If you need to reschedule, contact us at least 24 hours in advance</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !selectedDate || !selectedTime || !patientName || !patientEmail}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 text-lg font-medium shadow-lg"
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
                  You'll be redirected to our secure payment processor
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
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-green-600" />
              <span>Board-Certified Doctors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 