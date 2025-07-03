'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, CheckCircle, Clock, Mail, Download } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [authState, setAuthState] = useState<{user: any, loading: boolean}>({ user: null, loading: true })

  // Safe way to get search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = urlParams.get('session_id')
      console.log('Success page loaded with session ID:', sessionIdFromUrl)
      setSessionId(sessionIdFromUrl)
    }
  }, [])

  // Safe auth loading that won't crash
  useEffect(() => {
    try {
      const { useAuth } = require('@/components/providers/auth-provider')
      const { user, loading } = useAuth()
      setAuthState({ user, loading })
    } catch (error) {
      console.warn('Auth provider not available, continuing without auth:', error)
      setAuthState({ user: { isAnonymous: true, email: null }, loading: false })
    }
  }, [])

  useEffect(() => {
    // Clear pending assessment from session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingAssessment')
    }
    
    // Generate assessment ID
    setAssessmentId(`assessment_${Date.now()}`)
  }, [sessionId])

  // Show loading if auth is still loading
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const downloadWellnessGuide = () => {
    // In a real app, this would download an actual PDF
    const element = document.createElement('a')
    const file = new Blob(['SkinWise Wellness Guide Content...'], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'SkinWise-Wellness-Guide.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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
          {authState.user?.isAnonymous ? 'Anonymous User' : authState.user?.email || 'User'}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-brand-blue">
              Payment Successful!
            </h1>
            <p className="text-slate-600">
              Your skin assessment has been submitted for professional review
            </p>
          </div>

          {/* Assessment Details */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Assessment Submitted</CardTitle>
              <CardDescription>
                Your submission is now in our review queue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assessment ID</p>
                  <p className="text-sm text-slate-600 font-mono">
                    {assessmentId || 'Loading...'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Payment Status</p>
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Completed
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Expected Timeline</span>
                </div>
                <p className="text-sm text-slate-600">
                  You'll receive your preliminary analysis within <strong>24-48 hours</strong>. 
                  We'll send updates to {authState.user?.isAnonymous ? 'your anonymous account' : authState.user?.email || 'your account'}.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
              <CardDescription>
                Here's what to expect from your SkinWise assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">AI-Assisted Analysis</h4>
                    <p className="text-sm text-slate-600">
                      Our AI reviews your photos and description to identify key patterns
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Professional Review</h4>
                    <p className="text-sm text-slate-600">
                      A qualified professional validates and enhances the AI analysis
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Honest Recommendations</h4>
                    <p className="text-sm text-slate-600">
                      Root-cause advice focusing on hydration, diet, lifestyle, and environment
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Optional Referral</h4>
                    <p className="text-sm text-slate-600">
                      If needed, we'll provide an online dermatologist referral
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Your Results Will Include:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Detailed analysis of your skin concern</li>
                  <li>• Root-cause recommendations (no product pushing)</li>
                  <li>• Lifestyle and environmental factors to consider</li>
                  <li>• When to seek additional medical attention</li>
                  <li>• Downloadable wellness guide</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={downloadWellnessGuide}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Wellness Guide
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
            >
              Return to Home
            </Button>
          </div>

          {/* Contact */}
          <Card className="medical-card">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Mail className="w-6 h-6 text-slate-400 mx-auto" />
                <h4 className="font-medium">Questions?</h4>
                <p className="text-sm text-slate-600">
                  Contact us at{' '}
                  <a href="mailto:support@skinwise.com" className="text-brand-blue hover:underline">
                    support@skinwise.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 