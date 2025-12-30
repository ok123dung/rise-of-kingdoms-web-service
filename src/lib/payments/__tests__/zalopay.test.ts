/**
 * ZaloPay Payment Tests
 * Tests for ZaloPay payment gateway integration
 */

import crypto from 'crypto'

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

// Mock crypto-utils
jest.mock('@/lib/crypto-utils', () => ({
  generateSecureRandomInt: jest.fn(() => 555)
}))

// Mock Prisma
const mockPrisma = {
  bookings: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  payments: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  service_tasks: {
    create: jest.fn()
  }
}

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma
}))

// Mock email
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined)
}))

// Mock discord
jest.mock('@/lib/discord', () => ({
  discordNotifier: {
    sendPaymentNotification: jest.fn().mockResolvedValue(undefined)
  }
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ZaloPayPayment', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      ZALOPAY_APP_ID: '2553',
      ZALOPAY_KEY1: 'test_key1_secret',
      ZALOPAY_KEY2: 'test_key2_secret',
      ZALOPAY_ENDPOINT: 'https://sb-openapi.zalopay.vn/v2/create',
      NEXT_PUBLIC_SITE_URL: 'https://example.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('constructor', () => {
    it('should throw error if ZALOPAY_APP_ID not set', () => {
      delete process.env.ZALOPAY_APP_ID

      expect(() => {
        jest.resetModules()
        const { ZaloPayPayment } = require('../zalopay')
        new ZaloPayPayment()
      }).toThrow('ZaloPay payment configuration missing')
    })

    it('should throw error if ZALOPAY_KEY1 not set', () => {
      delete process.env.ZALOPAY_KEY1

      expect(() => {
        jest.resetModules()
        const { ZaloPayPayment } = require('../zalopay')
        new ZaloPayPayment()
      }).toThrow('ZaloPay payment configuration missing')
    })

    it('should throw error if ZALOPAY_KEY2 not set', () => {
      delete process.env.ZALOPAY_KEY2

      expect(() => {
        jest.resetModules()
        const { ZaloPayPayment } = require('../zalopay')
        new ZaloPayPayment()
      }).toThrow('ZaloPay payment configuration missing')
    })

    it('should use default endpoint if not set', () => {
      delete process.env.ZALOPAY_ENDPOINT
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')

      const payment = new ZaloPayPayment()
      expect(payment).toBeDefined()
    })
  })

  describe('createOrder', () => {
    it('should return error if booking not found', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue(null)

      const result = await payment.createOrder({
        booking_id: 'nonexistent',
        amount: 100000,
        description: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Booking not found')
    })

    it('should create order successfully', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        users: { email: 'user@example.com' },
        service_tiers: {
          id: 'tier-1',
          services: { name: 'Test Service' }
        }
      })

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 1,
            return_message: 'Success',
            order_url: 'https://zalopay.vn/pay/order123',
            zp_trans_token: 'token123'
          })
      })

      mockPrisma.payments.create.mockResolvedValue({ id: 'payment-123' })

      const result = await payment.createOrder({
        booking_id: 'booking-123',
        amount: 100000,
        description: 'Test order'
      })

      expect(result.success).toBe(true)
      expect(result.data?.order_url).toBe('https://zalopay.vn/pay/order123')
      expect(mockPrisma.payments.create).toHaveBeenCalled()
    })

    it('should handle ZaloPay API error response', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        users: { email: 'user@example.com' },
        service_tiers: {
          id: 'tier-1',
          services: { name: 'Test Service' }
        }
      })

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 2,
            return_message: 'Invalid parameters'
          })
      })

      const result = await payment.createOrder({
        booking_id: 'booking-123',
        amount: 100000,
        description: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid parameters')
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        users: { email: 'user@example.com' },
        service_tiers: {
          id: 'tier-1',
          services: { name: 'Test Service' }
        }
      })

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.createOrder({
        booking_id: 'booking-123',
        amount: 100000,
        description: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('handleCallback', () => {
    it('should reject invalid MAC signature', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      const result = await payment.handleCallback({
        data: '{"app_trans_id":"test"}',
        mac: 'invalid_mac'
      })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid MAC')
    })

    it('should return error if payment not found', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      const dataStr = JSON.stringify({
        app_trans_id: 'ORDER_123',
        zp_trans_id: 'ZP123',
        amount: 100000,
        embed_data: JSON.stringify({ booking_id: 'booking-123' })
      })

      const mac = crypto.createHmac('sha256', 'test_key2_secret').update(dataStr).digest('hex')

      mockPrisma.payments.findFirst.mockResolvedValue(null)

      const result = await payment.handleCallback({ data: dataStr, mac })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Payment not found')
    })

    it('should process valid callback successfully', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      const dataStr = JSON.stringify({
        app_trans_id: 'ORDER_123',
        zp_trans_id: 'ZP123',
        amount: 100000,
        embed_data: JSON.stringify({ booking_id: 'booking-123' })
      })

      const mac = crypto.createHmac('sha256', 'test_key2_secret').update(dataStr).digest('hex')

      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-123',
        booking_id: 'booking-123',
        amount: 100000
      })

      mockPrisma.payments.update.mockResolvedValue({})
      mockPrisma.bookings.update.mockResolvedValue({})
      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        total_amount: 100000,
        users: { email: 'user@example.com', full_name: 'Test User' },
        service_tiers: { services: { name: 'Test Service' } }
      })
      mockPrisma.service_tasks.create.mockResolvedValue({})

      const result = await payment.handleCallback({ data: dataStr, mac })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Payment processed successfully')
      expect(mockPrisma.payments.update).toHaveBeenCalled()
      expect(mockPrisma.bookings.update).toHaveBeenCalled()
    })
  })

  describe('queryPaymentStatus', () => {
    it('should query payment status successfully', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 1,
            return_message: 'Success',
            zp_trans_id: 'ZP123',
            amount: 100000
          })
      })

      const result = await payment.queryPaymentStatus('ORDER_123')

      expect(result.success).toBe(true)
      expect(result.data?.zp_trans_id).toBe('ZP123')
    })

    it('should handle query error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 2,
            return_message: 'Order not found'
          })
      })

      const result = await payment.queryPaymentStatus('INVALID')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Order not found')
    })

    it('should handle network error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.queryPaymentStatus('ORDER_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('refundPayment', () => {
    it('should refund payment successfully', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 1,
            return_message: 'Success',
            m_refund_id: 'REFUND_123',
            refund_id: 'RF123'
          })
      })

      mockPrisma.payments.findFirst.mockResolvedValue({ id: 'payment-123' })
      mockPrisma.payments.update.mockResolvedValue({})

      const result = await payment.refundPayment('ZP123', 50000, 'Customer request')

      expect(result.success).toBe(true)
      expect(result.data?.m_refund_id).toBe('REFUND_123')
    })

    it('should update payment record on successful refund', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 1,
            return_message: 'Success',
            m_refund_id: 'REFUND_123'
          })
      })

      mockPrisma.payments.findFirst.mockResolvedValue({ id: 'payment-123' })
      mockPrisma.payments.update.mockResolvedValue({})

      await payment.refundPayment('ZP123', 50000, 'Customer request')

      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payment-123' },
          data: expect.objectContaining({
            refund_amount: 50000,
            refund_reason: 'Customer request',
            status: 'refunded'
          })
        })
      )
    })

    it('should handle refund error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 2,
            return_message: 'Refund failed'
          })
      })

      const result = await payment.refundPayment('ZP123', 50000, 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Refund failed')
    })

    it('should handle network error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.refundPayment('ZP123', 50000, 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getRefundStatus', () => {
    it('should get refund status successfully', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 1,
            return_message: 'Success',
            refunds: [
              {
                m_refund_id: 'REFUND_123',
                zp_trans_id: 'ZP123',
                amount: 50000,
                status: 1
              }
            ]
          })
      })

      const result = await payment.getRefundStatus('REFUND_123')

      expect(result.success).toBe(true)
      expect(result.data?.refunds).toHaveLength(1)
    })

    it('should handle refund status error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            return_code: 2,
            return_message: 'Refund not found'
          })
      })

      const result = await payment.getRefundStatus('INVALID')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Refund not found')
    })

    it('should handle network error', async () => {
      jest.resetModules()
      const { ZaloPayPayment } = require('../zalopay')
      const payment = new ZaloPayPayment()

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.getRefundStatus('REFUND_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })
})
