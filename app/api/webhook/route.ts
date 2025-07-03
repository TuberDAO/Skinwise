import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { doc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore'
import { firestore } from '@/firebase'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      try {
        // Check if firestore is initialized
        if (!firestore) {
          console.error('Firestore not initialized')
          return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        // Find and update assessment in Firestore
        const assessmentsRef = collection(firestore, 'assessments')
        const q = query(assessmentsRef, where('stripeSessionId', '==', session.id))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const assessmentDoc = querySnapshot.docs[0]
          await updateDoc(assessmentDoc.ref, {
            status: 'paid',
            stripePaymentIntentId: session.payment_intent,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paymentAmount: session.amount_total,
            currency: session.currency,
          })
          
          console.log('Assessment payment confirmed:', assessmentDoc.id)
          
          // Here you could trigger additional actions like:
          // - Send confirmation email
          // - Notify admin of new paid assessment
          // - Start AI analysis process
        } else {
          console.error('Assessment not found for session:', session.id)
        }
      } catch (error) {
        console.error('Error updating assessment after payment:', error)
      }
      break

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      
      // Handle failed payment - could update assessment status
      try {
        // Check if firestore is initialized
        if (!firestore) {
          console.error('Firestore not initialized')
          return NextResponse.json({ error: 'Database not available' }, { status: 500 })
        }

        const assessmentsRef = collection(firestore, 'assessments')
        const q = query(assessmentsRef, where('stripePaymentIntentId', '==', paymentIntent.id))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const assessmentDoc = querySnapshot.docs[0]
          await updateDoc(assessmentDoc.ref, {
            status: 'payment_failed',
            updatedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error('Error updating assessment after payment failure:', error)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
} 