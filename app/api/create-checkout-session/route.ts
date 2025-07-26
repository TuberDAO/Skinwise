import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { convertPrice, type SupportedCurrency } from '@/lib/currency'

export async function POST(req: NextRequest) {
  try {
    console.log('=== Checkout Session API Called ===')
    const { assessmentData, userId, userEmail, currency = 'USD' } = await req.json()

    console.log('Request data:', { userId, userEmail, currency, hasAssessmentData: !!assessmentData })

    if (!assessmentData || !userId) {
      console.error('Missing required data:', { assessmentData: !!assessmentData, userId })
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // Get price in user's currency
    const priceInfo = convertPrice(currency as SupportedCurrency)
    console.log('Price calculation:', { currency, ...priceInfo })

    console.log('Creating Stripe checkout session...')

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'SkinWise Assessment',
              description: 'AI-assisted skin health analysis with professional review',
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
      metadata: {
        userId,
        assessmentId: `assessment_${Date.now()}`,
        originalCurrency: currency,
        originalAmount: priceInfo.amount.toString(),
      },
    })

    console.log('Stripe session created:', session.id)

    // Simplified Firestore save - skip if it fails
    try {
      console.log('Attempting to save to Firestore...')
      const { doc, setDoc } = await import('firebase/firestore')
      const { firestore } = await import('@/firebase')
      
      if (firestore) {
        const assessmentId = `assessment_${Date.now()}_${userId}`
        
        // Use timeout to prevent hanging
        const savePromise = setDoc(doc(firestore, 'assessments', assessmentId), {
          ...assessmentData,
          id: assessmentId,
          stripeSessionId: session.id,
          status: 'pending_payment',
          currency: currency,
          amount: priceInfo.amount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        
        // 5 second timeout for Firestore save
        await Promise.race([
          savePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
        ])
        
        console.log('Saved to Firestore successfully')
      } else {
        console.warn('Firestore not available, skipping save')
      }
    } catch (firestoreError) {
      console.warn('Firestore save failed, continuing with payment:', firestoreError)
      // Don't fail the whole request if Firestore fails
    }

    console.log('Returning session ID:', session.id)
    return NextResponse.json({ id: session.id })
    
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    )
  }
} 