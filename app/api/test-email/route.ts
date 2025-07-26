import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail, sendAssessmentConfirmation, sendAppointmentConfirmation } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    console.log('=== Test Email API Called ===')
    const { email, type = 'test' } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    console.log('Sending test email to:', email, 'Type:', type)

    let result
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
        message: 'Email sent successfully',
        messageId: result.messageId 
      })
    } else {
      console.error('❌ Failed to send test email:', result.error)
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: result.error 
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('Error in test email API:', error)
    return NextResponse.json(
      { error: `Failed to send test email: ${error.message}` },
      { status: 500 }
    )
  }
} 