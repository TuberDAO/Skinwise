import { Resend } from 'resend'

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY)

export interface AssessmentEmailData {
  customerEmail: string
  customerName?: string
  sessionId: string
  currency: string
  amount: number
  submissionDate: string
}

export interface AppointmentEmailData {
  customerEmail: string
  patientName: string
  appointmentDate: string
  appointmentTime: string
  sessionId: string
  currency: string
  amount: number
  bookingDate: string
}

// Email template for AI assessment confirmation
export async function sendAssessmentConfirmation(data: AssessmentEmailData) {
  try {
    console.log('📧 Sending assessment confirmation email to:', data.customerEmail)
    
    const { data: result, error } = await resend.emails.send({
      from: 'SkinWise <noreply@skinwise.com>',
      to: [data.customerEmail],
      subject: '✅ Your Skin Assessment Has Been Submitted - SkinWise',
      html: generateAssessmentEmailHTML(data),
      text: generateAssessmentEmailText(data)
    })

    if (error) {
      console.error('❌ Failed to send assessment confirmation email:', error)
      throw error
    }

    console.log('✅ Assessment confirmation email sent successfully:', result?.id)
    return { success: true, messageId: result?.id }
    
  } catch (error) {
    console.error('❌ Error sending assessment confirmation email:', error)
    return { success: false, error: error }
  }
}

// Email template for dermatologist appointment confirmation
export async function sendAppointmentConfirmation(data: AppointmentEmailData) {
  try {
    console.log('📧 Sending appointment confirmation email to:', data.customerEmail)
    
    const { data: result, error } = await resend.emails.send({
      from: 'SkinWise <noreply@skinwise.com>',
      to: [data.customerEmail],
      subject: '🩺 Your Dermatologist Appointment is Confirmed - SkinWise',
      html: generateAppointmentEmailHTML(data),
      text: generateAppointmentEmailText(data)
    })

    if (error) {
      console.error('❌ Failed to send appointment confirmation email:', error)
      throw error
    }

    console.log('✅ Appointment confirmation email sent successfully:', result?.id)
    return { success: true, messageId: result?.id }
    
  } catch (error) {
    console.error('❌ Error sending appointment confirmation email:', error)
    return { success: false, error: error }
  }
}

// Generate HTML email template for assessment confirmation
function generateAssessmentEmailHTML(data: AssessmentEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Confirmed - SkinWise</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0f766e, #0d9488); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .highlight { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; background: #0f766e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 15px 0; }
    .payment-details { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .reference { font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SkinWise</div>
      <p style="margin: 0; opacity: 0.9;">Smart Skin Diagnostics</p>
    </div>
    
    <div class="content">
      <h1 style="color: #0f766e; margin-top: 0;">✅ Your Skin Assessment is Confirmed!</h1>
      
      <p>Hello ${data.customerName || 'there'},</p>
      
      <p>Thank you for choosing SkinWise for your skin health assessment. We've successfully received your payment and your submission is now being processed by our team.</p>
      
      <div class="highlight">
        <h3 style="margin-top: 0; color: #059669;">What happens next?</h3>
        <ul style="margin-bottom: 0;">
          <li><strong>AI Analysis:</strong> Your photos and description are being analyzed by our advanced AI system</li>
          <li><strong>Professional Review:</strong> A qualified healthcare professional will review the AI analysis</li>
          <li><strong>Report Delivery:</strong> You'll receive a detailed PDF report via email within 24 hours</li>
          <li><strong>Referral Letter:</strong> If needed, we'll include a referral letter for your dermatologist</li>
        </ul>
      </div>
      
      <div class="payment-details">
        <h3 style="margin-top: 0;">Payment Details</h3>
        <p><strong>Amount Paid:</strong> ${data.currency} ${data.amount}</p>
        <p><strong>Payment Date:</strong> ${data.submissionDate}</p>
        <p><strong>Reference:</strong> <span class="reference">${data.sessionId}</span></p>
      </div>
      
      <p><strong>Important:</strong> Please check your spam folder if you don't receive your report within 24 hours. Our reports are sent from <code>noreply@skinwise.com</code>.</p>
      
      <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The SkinWise Team</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        This email was sent to ${data.customerEmail}<br>
        SkinWise - Professional AI-Assisted Skin Health Analysis<br>
        If you need help, reply to this email or contact us directly.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Generate HTML email template for appointment confirmation
function generateAppointmentEmailHTML(data: AppointmentEmailData): string {
  const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmed - SkinWise</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0f766e, #0d9488); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .appointment-card { background: #ecfdf5; border: 2px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
    .preparation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .payment-details { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .reference { font-family: monospace; background: #f3f4f6; padding: 8px; border-radius: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SkinWise</div>
      <p style="margin: 0; opacity: 0.9;">Dermatologist Consultations</p>
    </div>
    
    <div class="content">
      <h1 style="color: #0f766e; margin-top: 0;">🩺 Your Dermatologist Appointment is Confirmed!</h1>
      
      <p>Hello ${data.patientName},</p>
      
      <p>Great news! Your payment has been processed and your 15-minute consultation with a board-certified dermatologist has been confirmed.</p>
      
      <div class="appointment-card">
        <h2 style="color: #059669; margin-top: 0;">📅 Appointment Details</h2>
        <p style="font-size: 18px; margin: 10px 0;"><strong>Date:</strong> ${appointmentDateTime}</p>
        <p style="font-size: 18px; margin: 10px 0;"><strong>Time:</strong> ${data.appointmentTime}</p>
        <p style="font-size: 16px; margin: 10px 0;"><strong>Duration:</strong> 15 minutes</p>
        <p style="font-size: 14px; margin: 10px 0; color: #6b7280;">Online Video Consultation</p>
      </div>
      
      <div class="preparation">
        <h3 style="margin-top: 0; color: #d97706;">🔔 Important: Video Call Link Coming Soon</h3>
        <p style="margin-bottom: 0;"><strong>We'll send you the video call link and detailed instructions 24 hours before your appointment.</strong> Please make sure to check your email (including spam folder) closer to your appointment date.</p>
      </div>
      
      <h3 style="color: #0f766e;">📋 How to Prepare</h3>
      <ul>
        <li><strong>Internet & Camera:</strong> Test your internet connection and camera/microphone</li>
        <li><strong>Lighting:</strong> Choose a well-lit room for the video call</li>
        <li><strong>Photos:</strong> Have any relevant photos of your skin concern ready to show</li>
        <li><strong>Medical History:</strong> Prepare information about current medications and allergies</li>
        <li><strong>Questions:</strong> Write down your questions to make the most of your 15 minutes</li>
      </ul>
      
      <div class="payment-details">
        <h3 style="margin-top: 0;">Payment Details</h3>
        <p><strong>Service:</strong> 15-minute dermatologist consultation</p>
        <p><strong>Amount Paid:</strong> ${data.currency} ${data.amount}</p>
        <p><strong>Booking Date:</strong> ${data.bookingDate}</p>
        <p><strong>Reference:</strong> <span class="reference">${data.sessionId}</span></p>
      </div>
      
      <p><strong>Need to reschedule?</strong> Please contact us at least 24 hours in advance.</p>
      
      <p>We look forward to helping you with your skin health concerns!</p>
      
      <p>Best regards,<br>The SkinWise Medical Team</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        This email was sent to ${data.customerEmail}<br>
        SkinWise - Professional Dermatologist Consultations<br>
        Support: support@skinwise.com | Emergency: Call your local healthcare provider
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Generate plain text versions for email clients that don't support HTML
function generateAssessmentEmailText(data: AssessmentEmailData): string {
  return `
SkinWise - Assessment Confirmation

Hello ${data.customerName || 'there'},

Your skin assessment has been successfully submitted and payment confirmed!

WHAT HAPPENS NEXT:
- AI Analysis: Your photos are being analyzed by our advanced AI system
- Professional Review: A qualified healthcare professional will review the analysis
- Report Delivery: You'll receive a detailed PDF report within 24 hours
- Referral Letter: We'll include a referral letter for your dermatologist if needed

PAYMENT DETAILS:
Amount Paid: ${data.currency} ${data.amount}
Payment Date: ${data.submissionDate}
Reference: ${data.sessionId}

IMPORTANT: Check your spam folder if you don't receive your report within 24 hours.

Questions? Reply to this email or contact our support team.

Best regards,
The SkinWise Team

---
This email was sent to ${data.customerEmail}
SkinWise - Professional AI-Assisted Skin Health Analysis
  `
}

function generateAppointmentEmailText(data: AppointmentEmailData): string {
  const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
  
  return `
SkinWise - Dermatologist Appointment Confirmed

Hello ${data.patientName},

Your dermatologist consultation has been confirmed!

APPOINTMENT DETAILS:
Date: ${appointmentDateTime}
Time: ${data.appointmentTime}
Duration: 15 minutes
Type: Online Video Consultation

IMPORTANT: We'll send you the video call link 24 hours before your appointment.

HOW TO PREPARE:
- Test your internet connection and camera
- Choose a well-lit room for the video call
- Have photos of your skin concern ready
- Prepare your medical history and current medications
- Write down questions for the dermatologist

PAYMENT DETAILS:
Service: 15-minute dermatologist consultation
Amount Paid: ${data.currency} ${data.amount}
Booking Date: ${data.bookingDate}
Reference: ${data.sessionId}

Need to reschedule? Contact us at least 24 hours in advance.

Best regards,
The SkinWise Medical Team

---
This email was sent to ${data.customerEmail}
SkinWise - Professional Dermatologist Consultations
Support: support@skinwise.com
  `
}

// Test email function for development
export async function sendTestEmail(email: string) {
  try {
    console.log('📧 Sending test email to:', email)
    
    const { data: result, error } = await resend.emails.send({
      from: 'SkinWise <noreply@skinwise.com>',
      to: [email],
      subject: '🧪 Test Email - SkinWise Email System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0f766e;">✅ Email System Test Successful!</h1>
          <p>This is a test email to confirm that the SkinWise email system is working correctly.</p>
          <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
          <p>If you received this email, the integration is working perfectly!</p>
          <p>Best regards,<br>The SkinWise Development Team</p>
        </div>
      `,
      text: 'SkinWise Email System Test - This email confirms that the email system is working correctly.'
    })

    if (error) {
      console.error('❌ Failed to send test email:', error)
      throw error
    }

    console.log('✅ Test email sent successfully:', result?.id)
    return { success: true, messageId: result?.id }
    
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    return { success: false, error: error }
  }
} 