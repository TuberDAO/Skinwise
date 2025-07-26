'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Clock, User, Mail, Phone, Home, Download, Shield } from "lucide-react"
import Link from "next/link"

export default function BookingConfirmationPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = urlParams.get('session_id')
      console.log('🎯 BOOKING CONFIRMATION: Session ID detected:', sessionIdFromUrl)
      setSessionId(sessionIdFromUrl)
      
      // In a real app, you'd fetch appointment details from your backend using the session ID
      // For now, we'll show a generic confirmation
      setIsLoaded(true)
    }
  }, [])

  // Show loading only if not loaded yet
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading confirmation...</p>
        </div>
      </div>
    )
  }

  // If no session ID, show error
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Access this page after completing payment
          </h1>
          <Link href="/book-dermatologist">
            <Button>Book Appointment</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-white/80 backdrop-blur-sm">
        <Link className="flex items-center justify-center" href="/">
          <img 
            src="/skinwise-logo.png.png" 
            alt="SkinWise App" 
            className="h-10 w-auto"
          />
        </Link>
        <div className="ml-auto">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            Return to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          
          {/* Success Icon and Headline */}
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Appointment Confirmed!
            </h1>
            
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
              Your dermatologist consultation has been successfully booked.
            </p>
          </div>

          {/* Confirmation Details Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-teal-600" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              {/* Important Next Steps */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                  📧 Check Your Email
                </h3>
                <div className="text-blue-800 space-y-2">
                  <p>
                    <strong>We've sent you a confirmation email</strong> with your video call link and appointment details.
                  </p>
                  <p>
                    <strong>⚠️ Important:</strong> Please check your spam folder if you don't see the email within 5 minutes.
                  </p>
                </div>
              </div>

              {/* Appointment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 text-lg">Consultation Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-700">
                      <Clock className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Duration:</strong> 15 minutes</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <User className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Type:</strong> Online Video Consultation</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <Shield className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Provider:</strong> Board-certified Dermatologist</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 text-lg">What's Next</h4>
                  <div className="space-y-3 text-slate-700">
                    <div className="flex items-start">
                      <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <span>Check your email for the video call link</span>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <span>Prepare your skin concern information</span>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <span>Join the video call at your scheduled time</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-appointment Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h4 className="font-semibold text-amber-800 mb-3">Before Your Appointment</h4>
                <ul className="text-amber-700 space-y-2 text-sm">
                  <li>• <strong>Test your internet connection</strong> and camera/microphone</li>
                  <li>• <strong>Find a well-lit area</strong> for the video call</li>
                  <li>• <strong>Prepare photos</strong> of your skin concern if needed</li>
                  <li>• <strong>Have your medical history ready</strong> (current medications, allergies)</li>
                  <li>• <strong>Write down your questions</strong> to make the most of your 15 minutes</li>
                </ul>
              </div>

              {/* Session ID for reference */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 text-center">
                  <strong>Booking Reference:</strong> {sessionId}
                </p>
                <p className="text-xs text-slate-500 text-center mt-1">
                  Save this reference number for your records
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-lg font-medium border-2 border-slate-300 hover:bg-slate-50"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Return to Home
                  </Button>
                </Link>
                
                <Button 
                  onClick={() => window.print()}
                  className="flex-1 h-12 text-lg font-medium bg-teal-700 hover:bg-teal-800 text-white"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Print Confirmation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card className="bg-slate-100/80 border-0">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you need to reschedule or have questions about your appointment, 
                please contact our support team at least 24 hours in advance.
              </p>
              <p className="text-sm text-slate-600 mt-2">
                <strong>Email:</strong> support@skinwise.com | <strong>Hours:</strong> Mon-Fri 9AM-6PM
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
} 