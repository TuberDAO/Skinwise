import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { doc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore'
import { firestore } from '@/firebase'
import { sendAssessmentConfirmation, sendAppointmentConfirmation } from '@/lib/email'
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

        // Check metadata to determine if this is an assessment or appointment
        const appointmentType = session.metadata?.appointmentType
        
        if (appointmentType === 'dermatologist_consultation') {
          console.log('Processing dermatologist appointment payment:', session.id)
          
          // Handle dermatologist appointment payment
          const appointmentsRef = collection(firestore, 'appointments')
          const q = query(appointmentsRef, where('stripeSessionId', '==', session.id))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const appointmentDoc = querySnapshot.docs[0]
            const appointmentData = appointmentDoc.data()
            
            await updateDoc(appointmentDoc.ref, {
              status: 'paid',
              paymentStatus: 'completed',
              stripePaymentIntentId: session.payment_intent,
              paidAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              paymentAmount: session.amount_total,
              currency: session.currency,
            })
            
            console.log('Appointment payment confirmed:', appointmentDoc.id)
            
            // Send appointment confirmation email
            try {
              const emailResult = await sendAppointmentConfirmation({
                customerEmail: appointmentData.patientEmail,
                patientName: appointmentData.patientName,
                appointmentDate: appointmentData.date,
                appointmentTime: appointmentData.time,
                sessionId: session.id,
                currency: session.currency?.toUpperCase() || 'GBP',
                amount: (session.amount_total || 0) / 100,
                bookingDate: new Date().toLocaleDateString()
              })
              
              if (emailResult.success) {
                console.log('✅ Appointment confirmation email sent:', emailResult.messageId)
              } else {
                console.error('❌ Failed to send appointment confirmation email:', emailResult.error)
              }
            } catch (emailError) {
              console.error('❌ Error sending appointment confirmation email:', emailError)
            }
          } else {
            console.error('Appointment not found for session:', session.id)
          }
        } else {
          console.log('Processing assessment payment:', session.id)
          
          // Handle assessment payment (default behavior)
          const assessmentsRef = collection(firestore, 'assessments')
          const q = query(assessmentsRef, where('stripeSessionId', '==', session.id))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const assessmentDoc = querySnapshot.docs[0]
            const assessmentData = assessmentDoc.data()
            
            await updateDoc(assessmentDoc.ref, {
              status: 'paid',
              stripePaymentIntentId: session.payment_intent,
              paidAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              paymentAmount: session.amount_total,
              currency: session.currency,
            })
            
            console.log('Assessment payment confirmed:', assessmentDoc.id)
            
            // Send assessment confirmation email
            try {
              const emailResult = await sendAssessmentConfirmation({
                customerEmail: assessmentData.email,
                customerName: undefined, // Could extract from user data if available
                sessionId: session.id,
                currency: session.currency?.toUpperCase() || 'GBP',
                amount: (session.amount_total || 0) / 100,
                submissionDate: new Date().toLocaleDateString()
              })
              
              if (emailResult.success) {
                console.log('✅ Assessment confirmation email sent:', emailResult.messageId)
              } else {
                console.error('❌ Failed to send assessment confirmation email:', emailResult.error)
              }
            } catch (emailError) {
              console.error('❌ Error sending assessment confirmation email:', emailError)
            }
          } else {
            console.error('Assessment not found for session:', session.id)
          }
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