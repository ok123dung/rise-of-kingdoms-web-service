/**
 * Email Service Tests
 * Tests for EmailService class methods
 */

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}))

// Mock Resend - use __mocks__ pattern
jest.mock('resend', () => {
  const mockSend = jest.fn()
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend
      }
    })),
    __mockSend: mockSend
  }
})

// Mock Prisma
jest.mock('@/lib/db', () => {
  const mockCreate = jest.fn()
  return {
    prisma: {
      communications: {
        create: mockCreate
      }
    },
    __mockCreate: mockCreate
  }
})

// Get mock references after module import
const { __mockSend: mockSend } = jest.requireMock('resend')
const { __mockCreate: mockCommunicationsCreate } = jest.requireMock('@/lib/db')

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-1234'
const originalRandomUUID = crypto.randomUUID
beforeAll(() => {
  crypto.randomUUID = jest.fn().mockReturnValue(mockUUID) as () => `${string}-${string}-${string}-${string}-${string}`
})
afterAll(() => {
  crypto.randomUUID = originalRandomUUID
})

import { EmailService, getEmailService } from '../service'
import type { User, Lead, BookingWithRelations, PaymentWithRelations } from '@/types/prisma'

describe('EmailService', () => {
  const originalEnv = process.env
  let emailService: EmailService

  // Test fixtures
  const mockUser: User = {
    id: 'user-123',
    email: 'user@example.com',
    full_name: 'Test User',
    role: 'customer',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    phone: null,
    password_hash: null,
    avatar_url: null,
    google_id: null,
    facebook_id: null,
    discord_id: null,
    discord_username: null,
    preferences: null,
    last_login: null,
    email_verified: false
  }

  const mockBooking: BookingWithRelations = {
    id: 'booking-123',
    booking_number: 'BK001',
    user_id: 'user-123',
    service_tier_id: 'tier-1',
    status: 'pending',
    final_amount: 500000,
    start_date: null,
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: null,
    created_at: new Date(),
    updated_at: new Date(),
    users: mockUser,
    service_tiers: {
      id: 'tier-1',
      service_id: 'service-1',
      name: 'Gold',
      price: 500000,
      description: null,
      duration_days: 30,
      features: [],
      max_concurrent: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      services: {
        id: 'service-1',
        name: 'Gem Farm',
        slug: 'gem-farm',
        category: 'farming',
        short_description: 'Farm gems',
        long_description: null,
        image_url: null,
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    },
    payments: [],
    communications: [],
    service_tasks: []
  }

  const mockPayment: PaymentWithRelations = {
    id: 'payment-123',
    payment_number: 'PAY001',
    booking_id: 'booking-123',
    amount: 500000,
    payment_method: 'zalopay',
    status: 'completed',
    paid_at: new Date(),
    transaction_id: 'txn-123',
    gateway_response: null,
    refund_amount: null,
    refund_reason: null,
    created_at: new Date(),
    updated_at: new Date(),
    bookings: mockBooking
  }

  const mockLead: Lead = {
    id: 'lead-123',
    full_name: 'Lead User',
    email: 'lead@example.com',
    phone: null,
    source: 'website',
    service_interest: 'Gem Farm',
    status: 'new',
    notes: null,
    assigned_to: 'staff-1',
    created_at: new Date(),
    updated_at: new Date()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test_api_key',
      RESEND_FROM_EMAIL: 'test@rokservices.com',
      NEXT_PUBLIC_SITE_URL: 'https://rokservices.com',
      NEXT_PUBLIC_CONTACT_EMAIL: 'contact@rokservices.com',
      NEXT_PUBLIC_SUPPORT_PHONE: '0123456789',
      NEXT_PUBLIC_DISCORD_INVITE: 'https://discord.gg/test'
    }
    emailService = new EmailService()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockSend.mockResolvedValue({
        data: { id: 'msg-123' },
        error: null
      })

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-123')
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user@example.com'],
          subject: 'Test Subject',
          html: '<p>Test content</p>'
        })
      )
    })

    it('should handle array of recipients', async () => {
      mockSend.mockResolvedValue({
        data: { id: 'msg-123' },
        error: null
      })

      await emailService.sendEmail({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@example.com', 'user2@example.com']
        })
      )
    })

    it('should use default from email', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@rokservices.com'
        })
      )
    })

    it('should use custom from email when provided', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        from: 'custom@example.com'
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'custom@example.com'
        })
      )
    })

    it('should return error when RESEND_API_KEY not configured', async () => {
      delete process.env.RESEND_API_KEY

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email service not configured')
    })

    it('should handle Resend API error', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid recipient' }
      })

      const result = await emailService.sendEmail({
        to: 'invalid@',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid recipient')
    })

    it('should handle exception during send', async () => {
      mockSend.mockRejectedValue(new Error('Network error'))

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    it('should handle non-Error exceptions', async () => {
      mockSend.mockRejectedValue('String error')

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('should include optional fields when provided', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Plain text',
        replyTo: 'reply@example.com',
        attachments: [{ filename: 'test.pdf', content: 'base64data' }]
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Plain text',
          replyTo: 'reply@example.com',
          attachments: [{ filename: 'test.pdf', content: 'base64data' }]
        })
      )
    })
  })

  describe('sendBookingConfirmation', () => {
    it('should send booking confirmation and log communication', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const result = await emailService.sendBookingConfirmation(mockBooking)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user@example.com'],
          subject: expect.stringContaining('Xác nhận đặt dịch vụ')
        })
      )
      expect(mockCommunicationsCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: mockUUID,
          user_id: 'user-123',
          booking_id: 'booking-123',
          type: 'email',
          channel: 'user@example.com',
          template_id: 'booking_confirmation'
        })
      })
    })

    it('should return false when email fails', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Failed' } })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const result = await emailService.sendBookingConfirmation(mockBooking)

      expect(result).toBe(false)
      expect(mockCommunicationsCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_data: expect.objectContaining({
            success: false,
            error: 'Failed'
          })
        })
      })
    })

    it('should return false on exception', async () => {
      mockSend.mockRejectedValue(new Error('Network error'))

      const result = await emailService.sendBookingConfirmation(mockBooking)

      expect(result).toBe(false)
    })

    it('should include correct service info in template', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendBookingConfirmation(mockBooking)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.subject).toContain('Gem Farm')
      expect(sendCall.subject).toContain('BK001')
      expect(sendCall.html).toContain('500,000')
      expect(sendCall.html).toContain('Gold')
    })
  })

  describe('sendPaymentConfirmation', () => {
    it('should send payment confirmation and log communication', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const result = await emailService.sendPaymentConfirmation(mockPayment)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Thanh toán thành công')
        })
      )
      expect(mockCommunicationsCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_id: 'payment_confirmation',
          user_id: 'user-123',
          booking_id: 'booking-123'
        })
      })
    })

    it('should include payment method in template', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendPaymentConfirmation(mockPayment)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('ZALOPAY')
      expect(sendCall.html).toContain('PAY001')
    })

    it('should return false on error', async () => {
      mockSend.mockRejectedValue(new Error('Send failed'))

      const result = await emailService.sendPaymentConfirmation(mockPayment)

      expect(result).toBe(false)
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email and log communication', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const result = await emailService.sendWelcomeEmail(mockUser)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user@example.com'],
          subject: expect.stringContaining('Chào mừng')
        })
      )
      expect(mockCommunicationsCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_id: 'welcome',
          user_id: 'user-123'
        })
      })
    })

    it('should include user name in template', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendWelcomeEmail(mockUser)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('Test User')
      expect(sendCall.text).toContain('Test User')
    })

    it('should include promo code in template', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendWelcomeEmail(mockUser)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('WELCOME10')
    })

    it('should return false on error', async () => {
      mockSend.mockRejectedValue(new Error('Network error'))

      const result = await emailService.sendWelcomeEmail(mockUser)

      expect(result).toBe(false)
    })
  })

  describe('sendServiceReminder', () => {
    it('should send service reminder and log communication', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const result = await emailService.sendServiceReminder(mockBooking)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('sắp hết hạn')
        })
      )
      expect(mockCommunicationsCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_id: 'service_reminder'
        })
      })
    })

    it('should calculate days left correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendServiceReminder(mockBooking)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toMatch(/\d+ ngày/)
    })

    it('should handle null end_date', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const bookingWithoutEndDate = {
        ...mockBooking,
        end_date: null
      }

      const result = await emailService.sendServiceReminder(bookingWithoutEndDate)

      expect(result).toBe(true)
      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('N/A')
    })

    it('should return false on error', async () => {
      mockSend.mockRejectedValue(new Error('Error'))

      const result = await emailService.sendServiceReminder(mockBooking)

      expect(result).toBe(false)
    })
  })

  describe('sendLeadFollowUp', () => {
    it('should send follow-up email and log communication when assigned', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const result = await emailService.sendLeadFollowUp(mockLead)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['lead@example.com']
        })
      )
      expect(mockCommunicationsCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_id: 'lead_followup',
          user_id: 'staff-1',
          channel: 'lead@example.com'
        })
      })
    })

    it('should not log communication when lead not assigned', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

      const unassignedLead: Lead = {
        ...mockLead,
        assigned_to: null
      }

      const result = await emailService.sendLeadFollowUp(unassignedLead)

      expect(result).toBe(true)
      expect(mockSend).toHaveBeenCalled()
      expect(mockCommunicationsCreate).not.toHaveBeenCalled()
    })

    it('should return false when lead has no email', async () => {
      const leadWithoutEmail: Lead = {
        ...mockLead,
        email: null
      }

      const result = await emailService.sendLeadFollowUp(leadWithoutEmail)

      expect(result).toBe(false)
      expect(mockSend).not.toHaveBeenCalled()
    })

    it('should include lead name in template', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendLeadFollowUp(mockLead)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('Lead User')
    })

    it('should handle null lead name', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      const leadWithoutName: Lead = {
        ...mockLead,
        full_name: null
      }

      await emailService.sendLeadFollowUp(leadWithoutName)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('bạn')
    })

    it('should include service interest in template', async () => {
      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
      mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })

      await emailService.sendLeadFollowUp(mockLead)

      const sendCall = mockSend.mock.calls[0][0]
      expect(sendCall.html).toContain('Gem Farm')
    })

    it('should return false on error', async () => {
      mockSend.mockRejectedValue(new Error('Error'))

      const result = await emailService.sendLeadFollowUp(mockLead)

      expect(result).toBe(false)
    })
  })

  describe('getEmailService', () => {
    it('should return EmailService instance', () => {
      const instance = getEmailService()
      expect(instance).toBeInstanceOf(EmailService)
    })

    it('should return same instance on multiple calls', () => {
      const instance1 = getEmailService()
      const instance2 = getEmailService()
      expect(instance1).toBe(instance2)
    })
  })

  describe('constructor', () => {
    it('should use default from email when RESEND_FROM_EMAIL not set', async () => {
      delete process.env.RESEND_FROM_EMAIL
      const service = new EmailService()

      mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })

      await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@rokdbot.com'
        })
      )
    })
  })
})

describe('Email Template Content', () => {
  let emailService: EmailService
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test_api_key',
      RESEND_FROM_EMAIL: 'test@rokservices.com',
      NEXT_PUBLIC_SITE_URL: 'https://rokservices.com'
    }
    emailService = new EmailService()
    mockSend.mockResolvedValue({ data: { id: 'msg-123' }, error: null })
    mockCommunicationsCreate.mockResolvedValue({ id: 'comm-123' })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('booking confirmation should have proper HTML structure', async () => {
    const mockBooking: BookingWithRelations = {
      id: 'booking-123',
      booking_number: 'BK001',
      user_id: 'user-123',
      service_tier_id: 'tier-1',
      status: 'pending',
      final_amount: 500000,
      start_date: null,
      end_date: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
      users: {
        id: 'user-123',
        email: 'user@example.com',
        full_name: 'Test User',
        role: 'customer',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        phone: null,
        password_hash: null,
        avatar_url: null,
        google_id: null,
        facebook_id: null,
        discord_id: null,
        discord_username: null,
        preferences: null,
        last_login: null,
        email_verified: false
      },
      service_tiers: {
        id: 'tier-1',
        service_id: 'service-1',
        name: 'Gold',
        price: 500000,
        description: null,
        duration_days: 30,
        features: [],
        max_concurrent: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        services: {
          id: 'service-1',
          name: 'Gem Farm',
          slug: 'gem-farm',
          category: 'farming',
          short_description: 'Farm gems',
          long_description: null,
          image_url: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      },
      payments: [],
      communications: [],
      service_tasks: []
    }

    await emailService.sendBookingConfirmation(mockBooking)

    const sendCall = mockSend.mock.calls[0][0]
    expect(sendCall.html).toContain('<!DOCTYPE html>')
    expect(sendCall.html).toContain('<html>')
    expect(sendCall.html).toContain('</html>')
    expect(sendCall.html).toContain('RoK Services')
  })

  it('payment confirmation should include Discord link', async () => {
    const mockPayment: PaymentWithRelations = {
      id: 'payment-123',
      payment_number: 'PAY001',
      booking_id: 'booking-123',
      amount: 500000,
      payment_method: 'zalopay',
      status: 'completed',
      paid_at: new Date(),
      transaction_id: 'txn-123',
      gateway_response: null,
      refund_amount: null,
      refund_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
      bookings: {
        id: 'booking-123',
        booking_number: 'BK001',
        user_id: 'user-123',
        service_tier_id: 'tier-1',
        status: 'pending',
        final_amount: 500000,
        start_date: null,
        end_date: null,
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
        users: {
          id: 'user-123',
          email: 'user@example.com',
          full_name: 'Test User',
          role: 'customer',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
          phone: null,
          password_hash: null,
          avatar_url: null,
          google_id: null,
          facebook_id: null,
          discord_id: null,
          discord_username: null,
          preferences: null,
          last_login: null,
          email_verified: false
        },
        service_tiers: {
          id: 'tier-1',
          service_id: 'service-1',
          name: 'Gold',
          price: 500000,
          description: null,
          duration_days: 30,
          features: [],
          max_concurrent: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          services: {
            id: 'service-1',
            name: 'Gem Farm',
            slug: 'gem-farm',
            category: 'farming',
            short_description: 'Farm gems',
            long_description: null,
            image_url: null,
            is_active: true,
            sort_order: 1,
            created_at: new Date(),
            updated_at: new Date()
          }
        },
        payments: [],
        communications: [],
        service_tasks: []
      }
    }

    await emailService.sendPaymentConfirmation(mockPayment)

    const sendCall = mockSend.mock.calls[0][0]
    expect(sendCall.html).toContain('Tham gia Discord')
    expect(sendCall.html).toContain('Discord')
  })
})
