import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { convertDermatologistPrice, type SupportedCurrency } from '@/lib/currency'

export async function POST(req: NextRequest) {
  try {
    console.log('=== Dermatologist Checkout Session API Called ===')
    const { appointmentData, userEmail, currency = 'USD' } = await req.json()

    console.log('Request data:', { userEmail, currency, hasAppointmentData: !!appointmentData })

    if (!appointmentData || !userEmail) {
      console.error('Missing required data:', { appointmentData: !!appointmentData, userEmail })
      return NextResponse.json({ error: 'Missing required appointment data' }, { status: 400 })
    }

    // Validate appointment data
    const { date, time, patientName, patientEmail, appointmentType } = appointmentData
    if (!date || !time || !patientName || !patientEmail) {
      console.error('Missing appointment details:', { date, time, patientName, patientEmail })
      return NextResponse.json({ error: 'Missing appointment details' }, { status: 400 })
    }

    // Get price in user's currency
    const priceInfo = convertDermatologistPrice(currency as SupportedCurrency)
    console.log('Price calculation:', { currency, ...priceInfo })

    console.log('Creating Stripe checkout session for dermatologist appointment...')

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Dermatologist Consultation',
              description: '15-minute online consultation with board-certified dermatologist',
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
      metadata: {
        appointmentType: 'dermatologist_consultation',
        patientName,
        patientEmail,
        appointmentDate: date,
        appointmentTime: time,
        phoneNumber: appointmentData.phoneNumber || '',
        duration: '15',
        originalCurrency: currency,
        originalAmount: priceInfo.amount.toString(),
      },
    })

    console.log('Stripe session created:', session.id)

    // Save appointment data to Firestore (optional, don't fail if it doesn't work)
    try {
      console.log('Attempting to save appointment to Firestore...')
      const { doc, setDoc } = await import('firebase/firestore')
      const { firestore } = await import('@/firebase')
      
      if (firestore) {
        const appointmentId = `appointment_${Date.now()}_${patientEmail.replace('@', '_')}`
        
        // Use timeout to prevent hanging
        const savePromise = setDoc(doc(firestore, 'appointments', appointmentId), {
          ...appointmentData,
          id: appointmentId,
          stripeSessionId: session.id,
          status: 'pending_payment',
          currency: currency,
          amount: priceInfo.amount,
          paymentStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        
        // 5 second timeout for Firestore save
        await Promise.race([
          savePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 5000))
        ])
        
        console.log('Saved appointment to Firestore successfully')
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
    console.error('Error creating dermatologist checkout session:', error)
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    )
  }
} 