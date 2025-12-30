/**
 * MoMo Payment Tests
 * Tests for MoMo payment gateway integration
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
  webhook_events: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  service_tasks: {
    create: jest.fn()
  },
  $transaction: jest.fn((callback: (tx: typeof mockPrisma) => Promise<void>) => callback(mockPrisma))
}

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma
}))

// Mock WebSocket events
jest.mock('@/lib/websocket/events', () => ({
  emitPaymentUpdate: jest.fn(),
  emitOrderTracking: jest.fn(),
  emitAdminDashboardUpdate: jest.fn()
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

describe('MoMoPayment', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      MOMO_PARTNER_CODE: 'TEST_PARTNER',
      MOMO_ACCESS_KEY: 'test_access_key',
      MOMO_SECRET_KEY: 'test_secret_key',
      MOMO_ENDPOINT: 'https://test-payment.momo.vn/v2/gateway/api/create',
      NEXT_PUBLIC_SITE_URL: 'https://example.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('constructor', () => {
    it('should throw error if MOMO_PARTNER_CODE not set', () => {
      delete process.env.MOMO_PARTNER_CODE

      expect(() => {
        // Re-import to trigger constructor
        jest.resetModules()
        const { MoMoPayment } = require('../momo')
        new MoMoPayment()
      }).toThrow('MoMo payment configuration missing')
    })

    it('should throw error if MOMO_ACCESS_KEY not set', () => {
      delete process.env.MOMO_ACCESS_KEY

      expect(() => {
        jest.resetModules()
        const { MoMoPayment } = require('../momo')
        new MoMoPayment()
      }).toThrow('MoMo payment configuration missing')
    })

    it('should throw error if MOMO_SECRET_KEY not set', () => {
      delete process.env.MOMO_SECRET_KEY

      expect(() => {
        jest.resetModules()
        const { MoMoPayment } = require('../momo')
        new MoMoPayment()
      }).toThrow('MoMo payment configuration missing')
    })

    it('should use default endpoint if not set', () => {
      delete process.env.MOMO_ENDPOINT
      jest.resetModules()
      const { MoMoPayment } = require('../momo')

      const payment = new MoMoPayment()
      // Constructor should not throw
      expect(payment).toBeDefined()
    })
  })

  describe('verifyWebhookSignature', () => {
    it('should verify valid signature', () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      const webhookData = {
        partnerCode: 'TEST_PARTNER',
        orderId: 'ORDER_123',
        requestId: 'REQ_123',
        amount: 100000,
        orderInfo: 'Test order',
        orderType: 'momo_wallet',
        transId: 'TRANS_123',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        signature: '' // Will be calculated
      }

      // Calculate expected signature
      const rawSignature = `accessKey=test_access_key&amount=${webhookData.amount}&extraData=${webhookData.extraData}&message=${webhookData.message}&orderId=${webhookData.orderId}&orderInfo=${webhookData.orderInfo}&orderType=${webhookData.orderType}&partnerCode=${webhookData.partnerCode}&payType=${webhookData.payType}&requestId=${webhookData.requestId}&responseTime=${webhookData.responseTime}&resultCode=${webhookData.resultCode}&transId=${webhookData.transId}`
      const expectedSignature = crypto
        .createHmac('sha256', 'test_secret_key')
        .update(rawSignature)
        .digest('hex')

      const result = payment.verifyWebhookSignature(webhookData, expectedSignature)

      expect(result).toBe(true)
    })

    it('should reject invalid signature', () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      const webhookData = {
        partnerCode: 'TEST_PARTNER',
        orderId: 'ORDER_123',
        requestId: 'REQ_123',
        amount: 100000,
        orderInfo: 'Test order',
        orderType: 'momo_wallet',
        transId: 'TRANS_123',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        signature: ''
      }

      const result = payment.verifyWebhookSignature(webhookData, 'invalid_signature')

      expect(result).toBe(false)
    })

    it('should reject signature with different length', () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      const webhookData = {
        partnerCode: 'TEST_PARTNER',
        orderId: 'ORDER_123',
        requestId: 'REQ_123',
        amount: 100000,
        orderInfo: 'Test order',
        orderType: 'momo_wallet',
        transId: 'TRANS_123',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        signature: ''
      }

      const result = payment.verifyWebhookSignature(webhookData, 'short')

      expect(result).toBe(false)
    })
  })

  describe('createPayment', () => {
    it('should return error if booking not found', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue(null)

      const result = await payment.createPayment({
        booking_id: 'nonexistent',
        amount: 100000,
        orderInfo: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Booking not found')
    })

    it('should create payment successfully', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        service_tiers: {
          services: { name: 'Test Service' }
        }
      })

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            resultCode: 0,
            payUrl: 'https://momo.vn/pay',
            orderId: 'ORDER_123'
          })
      })

      mockPrisma.payments.create.mockResolvedValue({ id: 'payment-123' })

      const result = await payment.createPayment({
        booking_id: 'booking-123',
        amount: 100000,
        orderInfo: 'Test order'
      })

      expect(result.success).toBe(true)
      expect(result.data?.payUrl).toBe('https://momo.vn/pay')
      expect(mockPrisma.payments.create).toHaveBeenCalled()
    })

    it('should handle MoMo API error response', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        service_tiers: {
          services: { name: 'Test Service' }
        }
      })

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            resultCode: 1000,
            message: 'Invalid parameters'
          })
      })

      const result = await payment.createPayment({
        booking_id: 'booking-123',
        amount: 100000,
        orderInfo: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid parameters')
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001',
        service_tiers: {
          services: { name: 'Test Service' }
        }
      })

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.createPayment({
        booking_id: 'booking-123',
        amount: 100000,
        orderInfo: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('handleWebhook', () => {
    it('should reject invalid signature', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      const webhookData = {
        partnerCode: 'TEST_PARTNER',
        orderId: 'ORDER_123',
        requestId: 'REQ_123',
        amount: 100000,
        orderInfo: 'Test',
        orderType: 'momo_wallet',
        transId: 'TRANS_123',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        signature: 'invalid_sig'
      }

      const result = await payment.handleWebhook(webhookData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid signature')
    })

    it('should skip already processed webhook', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      const webhookData = {
        partnerCode: 'TEST_PARTNER',
        orderId: 'ORDER_123',
        requestId: 'REQ_123',
        amount: 100000,
        orderInfo: 'Test',
        orderType: 'momo_wallet',
        transId: 'TRANS_123',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: ''
      }

      // Calculate valid signature
      const rawSignature = `accessKey=test_access_key&amount=${webhookData.amount}&extraData=${webhookData.extraData}&message=${webhookData.message}&orderId=${webhookData.orderId}&orderInfo=${webhookData.orderInfo}&orderType=${webhookData.orderType}&partnerCode=${webhookData.partnerCode}&payType=${webhookData.payType}&requestId=${webhookData.requestId}&responseTime=${webhookData.responseTime}&resultCode=${webhookData.resultCode}&transId=${webhookData.transId}`
      const signature = crypto
        .createHmac('sha256', 'test_secret_key')
        .update(rawSignature)
        .digest('hex')

      mockPrisma.webhook_events.findUnique.mockResolvedValue({ id: 'existing' })

      const result = await payment.handleWebhook({ ...webhookData, signature })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Webhook already processed')
    })

    it('should return error if payment not found', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      const webhookData = {
        partnerCode: 'TEST_PARTNER',
        orderId: 'ORDER_123',
        requestId: 'REQ_123',
        amount: 100000,
        orderInfo: 'Test',
        orderType: 'momo_wallet',
        transId: 'TRANS_123',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: ''
      }

      const rawSignature = `accessKey=test_access_key&amount=${webhookData.amount}&extraData=${webhookData.extraData}&message=${webhookData.message}&orderId=${webhookData.orderId}&orderInfo=${webhookData.orderInfo}&orderType=${webhookData.orderType}&partnerCode=${webhookData.partnerCode}&payType=${webhookData.payType}&requestId=${webhookData.requestId}&responseTime=${webhookData.responseTime}&resultCode=${webhookData.resultCode}&transId=${webhookData.transId}`
      const signature = crypto
        .createHmac('sha256', 'test_secret_key')
        .update(rawSignature)
        .digest('hex')

      mockPrisma.webhook_events.findUnique.mockResolvedValue(null)
      mockPrisma.payments.findFirst.mockResolvedValue(null)

      const result = await payment.handleWebhook({ ...webhookData, signature })

      expect(result.success).toBe(false)
      expect(result.message).toBe('Payment not found')
    })
  })

  describe('queryPaymentStatus', () => {
    it('should query payment status successfully', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            resultCode: 0,
            transId: 'TRANS_123',
            amount: 100000
          })
      })

      const result = await payment.queryPaymentStatus('ORDER_123')

      expect(result.success).toBe(true)
      expect(result.data?.transId).toBe('TRANS_123')
    })

    it('should handle query error', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            resultCode: 1000,
            message: 'Order not found'
          })
      })

      const result = await payment.queryPaymentStatus('INVALID_ORDER')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Order not found')
    })

    it('should handle network error', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.queryPaymentStatus('ORDER_123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('refundPayment', () => {
    it('should refund payment successfully', async () => {
      jest.resetModules()
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            resultCode: 0,
            transId: 'REFUND_123'
          })
      })

      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-123',
        amount: 100000
      })
      mockPrisma.payments.update.mockResolvedValue({})

      const result = await payment.refundPayment('ORDER_123', 50000, 'Customer request')

      expect(result.success).toBe(true)
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
      const { MoMoPayment } = require('../momo')
      const payment = new MoMoPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            resultCode: 1000,
            message: 'Refund failed'
          })
      })

      const result = await payment.refundPayment('ORDER_123', 50000, 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Refund failed')
    })
  })
})
