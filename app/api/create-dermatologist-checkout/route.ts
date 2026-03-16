import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { convertDermatologistPrice, type SupportedCurrency } from '@/lib/currency'
import { rateLimit, createRateLimitResponse, logRateLimitViolation } from '@/lib/rate-limit'

// Vercel-specific: Configure runtime for optimal performance
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Valid price ranges (in cents) aligned with convertDermatologistPrice() floor amounts
// Base price £35 GBP; exact values from lib/currency convertDermatologistPrice()
const VALID_DERMATOLOGIST_PRICES = {
  'USD': { min: 4695, max: 4705 },
  'GBP': { min: 3495, max: 3505 },
  'EUR': { min: 3995, max: 4005 },
  'CAD': { min: 5895, max: 5905 },
  'AUD': { min: 6395, max: 6405 },
  'JPY': { min: 526800, max: 527800 },
  'CHF': { min: 4195, max: 4205 },
  'SEK': { min: 45495, max: 45505 },
  'NOK': { min: 43095, max: 43105 },
  'DKK': { min: 30195, max: 30205 },
} as const

/**
 * Validate dermatologist consultation amount
 */
function validateConsultationAmount(currency: string, cents: number): boolean {
  const range = VALID_DERMATOLOGIST_PRICES[currency as keyof typeof VALID_DERMATOLOGIST_PRICES]
  if (!range) {
    console.warn('🚨 Invalid currency for consultation:', currency)
    return false
  }
  
  const isValid = cents >= range.min && cents <= range.max
  if (!isValid) {
    console.warn('🚨 Consultation amount out of range:', { currency, cents, expectedRange: range })
  }
  
  return isValid
}

/**
 * Validate appointment data
 */
function validateAppointmentData(data: any): { valid: boolean; reason?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, reason: 'Appointment data is required' }
  }

  const { serviceType, date, time, patientName, patientEmail, appointmentType, submissionDate } = data

  // Check if this is a case review or appointment booking
  if (serviceType === 'anonymous_case_review') {
    // Validate case review data
    if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 1) {
      return { valid: false, reason: 'Valid patient name is required' }
    }

    if (!patientEmail || typeof patientEmail !== 'string') {
      return { valid: false, reason: 'Valid patient email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(patientEmail)) {
      return { valid: false, reason: 'Invalid email format' }
    }

    if (!submissionDate || typeof submissionDate !== 'string') {
      return { valid: false, reason: 'Valid submission date is required' }
    }

    return { valid: true }
  } else {
    // Original appointment booking validation
    if (!date || typeof date !== 'string') {
      return { valid: false, reason: 'Valid appointment date is required' }
    }

    if (!time || typeof time !== 'string') {
      return { valid: false, reason: 'Valid appointment time is required' }
    }

    if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
      return { valid: false, reason: 'Valid patient name is required' }
    }

    if (!patientEmail || typeof patientEmail !== 'string') {
      return { valid: false, reason: 'Valid patient email is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(patientEmail)) {
      return { valid: false, reason: 'Invalid email format' }
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return { valid: false, reason: 'Invalid date format (YYYY-MM-DD required)' }
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/
    if (!timeRegex.test(time)) {
      return { valid: false, reason: 'Invalid time format (HH:MM required)' }
    }

    // Validate appointment is in the future
    const appointmentDateTime = new Date(`${date}T${time}`)
    if (appointmentDateTime <= new Date()) {
      return { valid: false, reason: 'Appointment must be in the future' }
    }

    // Validate appointment type if provided
    if (appointmentType && appointmentType !== 'dermatologist_consultation') {
      return { valid: false, reason: 'Invalid appointment type' }
    }

    return { valid: true }
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting for payment endpoints
    const rateLimitResult = await rateLimit(req, 'checkout')
    if (!rateLimitResult.success) {
      logRateLimitViolation(req, 'checkout', req.ip || 'unknown')
      return createRateLimitResponse(rateLimitResult)
    }

    const { appointmentData, userEmail, currency = 'USD' } = await req.json()

    // Validate required data
    if (!appointmentData || !userEmail) {
      console.warn('🚨 Dermatologist checkout: Missing required data:', { 
        appointmentData: !!appointmentData, 
        userEmail: !!userEmail 
      })
      return NextResponse.json({ error: 'Missing required appointment data' }, { status: 400 })
    }

    // Validate appointment data structure
    const appointmentValidation = validateAppointmentData(appointmentData)
    if (!appointmentValidation.valid) {
      console.warn('🚨 Dermatologist checkout: Invalid appointment data:', appointmentValidation.reason)
      return NextResponse.json({ error: appointmentValidation.reason }, { status: 400 })
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK']
    if (!supportedCurrencies.includes(currency)) {
      console.warn('🚨 Dermatologist checkout: Unsupported currency:', currency)
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
    }

    // Validate appointment data
    const { date, time, patientName, patientEmail, appointmentType } = appointmentData

    // Get and validate price
    const priceInfo = convertDermatologistPrice(currency as SupportedCurrency)

    // Validate consultation amount against expected ranges
    if (!validateConsultationAmount(currency, priceInfo.cents)) {
      console.error('🚨 SECURITY ALERT: Consultation amount manipulation detected', {
        currency,
        providedCents: priceInfo.cents,
        userEmail,
        patientEmail,
        ip: req.ip,
        userAgent: req.headers.get('user-agent')
      })
      
      return NextResponse.json({ 
        error: 'Invalid consultation amount',
        message: 'Consultation amount does not match expected price'
      }, { status: 400 })
    }

    // Generate appointment ID for reference
    const appointmentId = `appointment_${Date.now()}_${patientEmail.replace('@', '_').replace('.', '_')}`

    // Create Stripe checkout session with enhanced security
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Dermatologist Consultation',
              description: '15-minute online consultation with board-certified dermatologist',
              metadata: {
                type: 'dermatologist_consultation',
                duration: '15_minutes',
                version: '1.0'
              }
            },
            unit_amount: priceInfo.cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/booking-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/book-dermatologist`,
      customer_email: appointmentData.patientEmail || userEmail,
      // Enhanced metadata for security and tracking
      metadata: {
        appointmentType: 'dermatologist_consultation',
        referenceId: appointmentId, // Add referenceId for webhook processing
        patientName: patientName.substring(0, 100), // Limit length
        patientEmail,
        appointmentDate: date,
        appointmentTime: time,
        phoneNumber: appointmentData.phoneNumber?.substring(0, 20) || '',
        duration: '15',
        originalCurrency: currency,
        originalAmount: priceInfo.amount.toString(),
        createdAt: new Date().toISOString(),
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent')?.substring(0, 200) || 'unknown',
        type: 'dermatologist_appointment'
      },
      // Security enhancements
      allow_promotion_codes: false, // Disable promo codes for security
      billing_address_collection: 'required', // Collect billing address
      payment_intent_data: {
        description: `SkinWise Dermatologist Consultation - ${patientName}`,
        statement_descriptor_suffix: 'SKINWISE',
        metadata: {
          patientEmail,
          appointmentDate: date,
          type: 'consultation'
        }
      }
    })

    // Enhanced Firestore save with security logging
    try {
      const { doc, setDoc } = await import('firebase/firestore')
      const { firestore } = await import('@/firebase')
      
      if (firestore) {
        // Sanitize and prepare data for storage
        const sanitizedData = {
          ...appointmentData,
          id: appointmentId,
          stripeSessionId: session.id,
          status: 'pending_payment',
          currency: currency,
          amount: priceInfo.amount,
          paymentStatus: 'pending',
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
        const savePromise = setDoc(doc(firestore, 'appointments', appointmentId), sanitizedData)
        
        // 5 second timeout for Firestore save
        await Promise.race([
          savePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
        ])
        
      } else {
        console.warn('⚠️ Firestore not available, skipping save')
      }
    } catch (firestoreError) {
      console.warn('⚠️ Firestore save failed, continuing with payment:', firestoreError)
      // Don't fail the whole request if Firestore fails
    }

    return NextResponse.json({ 
      id: session.id,
      rateLimitRemaining: rateLimitResult.remaining
    })
    
  } catch (error: any) {
    console.error('❌ Error creating dermatologist checkout session:', error)
    
    // Security logging for payment errors
    console.error('🚨 DERMATOLOGIST PAYMENT ERROR DETAILS:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      ip: req.ip,
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })
    
    // Don't expose internal error details to client
    return NextResponse.json({
      error: 'Consultation booking temporarily unavailable',
      message: 'Please try again in a few moments'
    }, { status: 500 })
  }
} 