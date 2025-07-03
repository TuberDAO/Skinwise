'use client'

import { useState } from 'react'

export default function DebugStripePage() {
  const [testResult, setTestResult] = useState('')

  const testStripeConfig = async () => {
    setTestResult('Testing Stripe configuration...')
    
    try {
      // Test environment variables
      const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      
      if (!hasPublishableKey) {
        throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing from environment variables')
      }

      // Test simple API first
      setTestResult('Testing basic API connectivity...')
      console.log('Testing simple API...')
      
      const simpleResponse = await fetch('/api/test-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      })
      
      console.log('Simple API response:', simpleResponse.status)
      const simpleResult = await simpleResponse.text()
      console.log('Simple API result:', simpleResult)
      
      if (!simpleResponse.ok) {
        throw new Error(`Simple API failed: ${simpleResult}`)
      }

      // Test Stripe.js loading
      setTestResult('Loading Stripe.js...')
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      if (!stripe) {
        throw new Error('Failed to load Stripe.js')
      }

      // Test API route call with detailed logging and timeout
      setTestResult('Testing checkout session creation...')
      console.log('About to call checkout API with test data...')
      
      const testPayload = {
        assessmentData: {
          photos: ['https://example.com/test-photo.jpg'],
          textDescription: 'test description for stripe test',
          timestamp: new Date().toISOString(),
          status: 'pending_payment'
        },
        userId: 'test-user-id-' + Date.now(),
        userEmail: 'test@example.com',
      }
      
      console.log('Test payload:', testPayload)
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('Response received:', response.status, response.statusText)
      const responseText = await response.text()
      console.log('Response text:', responseText)

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

      setTestResult(`✅ SUCCESS: Stripe is configured correctly! 
Session ID: ${session.id.substring(0, 30)}...
Check console for detailed logs.`)
      
    } catch (error: any) {
      console.error('Stripe test error:', error)
      
      if (error.name === 'AbortError') {
        setTestResult(`❌ TIMEOUT: API call timed out after 10 seconds
This suggests the server is hanging. Check server logs.`)
      } else {
        setTestResult(`❌ ERROR: ${error.message}

Check the browser console for detailed logs.`)
      }
    }
  }

  const testEnvVars = async () => {
    setTestResult('Testing environment variables...')
    
    try {
      const response = await fetch('/api/test-env', { method: 'POST' })
      const result = await response.text()
      setTestResult(`Environment test result:\n${result}`)
    } catch (error: any) {
      setTestResult(`❌ ENV TEST ERROR: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Stripe Configuration Test</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testStripeConfig}
            className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600"
          >
            Test Stripe Configuration
          </button>
          
          <button
            onClick={testEnvVars}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
          >
            Test Server Environment
          </button>
        </div>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Test Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
          </div>
        )}
        
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Client Environment Check:</h3>
          <p>Publishable Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'PRESENT' : 'MISSING'}</p>
          <p>Key starts with: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 15)}...</p>
        </div>

        <div className="bg-blue-50 p-4 rounded border">
          <h3 className="font-bold mb-2">About This Test:</h3>
          <p className="text-sm">This test checks:</p>
          <ul className="text-sm list-disc list-inside mt-2">
            <li>Stripe publishable key is loaded (client-side)</li>
            <li>Stripe.js loads correctly</li>
            <li>Checkout session API works (server-side)</li>
            <li>Server environment variables (if test route exists)</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 