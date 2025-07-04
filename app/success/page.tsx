'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Home, Calendar, Download, Shield } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('User')
  const [isLoaded, setIsLoaded] = useState(false)

  // Get session ID and user info - this runs once and never changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = urlParams.get('session_id')
      console.log('🎯 SUCCESS PAGE: Session ID detected:', sessionIdFromUrl)
      setSessionId(sessionIdFromUrl)
      
      // Clear session storage to prevent any redirect loops
      sessionStorage.removeItem('pendingAssessment')
      sessionStorage.removeItem('uploadState')
      console.log('🧹 SUCCESS PAGE: Cleared all session storage')
      
      // Try to get user email safely without dependencies
      try {
        const { useAuth } = require('@/components/providers/auth-provider')
        const { user } = useAuth()
        if (user?.email) {
          setUserEmail(user.email)
          console.log('👤 SUCCESS PAGE: User email loaded:', user.email)
        }
      } catch (error) {
        console.log('⚠️ SUCCESS PAGE: Could not load user email, using fallback')
        setUserEmail('User')
      }
      
      setIsLoaded(true)
      console.log('✅ SUCCESS PAGE: Page fully loaded and stable')
    }
  }, [])

  // CRITICAL: Prevent any redirects if we have a session_id
  useEffect(() => {
    if (sessionId) {
      console.log('🔒 SUCCESS PAGE: Session ID present, preventing all redirects')
      
      // Override any potential redirect attempts by other code
      const originalPush = window.history.pushState
      const originalReplace = window.history.replaceState
      
      window.history.pushState = function(state, title, url) {
        if (url) {
          const urlStr = typeof url === 'string' ? url : url.toString()
          if (urlStr.includes('/upload') || urlStr.includes('/login') || urlStr.includes('/payment')) {
            console.log('🚫 SUCCESS PAGE: Blocked redirect to:', urlStr)
            return
          }
        }
        return originalPush.call(this, state, title, url)
      }
      
      window.history.replaceState = function(state, title, url) {
        if (url) {
          const urlStr = typeof url === 'string' ? url : url.toString()
          if (urlStr.includes('/upload') || urlStr.includes('/login') || urlStr.includes('/payment')) {
            console.log('🚫 SUCCESS PAGE: Blocked redirect to:', urlStr)
            return
          }
        }
        return originalReplace.call(this, state, title, url)
      }
      
      // Clean up on unmount
      return () => {
        window.history.pushState = originalPush
        window.history.replaceState = originalReplace
      }
    }
  }, [sessionId])

  // Show loading only if not loaded yet
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading success page...</p>
        </div>
      </div>
    )
  }

  // If no session ID, show a different message (shouldn't happen in normal flow)
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Access this page after completing payment
          </h1>
          <Link href="/upload">
            <Button>Return to Upload</Button>
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
        <div className="ml-auto text-sm text-slate-600">
          {userEmail}
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
            
            {/* Large Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Thank you — your skin concern has been submitted.
            </h1>
            
            {/* Medium Subheadline */}
            <p className="text-xl md:text-2xl text-slate-700 leading-relaxed max-w-3xl mx-auto">
              We're preparing your AI-assisted analysis and referral.
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12 space-y-8">
              
              {/* Body Text */}
              <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
                <p>
                  We've received your photos and description, and your submission is now being reviewed. We'll generate a preliminary analysis.
                </p>
                
                <p className="font-semibold">
                  You'll receive:
                </p>
                
                {/* What you'll receive */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <div className="space-y-3 text-blue-900">
                    <p>
                      <strong>A downloadable PDF in plain English</strong> of the preliminary assessment & a referral letter for your dermatologist.
                    </p>
                    <p>
                      <strong>A link to optionally book</strong> a board-certified dermatologist online.
                    </p>
                  </div>
                </div>
                
                {/* Timing */}
                <div className="text-center bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800">
                  <p className="font-semibold">
                    ⏰ <strong>When?</strong> Within 24 hours — often sooner.
                  </p>
                </div>
                
                {/* Email reminder */}
                <div className="text-center bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <p className="font-semibold">
                    📩 <strong>Please check your inbox.</strong> (And don't forget to check your spam folder.)
                  </p>
                </div>
              </div>

              {/* What would you like to do next? */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-900 text-center">
                  What would you like to do next?
                </h2>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <Link href="/" className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full h-14 text-lg font-medium border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all"
                    >
                      <Home className="w-5 h-5 mr-3" />
                      ✅ Return to Home
                    </Button>
                  </Link>
                  
                  <Button 
                    onClick={() => alert('Appointment scheduling feature coming soon! We will provide instructions for this feature shortly. You can wait for your report or contact us directly.')}
                    className="flex-1 h-14 text-lg font-medium bg-brand-blue hover:bg-brand-blue/90 text-white transition-all"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    🩺 Schedule an Online Dermatologist Appointment
                  </Button>
                </div>
                
                {/* Optional note under Schedule button */}
                <p className="text-center text-sm text-slate-600 max-w-2xl mx-auto">
                  <em>Optional – we can also help after your report is delivered or you can book an appointment now.</em>
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Friendly Footer Note */}
          <div className="text-center">
            <Card className="bg-slate-100/80 border-0">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Your privacy is important to us.</strong> All data is handled securely, and you can reply to your report email if you need additional assistance.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
