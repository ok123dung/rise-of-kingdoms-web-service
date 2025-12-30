/**
 * Email Module Tests
 * Tests for email utility functions and sending
 */

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

// Mock Resend
const mockSend = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend
    }
  }))
}))

describe('Email Module', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test_resend_key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      jest.resetModules()
      const { isValidEmail } = require('../index')

      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
      expect(isValidEmail('user123@test.io')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      jest.resetModules()
      const { isValidEmail } = require('../index')

      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('missing@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('no.domain@')).toBe(false)
    })
  })

  describe('sanitizeEmailContent', () => {
    it('should remove script tags', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      const input = 'Hello <script>alert("xss")</script> World'
      const result = sanitizeEmailContent(input)

      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })

    it('should remove nested script tags', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      const input = '<scr<script>ipt>alert("xss")</scr</script>ipt>'
      const result = sanitizeEmailContent(input)

      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
    })

    it('should remove onclick handlers', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      const input = '<div onclick="alert(1)">Click me</div>'
      const result = sanitizeEmailContent(input)

      expect(result).not.toContain('onclick')
    })

    it('should remove onerror handlers', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      const input = '<img src="x" onerror="alert(1)">'
      const result = sanitizeEmailContent(input)

      expect(result).not.toContain('onerror')
    })

    it('should remove javascript: URLs', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      const input = '<a href="javascript:alert(1)">Click</a>'
      const result = sanitizeEmailContent(input)

      expect(result).not.toContain('javascript:')
    })

    it('should handle empty string', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      expect(sanitizeEmailContent('')).toBe('')
    })

    it('should preserve safe HTML', () => {
      jest.resetModules()
      const { sanitizeEmailContent } = require('../index')

      const input = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeEmailContent(input)

      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      jest.resetModules()
      const { sendEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content'
      })

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalled()
    })

    it('should handle send failure', async () => {
      jest.resetModules()
      const { sendEmail } = require('../index')

      mockSend.mockResolvedValue({ data: null, error: { message: 'Send failed' } })

      const result = await sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Send failed')
    })

    it('should handle exception', async () => {
      jest.resetModules()
      const { sendEmail } = require('../index')

      mockSend.mockRejectedValue(new Error('Network error'))

      const result = await sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should return error when API key not configured', async () => {
      delete process.env.RESEND_API_KEY
      jest.resetModules()
      const { sendEmail } = require('../index')

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not configured')
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      jest.resetModules()
      const { sendWelcomeEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendWelcomeEmail('newuser@example.com', 'John Doe')

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalled()
    })

    it('should pass correct email to Resend', async () => {
      jest.resetModules()
      const { sendWelcomeEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendWelcomeEmail('user@example.com', 'Jane Smith')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user@example.com']
        })
      )
    })

    it('should handle send failure', async () => {
      jest.resetModules()
      const { sendWelcomeEmail } = require('../index')

      mockSend.mockResolvedValue({ data: null, error: { message: 'Quota exceeded' } })

      const result = await sendWelcomeEmail('user@example.com', 'User')

      expect(result.success).toBe(false)
    })
  })

  describe('sendBookingConfirmationEmail', () => {
    it('should send booking confirmation', async () => {
      jest.resetModules()
      const { sendBookingConfirmationEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendBookingConfirmationEmail(
        'customer@example.com',
        'Customer Name',
        'BK001',
        'Test Service',
        500000,
        new Date('2024-12-30')
      )

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalled()
    })

    it('should include booking number in email', async () => {
      jest.resetModules()
      const { sendBookingConfirmationEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBookingConfirmationEmail(
        'customer@example.com',
        'Customer',
        'BK12345',
        'Premium Service',
        1000000,
        new Date()
      )

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('BK12345')
        })
      )
    })
  })

  describe('sendPaymentConfirmationEmail', () => {
    it('should send payment confirmation', async () => {
      jest.resetModules()
      const { sendPaymentConfirmationEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendPaymentConfirmationEmail(
        'payer@example.com',
        'Payer Name',
        'BK001',
        'Test Service',
        500000,
        'momo',
        new Date()
      )

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalled()
    })
  })

  describe('sendLeadNotificationEmail', () => {
    it('should send lead notification to admin', async () => {
      jest.resetModules()
      const { sendLeadNotificationEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendLeadNotificationEmail(
        'Potential Customer',
        'lead@example.com',
        '0123456789',
        'strategy',
        'website',
        'Interested in services'
      )

      expect(result.success).toBe(true)
    })

    it('should handle null optional fields', async () => {
      jest.resetModules()
      const { sendLeadNotificationEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendLeadNotificationEmail(
        'Lead Name',
        'lead@example.com',
        null, // no phone
        'farming',
        'discord',
        null // no notes
      )

      expect(result.success).toBe(true)
    })
  })

  describe('sendCustomEmail', () => {
    it('should send custom email', async () => {
      jest.resetModules()
      const { sendCustomEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendCustomEmail(
        'recipient@example.com',
        'Custom Subject',
        {
          html: '<p>Custom content</p>',
          text: 'Custom content'
        }
      )

      expect(result.success).toBe(true)
    })

    it('should accept optional parameters', async () => {
      jest.resetModules()
      const { sendCustomEmail } = require('../index')

      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendCustomEmail(
        'recipient@example.com',
        'Custom Subject',
        {
          html: '<p>Content</p>',
          text: 'Content'
        },
        {
          replyTo: 'reply@example.com',
          cc: ['cc@example.com']
        }
      )

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'reply@example.com',
          cc: ['cc@example.com']
        })
      )
    })
  })
})
