'use client'

import { useState } from 'react'

export default function TestStripePage() {
  const [testResult, setTestResult] = useState('')

  const testStripeConfig = async () => {
    setTestResult('Testing Stripe configuration...')
    
    try {
      // Test environment variables
      const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      
      if (!hasPublishableKey) {
        throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing from environment variables')
      }

      // Test Stripe.js loading
      setTestResult('Loading Stripe.js...')
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      if (!stripe) {
        throw new Error('Failed to load Stripe.js')
      }

      // Test API route call
      setTestResult('Testing checkout session creation...')
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentData: {
            photos: ['test-photo-url'],
            textDescription: 'test description',
            timestamp: new Date().toISOString(),
            status: 'pending_payment'
          },
          userId: 'test-user-id',
          userEmail: 'test@example.com',
        }),
      })

      const responseText = await response.text()
      console.log('API Response:', response.status, responseText)

      if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${responseText}`)
      }

      const session = JSON.parse(responseText)
      
      if (session.error) {
        throw new Error(`Session creation failed: ${session.error}`)
      }

      if (!session.id) {
        throw new Error('No session ID returned from API')
      }

      setTestResult(`✅ SUCCESS: Stripe is configured correctly! Session ID: ${session.id.substring(0, 20)}...`)
      
    } catch (error: any) {
      console.error('Stripe test error:', error)
      setTestResult(`❌ ERROR: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Stripe Configuration Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testStripeConfig}
          className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600"
        >
          Test Stripe Configuration
        </button>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Test Result:</h3>
            <p className="whitespace-pre-wrap">{testResult}</p>
          </div>
        )}
        
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Environment Check:</h3>
          <p>Publishable Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'PRESENT' : 'MISSING'}</p>
          <p>Key starts with: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10)}...</p>
        </div>

        <div className="bg-blue-50 p-4 rounded border">
          <h3 className="font-bold mb-2">About This Test:</h3>
          <p className="text-sm">This test checks:</p>
          <ul className="text-sm list-disc list-inside mt-2">
            <li>Stripe publishable key is loaded</li>
            <li>Stripe.js loads correctly</li>
            <li>Checkout session API works</li>
            <li>Firebase integration (for saving assessment)</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 