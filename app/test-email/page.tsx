'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const sendTestEmail = async (type: 'test' | 'assessment' | 'appointment') => {
    if (!email.trim()) {
      alert('Please enter an email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          type
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResults(prev => [{
          type,
          success: true,
          message: `${type} email sent successfully`,
          messageId: data.messageId,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev])
      } else {
        setResults(prev => [{
          type,
          success: false,
          message: data.error || 'Failed to send email',
          timestamp: new Date().toLocaleTimeString()
        }, ...prev])
      }
    } catch (error) {
      setResults(prev => [{
        type,
        success: false,
        message: 'Network error: ' + (error as Error).message,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev])
    } finally {
      setLoading(false)
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">SkinWise</h1>
                <p className="text-sm text-gray-500">Email System Test</p>
              </div>
            </Link>
            
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📧 Email System Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test your Resend email integration by sending sample emails to your own email address.
          </p>
        </div>

        {/* Test Email Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Send Test Emails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email">Your Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to receive test emails"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => sendTestEmail('test')}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Send className="w-5 h-5 mb-2" />
                <span className="font-medium">Basic Test</span>
                <span className="text-xs text-gray-500">Simple test email</span>
              </Button>

              <Button
                onClick={() => sendTestEmail('assessment')}
                disabled={loading}
                className="h-20 flex flex-col items-center justify-center bg-teal-600 hover:bg-teal-700"
              >
                <Mail className="w-5 h-5 mb-2" />
                <span className="font-medium">Assessment Email</span>
                <span className="text-xs opacity-90">£15 AI report confirmation</span>
              </Button>

              <Button
                onClick={() => sendTestEmail('appointment')}
                disabled={loading}
                className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-5 h-5 mb-2" />
                <span className="font-medium">Appointment Email</span>
                <span className="text-xs opacity-90">£110 consultation confirmation</span>
              </Button>
            </div>

            {loading && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending email...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {result.type} Email {result.success ? 'Sent' : 'Failed'}
                      </div>
                      <div className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </div>
                      {result.messageId && (
                        <div className="text-xs text-gray-500 mt-1">
                          Message ID: {result.messageId}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {result.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-blue-900 mb-3">📋 Testing Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Make sure you've added your Resend API key to `.env.local`</li>
              <li>Enter your email address above</li>
              <li>Click each test button to send different types of emails</li>
              <li>Check your email inbox (and spam folder) for the test emails</li>
              <li>Verify that the emails look professional and contain correct information</li>
              <li>Once all tests pass, the system is ready for live payments!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 