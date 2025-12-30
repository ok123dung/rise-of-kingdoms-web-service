/**
 * VNPay Payment Tests
 * Tests for VNPay payment gateway integration
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

describe('VNPayPayment', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      VNPAY_TMN_CODE: 'TEST_TMN',
      VNPAY_HASH_SECRET: 'test_hash_secret_key_12345',
      VNPAY_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      NEXT_PUBLIC_SITE_URL: 'https://example.com'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('constructor', () => {
    it('should throw error if VNPAY_TMN_CODE not set', () => {
      delete process.env.VNPAY_TMN_CODE

      expect(() => {
        jest.resetModules()
        const { VNPayPayment } = require('../vnpay')
        new VNPayPayment()
      }).toThrow('VNPay payment configuration missing')
    })

    it('should throw error if VNPAY_HASH_SECRET not set', () => {
      delete process.env.VNPAY_HASH_SECRET

      expect(() => {
        jest.resetModules()
        const { VNPayPayment } = require('../vnpay')
        new VNPayPayment()
      }).toThrow('VNPay payment configuration missing')
    })

    it('should use default URL if not set', () => {
      delete process.env.VNPAY_URL
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')

      const payment = new VNPayPayment()
      expect(payment).toBeDefined()
    })
  })

  describe('createPaymentUrl', () => {
    it('should return error if booking not found', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue(null)

      const result = await payment.createPaymentUrl({
        booking_id: 'nonexistent',
        amount: 100000,
        orderInfo: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Booking not found')
    })

    it('should create payment URL successfully', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        booking_number: 'BK001'
      })
      mockPrisma.payments.create.mockResolvedValue({ id: 'payment-123' })

      const result = await payment.createPaymentUrl({
        booking_id: 'booking-123',
        amount: 100000,
        orderInfo: 'Test order'
      })

      expect(result.success).toBe(true)
      expect(result.data?.paymentUrl).toContain('sandbox.vnpayment.vn')
      expect(result.data?.orderId).toContain('VNPAY_BK001_')
      expect(mockPrisma.payments.create).toHaveBeenCalled()
    })

    it('should handle database error', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockPrisma.bookings.findUnique.mockRejectedValue(new Error('DB error'))

      const result = await payment.createPaymentUrl({
        booking_id: 'booking-123',
        amount: 100000,
        orderInfo: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })

  describe('verifyReturnUrl', () => {
    it('should verify valid signature', () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const query: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_BankCode: 'NCB',
        vnp_OrderInfo: 'Test',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '123456',
        vnp_TxnRef: 'ORDER_123'
      }

      // Calculate signature
      const sortedParams = Object.keys(query).sort()
      const signData = sortedParams.map(key => `${key}=${query[key]}`).join('&')
      const signature = crypto
        .createHmac('sha512', 'test_hash_secret_key_12345')
        .update(signData)
        .digest('hex')

      query.vnp_SecureHash = signature

      const result = payment.verifyReturnUrl(query)

      expect(result.success).toBe(true)
      expect(result.data?.vnp_TxnRef).toBe('ORDER_123')
    })

    it('should reject invalid signature', () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const query = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'ORDER_123',
        vnp_SecureHash: 'invalid_signature'
      }

      const result = payment.verifyReturnUrl(query)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid signature')
    })
  })

  describe('handleIPN', () => {
    it('should reject missing signature', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const result = await payment.handleIPN({
        vnp_TxnRef: 'ORDER_123',
        vnp_Amount: '10000000'
      })

      expect(result.success).toBe(false)
      expect(result.responseCode).toBe('97')
    })

    it('should reject invalid signature', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const result = await payment.handleIPN({
        vnp_TxnRef: 'ORDER_123',
        vnp_Amount: '10000000',
        vnp_SecureHash: 'invalid'
      })

      expect(result.success).toBe(false)
      expect(result.responseCode).toBe('97')
    })

    it('should skip already processed webhook', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const query: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '123456',
        vnp_TxnRef: 'ORDER_123'
      }

      const sortedParams = Object.keys(query).sort()
      const signData = sortedParams.map(key => `${key}=${query[key]}`).join('&')
      const signature = crypto
        .createHmac('sha512', 'test_hash_secret_key_12345')
        .update(signData)
        .digest('hex')

      query.vnp_SecureHash = signature

      mockPrisma.webhook_events.findUnique.mockResolvedValue({ id: 'existing' })

      const result = await payment.handleIPN(query)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Webhook already processed')
      expect(result.responseCode).toBe('00')
    })

    it('should return error if payment not found', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const query: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '123456',
        vnp_TxnRef: 'ORDER_123'
      }

      const sortedParams = Object.keys(query).sort()
      const signData = sortedParams.map(key => `${key}=${query[key]}`).join('&')
      const signature = crypto
        .createHmac('sha512', 'test_hash_secret_key_12345')
        .update(signData)
        .digest('hex')

      query.vnp_SecureHash = signature

      mockPrisma.webhook_events.findUnique.mockResolvedValue(null)
      mockPrisma.payments.findFirst.mockResolvedValue(null)

      const result = await payment.handleIPN(query)

      expect(result.success).toBe(false)
      expect(result.responseCode).toBe('01')
    })

    it('should return error on amount mismatch', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const query: Record<string, string> = {
        vnp_Amount: '10000000', // 100,000 VND
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '123456',
        vnp_TxnRef: 'ORDER_123'
      }

      const sortedParams = Object.keys(query).sort()
      const signData = sortedParams.map(key => `${key}=${query[key]}`).join('&')
      const signature = crypto
        .createHmac('sha512', 'test_hash_secret_key_12345')
        .update(signData)
        .digest('hex')

      query.vnp_SecureHash = signature

      mockPrisma.webhook_events.findUnique.mockResolvedValue(null)
      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-123',
        amount: { toNumber: () => 200000 }, // Different amount
        status: 'pending'
      })

      const result = await payment.handleIPN(query)

      expect(result.success).toBe(false)
      expect(result.responseCode).toBe('04')
    })

    it('should return success if payment already completed', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      const query: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '123456',
        vnp_TxnRef: 'ORDER_123'
      }

      const sortedParams = Object.keys(query).sort()
      const signData = sortedParams.map(key => `${key}=${query[key]}`).join('&')
      const signature = crypto
        .createHmac('sha512', 'test_hash_secret_key_12345')
        .update(signData)
        .digest('hex')

      query.vnp_SecureHash = signature

      mockPrisma.webhook_events.findUnique.mockResolvedValue(null)
      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-123',
        amount: { toNumber: () => 100000 },
        status: 'completed'
      })

      const result = await payment.handleIPN(query)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Payment already processed')
      expect(result.responseCode).toBe('00')
    })
  })

  describe('queryPayment', () => {
    it('should query payment status successfully', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            vnp_ResponseCode: '00',
            vnp_TransactionStatus: '00',
            vnp_Amount: '10000000'
          })
      })

      const result = await payment.queryPayment('ORDER_123', '20241230120000')

      expect(result.success).toBe(true)
      expect(result.data?.vnp_ResponseCode).toBe('00')
    })

    it('should handle query error', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            vnp_ResponseCode: '01',
            vnp_Message: 'Order not found'
          })
      })

      const result = await payment.queryPayment('INVALID', '20241230120000')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Order not found')
    })

    it('should handle network error', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await payment.queryPayment('ORDER_123', '20241230120000')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('refundPayment', () => {
    it('should refund payment successfully', async () => {
      jest.resetModules()
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            vnp_ResponseCode: '00',
            vnp_TransactionNo: 'REFUND_123'
          })
      })

      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-123'
      })
      mockPrisma.payments.update.mockResolvedValue({})

      const result = await payment.refundPayment('ORDER_123', 50000, '20241230120000', 'Customer request')

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
      const { VNPayPayment } = require('../vnpay')
      const payment = new VNPayPayment()

      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({
            vnp_ResponseCode: '01',
            vnp_Message: 'Refund failed'
          })
      })

      const result = await payment.refundPayment('ORDER_123', 50000, '20241230120000', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Refund failed')
    })
  })
})
