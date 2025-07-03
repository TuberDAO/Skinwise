'use client'

export default function DebugEnvPage() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment Status</h2>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-mono text-sm">{key}:</span>{' '}
              <span className={value ? 'text-green-600' : 'text-red-600'}>
                {value ? '✅ LOADED' : '❌ MISSING'}
              </span>
              {value && (
                <span className="ml-2 text-xs text-gray-500">
                  ({typeof value === 'string' ? value.substring(0, 10) + '...' : value})
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">Firebase Initialization Test</h2>
          <button 
            onClick={async () => {
              try {
                const { storage } = await import('@/firebase')
                console.log('Storage status:', !!storage)
                alert(`Storage initialized: ${!!storage}`)
              } catch (error) {
                console.error('Firebase import error:', error)
                alert(`Firebase error: ${error}`)
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Firebase Storage
          </button>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-bold mb-2">Raw Environment Check</h2>
          <p className="text-sm">Check browser console for detailed logs</p>
          <script dangerouslySetInnerHTML={{
            __html: `
              console.log('Environment variables check:');
              console.log('API_KEY:', typeof process !== 'undefined' ? 'Server' : window.process?.env?.NEXT_PUBLIC_FIREBASE_API_KEY || 'MISSING');
              console.log('All env vars:', ${JSON.stringify(envVars)});
            `
          }} />
        </div>
      </div>
    </div>
  )
} 