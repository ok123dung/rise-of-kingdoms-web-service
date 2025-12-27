/**
 * Payment Flow Integration Tests
 *
 * These are integration tests that require a real test database.
 * They will be skipped if DATABASE_URL is not pointing to a test database.
 *
 * To run these tests:
 * 1. Set DATABASE_URL to a test database (with 'test' in the URL)
 * 2. Run: npm test -- --testPathPattern=payment-flows
 *
 * @jest-environment node
 */

import { PrismaClient } from '@prisma/client'
import { MoMoPayment } from '@/lib/payments/momo'
import { ZaloPayPayment } from '@/lib/payments/zalopay'
import { VNPayPayment } from '@/lib/payments/vnpay'
import { BankingTransfer } from '@/lib/payments/banking'

// Mock environment variables for testing
process.env.MOMO_PARTNER_CODE = 'TEST_PARTNER'
process.env.MOMO_ACCESS_KEY = 'TEST_ACCESS_KEY'
process.env.MOMO_SECRET_KEY = 'TEST_SECRET_KEY'
process.env.ZALOPAY_APP_ID = '2553'
process.env.ZALOPAY_KEY1 = 'TEST_KEY1'
process.env.ZALOPAY_KEY2 = 'TEST_KEY2'
process.env.VNPAY_TMN_CODE = 'TEST_TMN'
process.env.VNPAY_HASH_SECRET = 'TEST_HASH_SECRET'

// Helper to generate UUID
const generateId = () => crypto.randomUUID()

// These integration tests require RUN_INTEGRATION_TESTS=true and a real database
// Skip by default in regular test runs
const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true'

// Test database URL - can be overridden with TEST_DATABASE_URL env var
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/rok_test'

// Only instantiate prisma if we're running integration tests
// Use explicit datasource URL to avoid reading from .env
const prisma = shouldRunIntegrationTests
  ? new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl
        }
      }
    })
  : (null as unknown as PrismaClient)

// Skip all tests unless explicitly enabled
const describeIfDb = shouldRunIntegrationTests ? describe : describe.skip

describeIfDb('Payment Flow Integration Tests', () => {
  let testBooking: any
  let testUser: any
  let testService: any
  let testServiceTier: any

  beforeEach(async () => {
    // Create test data with all required fields per Prisma schema
    testUser = await prisma.users.create({
      data: {
        id: generateId(),
        email: 'test@example.com',
        password: 'hashed_test_password',
        full_name: 'Test User',
        phone: '+84123456789',
        updated_at: new Date()
      }
    })

    testService = await prisma.services.create({
      data: {
        id: generateId(),
        name: 'Test Service',
        slug: 'test-service',
        description: 'Test service description',
        base_price: 100000,
        currency: 'VND',
        is_active: true,
        updated_at: new Date()
      }
    })

    testServiceTier = await prisma.service_tiers.create({
      data: {
        id: generateId(),
        service_id: testService.id,
        name: 'Test Tier',
        slug: 'test',
        price: 100000,
        features: ['Feature 1', 'Feature 2'],
        is_available: true,
        updated_at: new Date()
      }
    })

    testBooking = await prisma.bookings.create({
      data: {
        id: generateId(),
        booking_number: 'TEST001',
        user_id: testUser.id,
        service_tier_id: testServiceTier.id,
        status: 'pending',
        payment_status: 'pending',
        total_amount: 100000,
        final_amount: 100000,
        currency: 'VND',
        updated_at: new Date()
      }
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.payments.deleteMany({ where: { booking_id: testBooking.id } })
    await prisma.bookings.delete({ where: { id: testBooking.id } })
    await prisma.service_tiers.delete({ where: { id: testServiceTier.id } })
    await prisma.services.delete({ where: { id: testService.id } })
    await prisma.users.delete({ where: { id: testUser.id } })
  })

  describe('MoMo Payment Flow', () => {
    it('should create MoMo payment successfully', async () => {
      const momoPayment = new MoMoPayment()

      const result = await momoPayment.createPayment({
        booking_id: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      // Verify payment record was created
      const payment = await prisma.payments.findFirst({
        where: { booking_id: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.payment_method).toBe('momo')
      expect(payment?.status).toBe('pending')
    })

    it('should handle MoMo webhook correctly', async () => {
      // First create a payment
      const momoPayment = new MoMoPayment()
      await momoPayment.createPayment({
        booking_id: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      // Mock successful webhook data
      const webhookData = {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        orderId: 'MOMO_TEST001_123456',
        requestId: 'REQ_123456',
        amount: 100000,
        orderInfo: 'Test payment',
        orderType: 'momo_wallet',
        transId: '123456789',
        resultCode: 0,
        message: 'Successful.',
        payType: 'qr',
        responseTime: Date.now(),
        extraData: '',
        signature: 'test_signature'
      }

      const result = await momoPayment.handleWebhook(webhookData)
      expect(result.success).toBe(true)

      // Verify payment status was updated
      const payment = await prisma.payments.findFirst({
        where: { booking_id: testBooking.id }
      })
      expect(payment?.status).toBe('completed')

      // Verify booking status was updated
      const booking = await prisma.bookings.findUnique({
        where: { id: testBooking.id }
      })
      expect(booking?.payment_status).toBe('completed')
      expect(booking?.status).toBe('confirmed')
    })
  })

  describe('ZaloPay Payment Flow', () => {
    it('should create ZaloPay order successfully', async () => {
      const zaloPayment = new ZaloPayPayment()

      const result = await zaloPayment.createOrder({
        booking_id: testBooking.id,
        amount: 100000,
        description: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      // Verify payment record was created
      const payment = await prisma.payments.findFirst({
        where: { booking_id: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.payment_method).toBe('zalopay')
      expect(payment?.status).toBe('pending')
    })
  })

  describe('VNPay Payment Flow', () => {
    it('should create VNPay payment URL successfully', async () => {
      const vnpayPayment = new VNPayPayment()

      const result = await vnpayPayment.createPaymentUrl({
        booking_id: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data?.paymentUrl).toBeDefined()
      expect(result.data?.orderId).toBeDefined()

      // Verify payment record was created
      const payment = await prisma.payments.findFirst({
        where: { booking_id: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.payment_method).toBe('vnpay')
      expect(payment?.status).toBe('pending')
    })

    it('should verify return URL correctly', async () => {
      const vnpayPayment = new VNPayPayment()

      // Mock return URL query parameters
      const query = {
        vnp_Amount: '10000000', // 100,000 VND in cents
        vnp_BankCode: 'NCB',
        vnp_BankTranNo: 'VNP01234567',
        vnp_CardType: 'ATM',
        vnp_OrderInfo: 'Test payment',
        vnp_PayDate: '20240101120000',
        vnp_ResponseCode: '00',
        vnp_TmnCode: 'TEST_TMN',
        vnp_TransactionNo: '13456789',
        vnp_TransactionStatus: '00',
        vnp_TxnRef: 'VNPAY_TEST001_123456',
        vnp_SecureHashType: 'SHA512',
        vnp_SecureHash: 'test_hash'
      }

      const result = vnpayPayment.verifyReturnUrl(query)
      expect(result.success).toBe(true)
      expect(result.data?.orderId).toBe('VNPAY_TEST001_123456')
      expect(result.data?.amount).toBe(100000)
    })
  })

  describe('Banking Transfer Flow', () => {
    it('should create banking transfer order successfully', async () => {
      const bankingTransfer = new BankingTransfer()

      const result = await bankingTransfer.createTransferOrder({
        booking_id: testBooking.id,
        amount: 100000,
        customerName: 'Test User',
        customerEmail: 'test@example.com'
      })

      expect(result.success).toBe(true)
      expect(result.data?.transferCode).toBeDefined()
      expect(result.data?.bankAccounts).toBeDefined()
      expect(result.data?.amount).toBe(100000)

      // Verify payment record was created
      const payment = await prisma.payments.findFirst({
        where: { booking_id: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.payment_method).toBe('banking')
      expect(payment?.status).toBe('pending')
    })

    it('should confirm transfer successfully', async () => {
      const bankingTransfer = new BankingTransfer()

      // First create a transfer order
      const createResult = await bankingTransfer.createTransferOrder({
        booking_id: testBooking.id,
        amount: 100000,
        customerName: 'Test User',
        customerEmail: 'test@example.com'
      })

      expect(createResult.success).toBe(true)
      const transferCode = createResult.data!.transferCode

      // Then confirm it
      const confirmResult = await bankingTransfer.confirmTransfer(
        transferCode,
        'Manual verification by admin'
      )

      expect(confirmResult.success).toBe(true)

      // Verify payment status was updated
      const payment = await prisma.payments.findFirst({
        where: { booking_id: testBooking.id }
      })
      expect(payment?.status).toBe('completed')

      // Verify booking status was updated
      const booking = await prisma.bookings.findUnique({
        where: { id: testBooking.id }
      })
      expect(booking?.payment_status).toBe('completed')
      expect(booking?.status).toBe('confirmed')
    })
  })

  describe('Payment Error Handling', () => {
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

    it('should handle duplicate payments', async () => {
      const momoPayment = new MoMoPayment()

      // Create first payment
      const result1 = await momoPayment.createPayment({
        booking_id: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })
      expect(result1.success).toBe(true)

      // Try to create second payment for same booking
      const result2 = await momoPayment.createPayment({
        booking_id: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      // Should still succeed but with different order ID
      expect(result2.success).toBe(true)
    })
  })

  describe('Payment Status Transitions', () => {
    it('should handle payment status transitions correctly', async () => {
      // Create payment
      const payment = await prisma.payments.create({
        data: {
          id: generateId(),
          booking_id: testBooking.id,
          payment_number: 'TEST_PAY_001',
          amount: 100000,
          currency: 'VND',
          payment_method: 'momo',
          payment_gateway: 'momo',
          gateway_transaction_id: 'TEST_TXN_001',
          status: 'pending',
          updated_at: new Date()
        }
      })

      // Test pending -> completed
      await prisma.payments.update({
        where: { id: payment.id },
        data: { status: 'completed', paid_at: new Date() }
      })

      const updatedPayment = await prisma.payments.findUnique({
        where: { id: payment.id }
      })
      expect(updatedPayment?.status).toBe('completed')
      expect(updatedPayment?.paid_at).toBeDefined()

      // Test completed -> refunded
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: 'refunded',
          refund_amount: 100000,
          refund_reason: 'Customer request',
          refunded_at: new Date()
        }
      })

      const refundedPayment = await prisma.payments.findUnique({
        where: { id: payment.id }
      })
      expect(refundedPayment?.status).toBe('refunded')
      expect(Number(refundedPayment?.refund_amount)).toBe(100000) // Prisma Decimal returns string
      expect(refundedPayment?.refunded_at).toBeDefined()
    })
  })
})

// Performance tests - also require test database
describeIfDb('Payment Performance Tests', () => {
  it('should handle concurrent payment creation', async () => {
    const startTime = Date.now()

    // Create multiple test bookings
    const bookings = await Promise.all(
      Array.from({ length: 10 }, async (_, i) => {
        const user = await prisma.users.create({
          data: {
            id: generateId(),
            email: `test${i}@example.com`,
            password: 'hashed_test_password',
            full_name: `Test User ${i}`,
            phone: `+8412345678${i}`,
            updated_at: new Date()
          }
        })

        const service = await prisma.services.create({
          data: {
            id: generateId(),
            name: `Test Service ${i}`,
            slug: `test-service-${i}`,
            description: 'Test service description',
            base_price: 100000,
            currency: 'VND',
            is_active: true,
            updated_at: new Date()
          }
        })

        const service_tiers = await prisma.service_tiers.create({
          data: {
            id: generateId(),
            service_id: service.id,
            name: 'Test Tier',
            slug: 'test',
            price: 100000,
            features: ['Feature 1'],
            is_available: true,
            updated_at: new Date()
          }
        })

        return await prisma.bookings.create({
          data: {
            id: generateId(),
            booking_number: `TEST${i.toString().padStart(3, '0')}`,
            user_id: user.id,
            service_tier_id: service_tiers.id,
            status: 'pending',
            payment_status: 'pending',
            total_amount: 100000,
            final_amount: 100000,
            currency: 'VND',
            updated_at: new Date()
          }
        })
      })
    )

    // Create payments concurrently
    const momoPayment = new MoMoPayment()
    const results = await Promise.all(
      bookings.map(booking =>
        momoPayment.createPayment({
          booking_id: booking.id,
          amount: 100000,
          orderInfo: 'Concurrent test payment'
        })
      )
    )

    const endTime = Date.now()
    const duration = endTime - startTime

    // All payments should succeed
    results.forEach(result => {
      expect(result.success).toBe(true)
    })

    // Should complete within reasonable time (5 seconds for 10 concurrent payments)
    expect(duration).toBeLessThan(5000)

    // Test performance logged: Concurrent payment creation took ${duration}ms for ${bookings.length} payments

    // Cleanup
    await Promise.all(
      bookings.map(async booking => {
        await prisma.payments.deleteMany({ where: { booking_id: booking.id } })
        await prisma.bookings.delete({ where: { id: booking.id } })
        const service_tiers = await prisma.service_tiers.findFirst({
          where: { id: booking.service_tier_id }
        })
        if (service_tiers) {
          await prisma.service_tiers.delete({ where: { id: service_tiers.id } })
          await prisma.services.delete({ where: { id: service_tiers.service_id } })
        }
        await prisma.users.delete({ where: { id: booking.user_id } })
      })
    )
  })
})
