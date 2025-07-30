import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Firebase Configuration (safe to expose in debug)
      firebase: {
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'missing',
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      },
      
      // Google OAuth Configuration (check presence only)
      googleOAuth: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 12) || 'missing',
      },
      
      // Configuration Recommendations
      expectedSetup: {
        firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        expectedRedirectUri: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 
          ? `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/auth/handler`
          : 'Firebase auth domain not configured',
        googleCloudConsoleSetup: {
          authorizedJavaScriptOrigins: ['https://skinwiseapp.com'],
          authorizedRedirectUris: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN 
            ? [`https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/auth/handler`]
            : ['Firebase auth domain not configured']
        }
      },
      
      // Status Check
      status: {
        firebaseConfigured: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ),
        googleOAuthConfigured: !!(
          process.env.GOOGLE_CLIENT_ID && 
          process.env.GOOGLE_CLIENT_SECRET
        ),
        readyForProduction: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        )
      }
    }
    
    return NextResponse.json(debugInfo, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 