import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const envCheck = {
      // Stripe variables (server-side)
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_PREFIX: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'MISSING',
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      
      // Firebase variables (should be available on server too)
      NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      
      // Public Stripe variable (should be available)
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PREFIX: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 15) || 'MISSING',
    }

    const missingVars = Object.entries(envCheck)
      .filter(([key, value]) => key.endsWith('_KEY') || key.endsWith('_SECRET') ? !value : false)
      .map(([key]) => key)

    let result = `=== Server Environment Check ===\n\n`
    
    Object.entries(envCheck).forEach(([key, value]) => {
      if (key.includes('PREFIX')) {
        result += `${key}: ${value}\n`
      } else {
        result += `${key}: ${value ? '✅ PRESENT' : '❌ MISSING'}\n`
      }
    })

    if (missingVars.length > 0) {
      result += `\n⚠️  Missing critical variables: ${missingVars.join(', ')}\n`
    }

    result += `\n📁 Check your .env.local file contains:\n`
    result += `STRIPE_SECRET_KEY=sk_test_...\n`
    result += `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...\n`
    result += `STRIPE_WEBHOOK_SECRET=whsec_...\n`

    return new Response(result, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
    
  } catch (error: any) {
    return new Response(`Server error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
} 