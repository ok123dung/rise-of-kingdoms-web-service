import { Resend } from 'resend'
import { getLogger } from '@/lib/monitoring/logger'
import {
  getWelcomeEmailTemplate,
  getBookingConfirmationTemplate,
  getPaymentConfirmationTemplate,
  getLeadNotificationTemplate,
  type EmailTemplate
} from './templates'

// Lazy initialize Resend only when needed
let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

// Email service configuration
const FROM_EMAIL = 'RoK Services <noreply@rokdbot.com>'
const SUPPORT_EMAIL = 'support@rokdbot.com'
const ADMIN_EMAIL = 'admin@rokdbot.com'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text: string
  from?: string
  cc?: string[]
  bcc?: string[]
  replyTo?: string
}

// Core email sending function
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      getLogger().warn('RESEND_API_KEY not configured, email sending disabled')
      return { success: false, error: 'Email service not configured' }
    }

    const resendClient = getResend()
    const { data, error } = await resendClient.emails.send({
      from: options.from || FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
      reply_to: options.replyTo
    })

    if (error) {
      getLogger().error('Failed to send email', { error })
      return { success: false, error: error.message || 'Failed to send email' }
    }

    getLogger().info('Email sent successfully', {
      messageId: data?.id,
      to: options.to,
      subject: options.subject
    })

    return { success: true, messageId: data?.id }
  } catch (error) {
    getLogger().error('Email sending error', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Send welcome email to new users
export async function sendWelcomeEmail(
  userEmail: string,
  userFullName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getWelcomeEmailTemplate(userFullName, userEmail)
    
    const result = await sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: SUPPORT_EMAIL
    })

    return result
  } catch (error) {
    getLogger().error('Failed to send welcome email', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send welcome email'
    }
  }
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(
  customerEmail: string,
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  amount: number,
  bookingDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getBookingConfirmationTemplate(
      customerName,
      bookingNumber,
      serviceName,
      amount,
      bookingDate
    )
    
    const result = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: SUPPORT_EMAIL
    })

    return result
  } catch (error) {
    getLogger().error('Failed to send booking confirmation email', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send booking confirmation'
    }
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  amount: number,
  paymentMethod: string,
  paymentDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getPaymentConfirmationTemplate(
      customerName,
      bookingNumber,
      serviceName,
      amount,
      paymentMethod,
      paymentDate
    )
    
    const result = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: SUPPORT_EMAIL
    })

    return result
  } catch (error) {
    getLogger().error('Failed to send payment confirmation email', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send payment confirmation'
    }
  }
}

// Send lead notification to admin
export async function sendLeadNotificationEmail(
  leadName: string,
  leadEmail: string,
  leadPhone: string | null,
  serviceInterest: string,
  source: string,
  notes: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getLeadNotificationTemplate(
      leadName,
      leadEmail,
      leadPhone,
      serviceInterest,
      source,
      notes
    )
    
    // Send to admin and sales team
    const recipients = [ADMIN_EMAIL, SUPPORT_EMAIL]
    
    const result = await sendEmail({
      to: recipients,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: leadEmail
    })

    return result
  } catch (error) {
    getLogger().error('Failed to send lead notification email', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send lead notification'
    }
  }
}

// Send custom email
export async function sendCustomEmail(
  to: string | string[],
  subject: string,
  content: {
    html: string
    text: string
  },
  options?: {
    from?: string
    replyTo?: string
    cc?: string[]
    bcc?: string[]
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendEmail({
      to,
      subject,
      html: content.html,
      text: content.text,
      from: options?.from,
      replyTo: options?.replyTo,
      cc: options?.cc,
      bcc: options?.bcc
    })

    return result
  } catch (error) {
    getLogger().error('Failed to send custom email', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send custom email'
    }
  }
}

// Utility function to validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility function to sanitize email content
export function sanitizeEmailContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: links
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// Test email functionality (development only)
export async function sendTestEmail(
  to: string,
  testType: 'welcome' | 'booking' | 'payment' = 'welcome'
): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Test emails not allowed in production' }
  }

  try {
    switch (testType) {
      case 'welcome':
        return await sendWelcomeEmail(to, 'Test User')
      
      case 'booking':
        return await sendBookingConfirmationEmail(
          to,
          'Test User',
          'TEST001',
          'Tư vấn chiến thuật - Pro',
          900000,
          new Date()
        )
      
      case 'payment':
        return await sendPaymentConfirmationEmail(
          to,
          'Test User',
          'TEST001',
          'Tư vấn chiến thuật - Pro',
          900000,
          'momo',
          new Date()
        )
      
      default:
        return { success: false, error: 'Invalid test type' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test email failed'
    }
  }
}

// Email health check
export async function checkEmailService(): Promise<{
  healthy: boolean
  error?: string
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { healthy: false, error: 'RESEND_API_KEY not configured' }
    }

    // Simple test to check if Resend is responding
    // This is a mock check - in real implementation you might want to send a test email
    return { healthy: true }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Email service check failed'
    }
  }
}

// Export email service status for monitoring
export const emailServiceStatus = {
  isConfigured: !!process.env.RESEND_API_KEY,
  fromEmail: FROM_EMAIL,
  supportEmail: SUPPORT_EMAIL,
  adminEmail: ADMIN_EMAIL
}