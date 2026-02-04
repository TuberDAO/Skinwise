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
              Submission Received!
            </h1>
            
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
              Your case is now with our dermatology team for a comprehensive review.
            </p>
          </div>

          {/* Confirmation Details Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 border-b">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-teal-600" />
                Dermatologist Review in Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              
              {/* Status: review in progress */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                <h3 className="font-semibold text-blue-900 mb-3 text-lg">
                  Status
                </h3>
                <div className="text-blue-800 space-y-2">
                  <p>
                    A certified dermatologist is reviewing your submitted photos and information.
                  </p>
                  <p>
                    <strong>No video call or appointment is required.</strong> This is an asynchronous review: you will receive a written assessment.
                  </p>
                </div>
              </div>

              {/* Review Details & What's Next */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 text-lg">Review Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-700">
                      <User className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Type:</strong> Specialist photo & case review (no live call)</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <Shield className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Reviewer:</strong> Certified dermatologist</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <Mail className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Format:</strong> Written medical assessment</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <Clock className="w-5 h-5 mr-3 text-teal-600" />
                      <span><strong>Typical turnaround:</strong> 48–72hrs</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 text-lg">What's Next</h4>
                  <div className="space-y-3 text-slate-700">
                    <div className="flex items-start">
                      <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                      <span>Review in progress</span>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                      <span>Reports prepared</span>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                      <span>Results delivered securely</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What you'll receive */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 text-lg">What you'll receive</h4>
                <ul className="text-slate-700 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>A plain-English summary for you</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>A clinical-style summary suitable for sharing with a doctor</span>
                  </li>
                </ul>
              </div>

              {/* Privacy reassurance */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong>Privacy:</strong> Your review is anonymous. The dermatologist does not see your name or email.
                </p>
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

        </div>
      </div>
    </div>
  )
} 