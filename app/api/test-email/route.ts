import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, sendAssessmentConfirmation, sendAppointmentConfirmation } from '@/lib/email'
import { rateLimit, createRateLimitResponse, logRateLimitViolation } from '@/lib/rate-limit'

// Whitelist of IPs allowed to use test endpoint (add your IPs)
const ALLOWED_IPS = [
  '127.0.0.1',
  '::1',
  'localhost',
  // Add your actual IPs here for production testing
]

// Admin emails that can receive test emails (prevents spam to random addresses)
const ALLOWED_TEST_EMAILS = [
  'thetuberdao@gmail.com', // Your email
  'admin@skinwise.com',
  'test@skinwise.com',
  // Add other authorized test emails
]

/**
 * Security check for test endpoint access
 */
function isAuthorizedForTesting(req: NextRequest, email: string): { authorized: boolean; reason?: string } {
  // Check if in development mode
  if (process.env.NODE_ENV === 'development') {
    // In development, allow localhost and authorized emails
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     req.ip || 
                     'unknown'
    
    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.includes('localhost')
    
    if (!isLocalhost && !ALLOWED_IPS.includes(clientIp)) {
      return { authorized: false, reason: 'IP not whitelisted for testing' }
    }
  } else {
    // In production, require explicit IP whitelist
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     req.ip || 
                     'unknown'
    
    if (!ALLOWED_IPS.includes(clientIp)) {
      return { authorized: false, reason: 'Production access requires IP whitelist' }
    }
  }

  // Check if email is in allowed list
  if (!ALLOWED_TEST_EMAILS.includes(email.toLowerCase())) {
    return { authorized: false, reason: 'Email not authorized for testing' }
  }

  return { authorized: true }
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Test Email API Called (SECURITY PROTECTED) ===')
    
    // Apply strict rate limiting
    const rateLimitResult = await rateLimit(req, 'test-email')
    if (!rateLimitResult.success) {
      logRateLimitViolation(req, 'test-email', req.ip || 'unknown')
      return createRateLimitResponse(rateLimitResult)
    }

    const { email, type = 'test' } = await req.json()

    // Validate input
    if (!email || typeof email !== 'string') {
      console.warn('🚨 Test email: Invalid email parameter')
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.warn('🚨 Test email: Invalid email format:', email)
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Security authorization check
    const authCheck = isAuthorizedForTesting(req, email)
    if (!authCheck.authorized) {
      console.warn('🚨 Test email: Unauthorized access attempt', {
        ip: req.ip,
        email,
        reason: authCheck.reason,
        userAgent: req.headers.get('user-agent')
      })
      
      return NextResponse.json({ 
        error: 'Access Denied', 
        message: 'This endpoint is restricted for security purposes' 
      }, { status: 403 })
    }

    // Validate email type
    const validTypes = ['test', 'assessment', 'appointment']
    if (!validTypes.includes(type)) {
      console.warn('🚨 Test email: Invalid type parameter:', type)
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    console.log('✅ Test email authorized - sending to:', email, 'Type:', type)

    let result
    try {
      if (type === 'assessment') {
        // Test assessment confirmation email
        result = await sendAssessmentConfirmation({
          customerEmail: email,
          customerName: 'Test User',
          sessionId: 'cs_test_12345678901234567890',
          currency: 'GBP',
          amount: 15,
          submissionDate: new Date().toLocaleDateString()
        })
      } else if (type === 'appointment') {
        // Test appointment confirmation email
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 7) // Next week for testing
        
        result = await sendAppointmentConfirmation({
          customerEmail: email,
          patientName: 'Test Patient',
          appointmentDate: tomorrow.toISOString().split('T')[0],
          appointmentTime: '10:00',
          sessionId: 'cs_test_appointment_12345',
          currency: 'GBP',
          amount: 110,
          bookingDate: new Date().toLocaleDateString()
        })
      } else {
        // Basic test email
        result = await sendTestEmail(email)
      }

      if (result.success) {
        console.log('✅ Test email sent successfully:', result.messageId)
        return NextResponse.json({ 
          success: true, 
          message: 'Test email sent successfully',
          messageId: result.messageId,
          rateLimitRemaining: rateLimitResult.remaining
        })
      } else {
        console.error('❌ Failed to send test email:', result.error)
        return NextResponse.json({ 
          error: 'Failed to send email',
          message: 'Email service error - check logs for details'
        }, { status: 500 })
      }
    } catch (emailError: any) {
      console.error('❌ Email sending error:', emailError)
      return NextResponse.json({ 
        error: 'Email service unavailable',
        message: 'Please try again later'
      }, { status: 503 })
    }
    
  } catch (error: any) {
    console.error('❌ Test email API error:', error)
    
    // Don't expose internal error details
    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }, { status: 500 })
  }
} 