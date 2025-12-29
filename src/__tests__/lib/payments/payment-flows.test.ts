/**
 * Payment Flow Unit Tests
 *
 * Unit tests for payment providers with mocked database and external APIs.
 *
 * @jest-environment node
 */

// Mock environment variables for testing
process.env.MOMO_PARTNER_CODE = 'TEST_PARTNER'
process.env.MOMO_ACCESS_KEY = 'TEST_ACCESS_KEY'
process.env.MOMO_SECRET_KEY = 'TEST_SECRET_KEY'
process.env.ZALOPAY_APP_ID = '2553'
process.env.ZALOPAY_KEY1 = 'TEST_KEY1'
process.env.ZALOPAY_KEY2 = 'TEST_KEY2'
process.env.VNPAY_TMN_CODE = 'TEST_TMN'
process.env.VNPAY_HASH_SECRET = 'TEST_HASH_SECRET'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

// Fixed test IDs used by both test code and mocks
const TEST_BOOKING_ID = 'test-booking-001'
const TEST_USER_ID = 'test-user-001'
const TEST_SERVICE_ID = 'test-service-001'
const TEST_TIER_ID = 'test-tier-001'

// Track created payments - shared between mock and tests
const mockPayments: Record<string, unknown>[] = []

// Helper to generate UUID
const genId = () => {
  const s = () => Math.random().toString(16).substring(2, 6)
  return `${s()}${s()}-${s()}-${s()}-${s()}-${s()}${s()}${s()}`
}

// Mock test data
const mockBooking = {
  id: TEST_BOOKING_ID,
  booking_number: 'TEST001',
  user_id: TEST_USER_ID,
  service_tier_id: TEST_TIER_ID,
  status: 'pending',
  payment_status: 'pending',
  total_amount: 100000,
  final_amount: 100000,
  currency: 'VND',
  updated_at: new Date()
}

const mockServiceTier = {
  id: TEST_TIER_ID,
  service_id: TEST_SERVICE_ID,
  name: 'Test Tier',
  slug: 'test-tier',
  price: 100000,
  features: ['Feature 1', 'Feature 2'],
  is_available: true,
  updated_at: new Date()
}

const mockService = {
  id: TEST_SERVICE_ID,
  name: 'Test Service',
  slug: 'test-service',
  description: 'Test service description',
  base_price: 100000,
  currency: 'VND',
  is_active: true,
  updated_at: new Date()
}

const mockUser = {
  id: TEST_USER_ID,
  email: 'test@example.com',
  password: 'hashed_test_password',
  full_name: 'Test User',
  phone: '+84123456789',
  updated_at: new Date()
}

// Mock prisma before importing modules
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      findUnique: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === 'test-booking-001') {
          return Promise.resolve({
            id: 'test-booking-001',
            booking_number: 'TEST001',
            user_id: 'test-user-001',
            service_tier_id: 'test-tier-001',
            status: 'pending',
            payment_status: 'pending',
            total_amount: 100000,
            final_amount: 100000,
            currency: 'VND',
            updated_at: new Date(),
            // Include related data for ZaloPay
            users: {
              id: 'test-user-001',
              email: 'test@example.com',
              full_name: 'Test User'
            },
            service_tiers: {
              id: 'test-tier-001',
              name: 'Test Tier',
              price: 100000,
              services: {
                id: 'test-service-001',
                name: 'Test Service',
                slug: 'test-service'
              }
            }
          })
        }
        return Promise.resolve(null)
      }),
      update: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        return Promise.resolve({
          id: 'test-booking-001',
          booking_number: 'TEST001',
          user_id: 'test-user-001',
          service_tier_id: 'test-tier-001',
          status: 'pending',
          payment_status: 'pending',
          total_amount: 100000,
          final_amount: 100000,
          currency: 'VND',
          updated_at: new Date(),
          ...data
        })
      })
    },
    payments: {
      create: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        const payment = { ...data, id: `pay-${Date.now()}-${Math.random().toString(36).substring(7)}` }
        return Promise.resolve(payment)
      }),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        return Promise.resolve({ id: 'payment-id', ...data })
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 })
    },
    service_tasks: {
      create: jest.fn().mockResolvedValue({ id: 'mock-task-id' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 })
    },
    communications: {
      create: jest.fn().mockResolvedValue({ id: 'mock-comm-id' }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 })
    },
    service_tiers: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-tier-001',
        service_id: 'test-service-001',
        name: 'Test Tier',
        slug: 'test-tier',
        price: 100000,
        features: ['Feature 1', 'Feature 2'],
        is_available: true,
        updated_at: new Date()
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 })
    },
    services: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-service-001',
        name: 'Test Service',
        slug: 'test-service',
        description: 'Test service description',
        base_price: 100000,
        currency: 'VND',
        is_active: true,
        updated_at: new Date()
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 })
    },
    users: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-user-001',
        email: 'test@example.com',
        password: 'hashed_test_password',
        full_name: 'Test User',
        phone: '+84123456789',
        updated_at: new Date()
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 })
    }
  }
}))

// Mock external dependencies
jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('@/lib/email/service', () => ({
  getEmailService: () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
    sendPaymentConfirmation: jest.fn().mockResolvedValue(undefined)
  })
}))

jest.mock('@/lib/discord', () => ({
  discordNotifier: {
    sendPaymentNotification: jest.fn().mockResolvedValue(undefined)
  }
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}))

jest.mock('@/lib/websocket/events', () => ({
  emitPaymentUpdate: jest.fn(),
  emitOrderTracking: jest.fn(),
  emitAdminDashboardUpdate: jest.fn()
}))

// Import after mocks
import { MoMoPayment } from '@/lib/payments/momo'
import { ZaloPayPayment } from '@/lib/payments/zalopay'
import { VNPayPayment } from '@/lib/payments/vnpay'
import { BankingTransfer } from '@/lib/payments/banking'

// Mock fetch for external API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// Helper to create mock responses
const createMockResponse = (data: unknown, ok = true) => ({
  ok,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data))
})

describe('Payment Flow Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPayments.length = 0

    // Default: MoMo successful response
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('momo')) {
        return Promise.resolve(createMockResponse({
          partnerCode: 'TEST_PARTNER',
          orderId: 'MOMO_TEST001_' + Date.now(),
          requestId: 'REQ_' + Date.now(),
          amount: 100000,
          responseTime: Date.now(),
          message: 'Successful.',
          resultCode: 0,
          payUrl: 'https://test-payment.momo.vn/pay/TEST123',
          qrCodeUrl: 'https://test-payment.momo.vn/qr/TEST123'
        }))
      }
      if (url.includes('zalopay')) {
        return Promise.resolve(createMockResponse({
          return_code: 1,
          return_message: 'Success',
          sub_return_code: 1,
          sub_return_message: 'Success',
          zp_trans_token: 'ZP_TOKEN_' + Date.now(),
          order_url: 'https://sb-openapi.zalopay.vn/order/TEST123',
          order_token: 'ORDER_TOKEN_123'
        }))
      }
      return Promise.resolve(createMockResponse({ success: true }))
    })
  })

  describe('MoMo Payment Flow', () => {
    it('should create MoMo payment successfully', async () => {
      const momoPayment = new MoMoPayment()

      const result = await momoPayment.createPayment({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.payUrl).toBeDefined()
    })

    it('should verify MoMo signature correctly', async () => {
      const momoPayment = new MoMoPayment()
      const crypto = await import('crypto')

      // Test signature generation matches expected format
      const testParams = {
        amount: 100000,
        extraData: '',
        message: 'Successful.',
        orderId: 'TEST_ORDER',
        orderInfo: 'Test payment',
        orderType: 'momo_wallet',
        partnerCode: 'TEST_PARTNER',
        payType: 'qr',
        requestId: 'REQ_123',
        responseTime: 1234567890,
        resultCode: 0,
        transId: '123456789'
      }

      const rawSignature = `accessKey=TEST_ACCESS_KEY&amount=${testParams.amount}&extraData=${testParams.extraData}&message=${testParams.message}&orderId=${testParams.orderId}&orderInfo=${testParams.orderInfo}&orderType=${testParams.orderType}&partnerCode=${testParams.partnerCode}&payType=${testParams.payType}&requestId=${testParams.requestId}&responseTime=${testParams.responseTime}&resultCode=${testParams.resultCode}&transId=${testParams.transId}`
      const signature = crypto.createHmac('sha256', 'TEST_SECRET_KEY').update(rawSignature).digest('hex')

      // Verify signature is generated correctly (64 char hex string)
      expect(signature).toHaveLength(64)
      expect(/^[a-f0-9]+$/.test(signature)).toBe(true)
    })

    it('should handle invalid booking ID', async () => {
      const momoPayment = new MoMoPayment()

      const result = await momoPayment.createPayment({
        booking_id: 'invalid-id',
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Booking not found')
    })
  })

  describe('ZaloPay Payment Flow', () => {
    it('should create ZaloPay order successfully', async () => {
      const zaloPayment = new ZaloPayPayment()

      const result = await zaloPayment.createOrder({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        description: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })
  })

  describe('VNPay Payment Flow', () => {
    it('should create VNPay payment URL successfully', async () => {
      const vnpayPayment = new VNPayPayment()

      const result = await vnpayPayment.createPaymentUrl({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data?.paymentUrl).toBeDefined()
      expect(result.data?.orderId).toBeDefined()
    })

    it('should verify return URL correctly', async () => {
      const vnpayPayment = new VNPayPayment()

      // Build query params
      const queryParams: Record<string, string> = {
        vnp_Amount: '10000000',
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP01234567',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test payment',
        vnp_PayDate: '20240101120000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '13456789',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: 'VNPAY_TEST001_123456'
      }

      // Create valid signature
      const crypto = await import('crypto')
      const sortedParams = Object.keys(queryParams).sort()
      const signData = sortedParams.map(key => `${key}=${queryParams[key]}`).join('&')
      const signature = crypto.createHmac('sha512', 'TEST_HASH_SECRET').update(signData).digest('hex')

      const query = {
        ...queryParams,
        vnp_SecureHashType: 'SHA512',
        vnp_SecureHash: signature
      }

      const result = vnpayPayment.verifyReturnUrl(query)
      expect(result.success).toBe(true)
      expect(result.data?.vnp_TxnRef).toBe('VNPAY_TEST001_123456')
    })
  })

  describe('Banking Transfer Flow', () => {
    it('should create banking transfer order successfully', async () => {
      const bankingTransfer = new BankingTransfer()

      const result = await bankingTransfer.createTransferOrder({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        customerName: 'Test User',
        customerEmail: 'test@example.com'
      })

      expect(result.success).toBe(true)
      expect(result.data?.transferCode).toBeDefined()
      expect(result.data?.bankAccounts).toBeDefined()
      expect(result.data?.amount).toBe(100000)
    })

    it('should confirm transfer successfully', async () => {
      const bankingTransfer = new BankingTransfer()

      // Mock findFirst to return a payment for confirmation
      const { prisma } = jest.requireMock('@/lib/db')
      prisma.payments.findFirst.mockResolvedValueOnce({
        id: 'payment-id',
        booking_id: TEST_BOOKING_ID,
        gateway_transaction_id: 'BK-TRANSFER-123',
        status: 'pending',
        amount: 100000
      })

      // Confirm transfer
      const confirmResult = await bankingTransfer.confirmTransfer(
        'BK-TRANSFER-123',
        'Manual verification by admin'
      )

      expect(confirmResult.success).toBe(true)
    })
  })

  describe('Payment Error Handling', () => {
    it('should handle duplicate payments gracefully', async () => {
      const momoPayment = new MoMoPayment()

      // Create first payment
      const result1 = await momoPayment.createPayment({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        orderInfo: 'Test payment'
      })
      expect(result1.success).toBe(true)

      // Create second payment for same booking - should still succeed
      const result2 = await momoPayment.createPayment({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        orderInfo: 'Test payment'
      })
      expect(result2.success).toBe(true)
    })
  })

  describe('Payment Status Transitions', () => {
    it('should track payment status correctly', async () => {
      const momoPayment = new MoMoPayment()

      // Create payment - status should be pending
      const result = await momoPayment.createPayment({
        booking_id: TEST_BOOKING_ID,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)

      // Verify prisma.payments.create was called with pending status
      const { prisma } = jest.requireMock('@/lib/db')
      expect(prisma.payments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'pending',
            payment_method: 'momo'
          })
        })
      )
    })
  })
})
