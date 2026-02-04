import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { convertPrice, type SupportedCurrency } from '@/lib/currency'
import { rateLimit, createRateLimitResponse, logRateLimitViolation } from '@/lib/rate-limit'

// Vercel-specific: Configure runtime for optimal performance
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Valid price ranges (in cents) to prevent payment manipulation
// Base price is £6 GBP, converted to other currencies
const VALID_ASSESSMENT_PRICES = {
  'USD': { min: 700, max: 1200 }, // ~$8-12 (£6 converted)
  'GBP': { min: 500, max: 800 }, // £5-8  
  'EUR': { min: 600, max: 1000 }, // €6-10
  'CAD': { min: 900, max: 1500 }, // C$9-15
  'AUD': { min: 1000, max: 1600 }, // A$10-16
  'JPY': { min: 900, max: 1500 }, // ¥900-1500
  'CHF': { min: 600, max: 1000 }, // CHF 6-10
  'SEK': { min: 7000, max: 12000 }, // SEK 70-120
  'NOK': { min: 7000, max: 12000 }, // NOK 70-120
  'DKK': { min: 5000, max: 9000 }, // DKK 50-90
} as const

/**
 * Validate payment amount against expected ranges
 */
function validatePaymentAmount(currency: string, cents: number): boolean {
  const range = VALID_ASSESSMENT_PRICES[currency as keyof typeof VALID_ASSESSMENT_PRICES]
  if (!range) {
    console.warn('🚨 Invalid currency for payment:', currency)
    return false
  }
  
  const isValid = cents >= range.min && cents <= range.max
  if (!isValid) {
    console.warn('🚨 Payment amount out of range:', { currency, cents, expectedRange: range })
  }
  
  return isValid
}

/**
 * Validate and sanitize assessment data
 */
function validateAssessmentData(data: any): { valid: boolean; reason?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, reason: 'Assessment data is required' }
  }

  const { email, files, userId } = data

  // Validate email
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Valid email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' }
  }

  // Validate files array
  if (!files || !Array.isArray(files) || files.length === 0) {
    return { valid: false, reason: 'At least one file is required' }
  }

  if (files.length > 4) {
    return { valid: false, reason: 'Maximum 4 files allowed' }
  }

  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    return { valid: false, reason: 'User ID is required' }
  }

  return { valid: true }
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Checkout Session API Called (SECURITY PROTECTED) ===')
    
    // Apply rate limiting for payment endpoints
    const rateLimitResult = await rateLimit(req, 'checkout')
    if (!rateLimitResult.success) {
      logRateLimitViolation(req, 'checkout', req.ip || 'unknown')
      return createRateLimitResponse(rateLimitResult)
    }

    const { assessmentData, userId, userEmail, currency = 'USD' } = await req.json()

    console.log('Request data (sanitized):', { 
      userId: userId ? 'present' : 'missing', 
      userEmail: userEmail ? 'present' : 'missing', 
      currency, 
      hasAssessmentData: !!assessmentData 
    })

    // Validate required data
    if (!assessmentData || !userId) {
      console.warn('🚨 Checkout: Missing required data:', { assessmentData: !!assessmentData, userId: !!userId })
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Validate assessment data structure
    const assessmentValidation = validateAssessmentData(assessmentData)
    if (!assessmentValidation.valid) {
      console.warn('🚨 Checkout: Invalid assessment data:', assessmentValidation.reason)
      return NextResponse.json({ error: assessmentValidation.reason }, { status: 400 })
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK']
    if (!supportedCurrencies.includes(currency)) {
      console.warn('🚨 Checkout: Unsupported currency:', currency)
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
    }

    // Get and validate price
    const priceInfo = convertPrice(currency as SupportedCurrency)
    console.log('Price calculation:', { currency, ...priceInfo })

    // Validate payment amount against expected ranges
    if (!validatePaymentAmount(currency, priceInfo.cents)) {
      console.error('🚨 SECURITY ALERT: Payment amount manipulation detected', {
        currency,
        providedCents: priceInfo.cents,
        userId,
        userEmail,
        ip: req.ip,
        userAgent: req.headers.get('user-agent')
      })
      
      return NextResponse.json({ 
        error: 'Invalid payment amount',
        message: 'Payment amount does not match expected price'
      }, { status: 400 })
    }

    console.log('✅ Payment validation passed - creating Stripe session')

    // Create Stripe checkout session with enhanced security
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'SkinWise Assessment',
              description: 'AI-assisted skin health analysis with professional review',
              metadata: {
                type: 'assessment',
                version: '1.0'
              }
            },
            unit_amount: priceInfo.cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment`,
      customer_email: assessmentData.email || userEmail,
      // Enhanced metadata for security and tracking
      metadata: {
        userId,
        referenceId: assessmentData.id, // Use the actual document ID from the user's submission
        assessmentId: `assessment_${Date.now()}`,
        originalCurrency: currency,
        originalAmount: priceInfo.amount.toString(),
        createdAt: new Date().toISOString(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent')?.substring(0, 200) || 'unknown',
        type: 'skin_assessment'
      },
      // Security enhancements
      allow_promotion_codes: false, // Disable promo codes for security
      billing_address_collection: 'required', // Collect billing address
      payment_intent_data: {
        description: `SkinWise Assessment - User: ${userId}`,
        statement_descriptor_suffix: 'SKINWISE',
        metadata: {
          userId,
          type: 'assessment'
        }
      }
    })

    console.log('✅ Stripe session created:', session.id)

    // Enhanced Firestore save with security logging
    try {
      console.log('Attempting to save to Firestore...')
      const { doc, setDoc } = await import('firebase/firestore')
      const { firestore } = await import('@/firebase')
      
      if (firestore) {
        const assessmentId = `assessment_${Date.now()}_${userId}`
        
        // Sanitize and prepare data for storage
        const sanitizedData = {
          ...assessmentData,
          id: assessmentId,
          stripeSessionId: session.id,
          status: 'pending_payment',
          currency: currency,
          amount: priceInfo.amount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Security metadata
          securityInfo: {
            ipAddress: req.ip || 'unknown',
            userAgent: req.headers.get('user-agent')?.substring(0, 200) || 'unknown',
            rateLimitRemaining: rateLimitResult.remaining
          }
        }
        
        // Use timeout to prevent hanging
        const savePromise = setDoc(doc(firestore, 'assessments', assessmentId), sanitizedData)
        
        // 5 second timeout for Firestore save
        await Promise.race([
          savePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
        ])
        
        console.log('✅ Saved to Firestore successfully')
      } else {
        console.warn('⚠️ Firestore not available, skipping save')
      }
    } catch (firestoreError) {
      console.warn('⚠️ Firestore save failed, continuing with payment:', firestoreError)
      // Don't fail the whole request if Firestore fails
    }

    console.log('✅ Returning session ID:', session.id)
    return NextResponse.json({ 
      id: session.id,
      rateLimitRemaining: rateLimitResult.remaining
    })
    
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error)
    
    // Security logging for payment errors
    console.error('🚨 PAYMENT ERROR DETAILS:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      ip: req.ip,
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })
    
    // Don't expose internal error details to client
    return NextResponse.json({
      error: 'Payment system temporarily unavailable',
      message: 'Please try again in a few moments'
    }, { status: 500 })
  }
} 