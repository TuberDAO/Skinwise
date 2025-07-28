import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { doc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore'
import { firestore } from '@/firebase'
import { sendAssessmentConfirmation, sendAppointmentConfirmation } from '@/lib/email'
import { rateLimit, createRateLimitResponse, logRateLimitViolation } from '@/lib/rate-limit'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    console.log('=== Stripe Webhook Called (SECURITY PROTECTED) ===')
    
    // Apply rate limiting for webhook endpoints (more generous than regular APIs)
    const rateLimitResult = await rateLimit(req, 'webhook')
    if (!rateLimitResult.success) {
      logRateLimitViolation(req, 'webhook', req.ip || 'unknown')
      return createRateLimitResponse(rateLimitResult)
    }

    // Security: Validate that endpoint secret is configured
    if (!endpointSecret) {
      console.error('🚨 SECURITY ALERT: Webhook endpoint secret not configured')
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 })
    }

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    // Security: Ensure signature is present
    if (!sig) {
      console.warn('🚨 Webhook: Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
      console.log('✅ Webhook signature verified:', event.type)
    } catch (err: any) {
      console.error('🚨 Webhook signature verification failed:', err.message, {
        ip: req.ip,
        userAgent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      })
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Security logging for webhook events
    console.log('📥 Processing webhook event:', {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
      ip: req.ip
    })

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        try {
          // Security: Validate session data
          if (!session.id || !session.metadata) {
            console.warn('🚨 Invalid session data in webhook:', { sessionId: session.id })
            return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
          }

          // Check if firestore is initialized
          if (!firestore) {
            console.error('🚨 Firestore not initialized for webhook processing')
            return NextResponse.json({ error: 'Database not available' }, { status: 500 })
          }

          // Check metadata to determine if this is an assessment or appointment
          const appointmentType = session.metadata?.appointmentType
          
          if (appointmentType === 'dermatologist_consultation') {
            console.log('📋 Processing dermatologist appointment payment:', session.id)
            
            // Handle dermatologist appointment payment
            const appointmentsRef = collection(firestore, 'appointments')
            const q = query(appointmentsRef, where('stripeSessionId', '==', session.id))
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const appointmentDoc = querySnapshot.docs[0]
              const appointmentData = appointmentDoc.data()
              
              // Security: Validate appointment data before processing
              if (!appointmentData.patientEmail || !appointmentData.patientName) {
                console.warn('🚨 Invalid appointment data for webhook:', appointmentDoc.id)
                return NextResponse.json({ error: 'Invalid appointment data' }, { status: 400 })
              }
              
              await updateDoc(appointmentDoc.ref, {
                status: 'paid',
                paymentStatus: 'completed',
                stripePaymentIntentId: session.payment_intent,
                paidAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                paymentAmount: session.amount_total,
                currency: session.currency,
                // Security metadata
                webhookProcessedAt: new Date().toISOString(),
                webhookEventId: event.id
              })
              
              console.log('✅ Appointment payment confirmed:', appointmentDoc.id)
              
              // Send appointment confirmation email with error handling
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
                  // Don't fail webhook for email failures
                }
              } catch (emailError) {
                console.error('❌ Error sending appointment confirmation email:', emailError)
                // Don't fail webhook for email failures
              }
            } else {
              console.error('🚨 Appointment not found for session:', session.id)
              // Don't fail webhook - log for investigation
            }
          } else {
            console.log('📋 Processing assessment payment:', session.id)
            
            // Handle assessment payment (default behavior)
            const assessmentsRef = collection(firestore, 'assessments')
            const q = query(assessmentsRef, where('stripeSessionId', '==', session.id))
            const querySnapshot = await getDocs(q)
            
            if (!querySnapshot.empty) {
              const assessmentDoc = querySnapshot.docs[0]
              const assessmentData = assessmentDoc.data()
              
              // Security: Validate assessment data before processing
              if (!assessmentData.email) {
                console.warn('🚨 Invalid assessment data for webhook:', assessmentDoc.id)
                return NextResponse.json({ error: 'Invalid assessment data' }, { status: 400 })
              }
              
              await updateDoc(assessmentDoc.ref, {
                status: 'paid',
                stripePaymentIntentId: session.payment_intent,
                paidAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                paymentAmount: session.amount_total,
                currency: session.currency,
                // Security metadata
                webhookProcessedAt: new Date().toISOString(),
                webhookEventId: event.id
              })
              
              console.log('✅ Assessment payment confirmed:', assessmentDoc.id)
              
              // Send assessment confirmation email with error handling
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
                  // Don't fail webhook for email failures
                }
              } catch (emailError) {
                console.error('❌ Error sending assessment confirmation email:', emailError)
                // Don't fail webhook for email failures
              }
            } else {
              console.error('🚨 Assessment not found for session:', session.id)
              // Don't fail webhook - log for investigation
            }
          }
        } catch (error) {
          console.error('❌ Error processing checkout.session.completed:', error)
          // Log detailed error for investigation
          console.error('🚨 WEBHOOK PROCESSING ERROR:', {
            eventId: event.id,
            sessionId: session.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
          // Return success to prevent Stripe retries for internal errors
          return NextResponse.json({ received: true, error: 'Internal processing error' })
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💳 Payment failed:', paymentIntent.id)
        
        // Handle failed payment - update assessment status
        try {
          // Check if firestore is initialized
          if (!firestore) {
            console.error('🚨 Firestore not initialized for failed payment processing')
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
              failureReason: paymentIntent.last_payment_error?.message || 'Unknown payment failure',
              webhookProcessedAt: new Date().toISOString(),
              webhookEventId: event.id
            })
            console.log('✅ Assessment marked as payment failed:', assessmentDoc.id)
          } else {
            console.warn('⚠️ No assessment found for failed payment intent:', paymentIntent.id)
          }
        } catch (error) {
          console.error('❌ Error updating assessment after payment failure:', error)
          // Log but don't fail webhook
        }
        break

      default:
        console.log('ℹ️ Unhandled event type:', event.type)
        // Log unhandled events for potential future implementation
        console.log('📊 Event details:', {
          type: event.type,
          id: event.id,
          created: new Date(event.created * 1000).toISOString()
        })
    }

    // Success response
    return NextResponse.json({ 
      received: true,
      eventType: event.type,
      eventId: event.id,
      rateLimitRemaining: rateLimitResult.remaining
    })
    
  } catch (error: any) {
    // Critical error logging
    console.error('🚨 CRITICAL WEBHOOK ERROR:', {
      error: error.message,
      stack: error.stack?.substring(0, 1000),
      ip: req.ip,
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })
    
    // Return generic error to prevent information leakage
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: 'Internal server error'
    }, { status: 500 })
  }
} 