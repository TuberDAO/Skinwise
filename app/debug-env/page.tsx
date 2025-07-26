'use client'

import { useEffect, useState } from 'react'
import { auth, firestore, storage } from '@/firebase'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function DebugEnvPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { user, loading } = useAuth()

  const runDiagnostics = async () => {
    setIsRunning(true)
    const diagnostics: DiagnosticResult[] = []

    // Check environment variables
    const envVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ]

    envVars.forEach(envVar => {
      const value = process.env[envVar]
      diagnostics.push({
        name: `Environment Variable: ${envVar}`,
        status: value ? 'success' : 'error',
        message: value ? 'Present' : 'Missing',
        details: value ? `${value.substring(0, 10)}...` : undefined
      })
    })

    // Check Firebase services
    diagnostics.push({
      name: 'Firebase Auth',
      status: auth ? 'success' : 'error',
      message: auth ? 'Initialized' : 'Not initialized',
      details: auth ? { currentUser: !!auth.currentUser } : undefined
    })

    diagnostics.push({
      name: 'Firebase Firestore',
      status: firestore ? 'success' : 'error',
      message: firestore ? 'Initialized' : 'Not initialized',
      details: firestore ? { app: firestore.app.name } : undefined
    })

    diagnostics.push({
      name: 'Firebase Storage',
      status: storage ? 'success' : 'error',
      message: storage ? 'Initialized' : 'Not initialized',
      details: storage ? { bucket: storage.app.options.storageBucket } : undefined
    })

    // Check Auth Provider state
    diagnostics.push({
      name: 'Auth Provider User',
      status: user ? 'success' : loading ? 'warning' : 'error',
      message: user ? 'User authenticated' : loading ? 'Loading...' : 'No user',
      details: user ? { uid: user.uid, email: user.email } : undefined
    })

    // Test Firestore connection
    if (firestore) {
      try {
        // Try to create a test document
        const { collection, addDoc, deleteDoc, doc } = await import('firebase/firestore')
        const testDoc = await addDoc(collection(firestore, 'test'), { test: true, timestamp: new Date() })
        await deleteDoc(doc(firestore, 'test', testDoc.id))
        
        diagnostics.push({
          name: 'Firestore Write/Delete Test',
          status: 'success',
          message: 'Can write and delete documents',
          details: { testDocId: testDoc.id }
        })
      } catch (error) {
        diagnostics.push({
          name: 'Firestore Write Test',
          status: 'error',
          message: 'Failed to write to Firestore',
          details: error instanceof Error ? error.message : String(error)
        })
      }
    }

    // Test Storage connection
    if (storage && user) {
      try {
        const { ref, uploadBytes, getDownloadURL, deleteObject } = await import('firebase/storage')
        
        // Create a small test file
        const testBlob = new Blob(['test'], { type: 'text/plain' })
        const testRef = ref(storage, `test/${user.uid}/test-${Date.now()}.txt`)
        
        const snapshot = await uploadBytes(testRef, testBlob)
        const url = await getDownloadURL(snapshot.ref)
        await deleteObject(testRef)
        
        diagnostics.push({
          name: 'Storage Upload/Delete Test',
          status: 'success',
          message: 'Can upload and delete files',
          details: { testUrl: url.substring(0, 50) + '...' }
        })
      } catch (error) {
        diagnostics.push({
          name: 'Storage Upload Test',
          status: 'error',
          message: 'Failed to upload to Storage',
          details: error instanceof Error ? error.message : String(error)
        })
      }
    } else if (!user) {
      diagnostics.push({
        name: 'Storage Upload Test',
        status: 'warning',
        message: 'Skipped - no authenticated user',
        details: 'Need to be logged in to test storage'
      })
    }

    // Check browser localStorage/sessionStorage
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      diagnostics.push({
        name: 'Browser localStorage',
        status: 'success',
        message: 'Available',
        details: undefined
      })
    } catch (error) {
      diagnostics.push({
        name: 'Browser localStorage',
        status: 'error',
        message: 'Not available',
        details: error instanceof Error ? error.message : String(error)
      })
    }

    try {
      sessionStorage.setItem('test', 'test')
      sessionStorage.removeItem('test')
      diagnostics.push({
        name: 'Browser sessionStorage',
        status: 'success',
        message: 'Available',
        details: undefined
      })
    } catch (error) {
      diagnostics.push({
        name: 'Browser sessionStorage',
        status: 'error',
        message: 'Not available',
        details: error instanceof Error ? error.message : String(error)
      })
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  useEffect(() => {
    // Auto-run diagnostics on page load
    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-teal-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-brand-blue">Firebase Diagnostics</h1>
          <p className="text-slate-600">Testing Firebase configuration and connectivity</p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Diagnostic Results</h2>
            
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={index} className={`${getStatusColor(result.status)} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{result.name}</h3>
                          <span className={`text-sm px-2 py-1 rounded ${
                            result.status === 'success' ? 'bg-green-100 text-green-800' :
                            result.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{result.message}</p>
                        {result.details && (
                          <pre className="text-xs bg-white bg-opacity-50 p-2 rounded mt-2 overflow-x-auto">
                            {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-green-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-yellow-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-red-600">Failed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 