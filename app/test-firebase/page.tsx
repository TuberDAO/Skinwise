'use client'

import { useState } from 'react'

export default function TestFirebasePage() {
  const [testResult, setTestResult] = useState('')

  const testStorageConnection = async () => {
    setTestResult('Testing...')
    
    try {
      // Test direct Firebase Storage connection
      const { initializeApp } = await import('firebase/app')
      const { getStorage, ref, uploadBytes } = await import('firebase/storage')
      const { getAuth, signInAnonymously } = await import('firebase/auth')
      
      // Create a minimal test config
      const testConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }
      
      console.log('Test config:', testConfig)
      
      if (!testConfig.storageBucket) {
        throw new Error('Storage bucket not found in environment variables')
      }
      
      // Initialize app and auth for test
      const testApp = initializeApp(testConfig, 'test-app-' + Date.now())
      const testAuth = getAuth(testApp)
      const testStorage = getStorage(testApp)
      
      // Sign in anonymously to get a user ID
      setTestResult('Authenticating...')
      const userCred = await signInAnonymously(testAuth)
      const userId = userCred.user.uid
      
      // Create a tiny test file using the correct path pattern: assessments/{userId}/
      setTestResult('Uploading test file...')
      const testBlob = new Blob(['test upload'], { type: 'text/plain' })
      const testRef = ref(testStorage, `assessments/${userId}/test-${Date.now()}.txt`)
      
      await uploadBytes(testRef, testBlob)
      
      setTestResult(`✅ SUCCESS: Firebase Storage is working! Uploaded to assessments/${userId}/`)
      
    } catch (error: any) {
      console.error('Storage test error:', error)
      setTestResult(`❌ ERROR: ${error.message}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Firebase Storage Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testStorageConnection}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
        >
          Test Firebase Storage Upload
        </button>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Test Result:</h3>
            <p className="whitespace-pre-wrap">{testResult}</p>
          </div>
        )}
        
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Environment Check:</h3>
          <p>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING'}</p>
          <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING'}</p>
          <p>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'PRESENT' : 'MISSING'}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded border">
          <h3 className="font-bold mb-2">About This Test:</h3>
          <p className="text-sm">This test signs in anonymously and uploads to <code>assessments/[userId]/</code> which matches your Firebase Storage rules.</p>
        </div>
      </div>
    </div>
  )
} 