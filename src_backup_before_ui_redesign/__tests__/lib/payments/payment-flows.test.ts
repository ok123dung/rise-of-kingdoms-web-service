import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
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

const prisma = new PrismaClient()

describe('Payment Flow Integration Tests', () => {
  let testBooking: any
  let testUser: any
  let testService: any
  let testServiceTier: any

  beforeEach(async () => {
    // Create test data
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+84123456789'
      }
    })

    testService = await prisma.service.create({
      data: {
        name: 'Test Service',
        slug: 'test-service',
        description: 'Test service description',
        basePrice: 100000,
        currency: 'VND',
        isActive: true
      }
    })

    testServiceTier = await prisma.serviceTier.create({
      data: {
        serviceId: testService.id,
        name: 'Test Tier',
        slug: 'test',
        price: 100000,
        features: ['Feature 1', 'Feature 2'],
        isAvailable: true
      }
    })

    testBooking = await prisma.booking.create({
      data: {
        bookingNumber: 'TEST001',
        userId: testUser.id,
        serviceTierId: testServiceTier.id,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: 100000,
        finalAmount: 100000,
        currency: 'VND'
      }
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.payment.deleteMany({ where: { bookingId: testBooking.id } })
    await prisma.booking.delete({ where: { id: testBooking.id } })
    await prisma.serviceTier.delete({ where: { id: testServiceTier.id } })
    await prisma.service.delete({ where: { id: testService.id } })
    await prisma.user.delete({ where: { id: testUser.id } })
  })

  describe('MoMo Payment Flow', () => {
    it('should create MoMo payment successfully', async () => {
      const momoPayment = new MoMoPayment()

      const result = await momoPayment.createPayment({
        bookingId: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      // Verify payment record was created
      const payment = await prisma.payment.findFirst({
        where: { bookingId: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.paymentMethod).toBe('momo')
      expect(payment?.status).toBe('pending')
    })

    it('should handle MoMo webhook correctly', async () => {
      // First create a payment
      const momoPayment = new MoMoPayment()
      await momoPayment.createPayment({
        bookingId: testBooking.id,
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
      const payment = await prisma.payment.findFirst({
        where: { bookingId: testBooking.id }
      })
      expect(payment?.status).toBe('completed')

      // Verify booking status was updated
      const booking = await prisma.booking.findUnique({
        where: { id: testBooking.id }
      })
      expect(booking?.paymentStatus).toBe('completed')
      expect(booking?.status).toBe('confirmed')
    })
  })

  describe('ZaloPay Payment Flow', () => {
    it('should create ZaloPay order successfully', async () => {
      const zaloPayment = new ZaloPayPayment()

      const result = await zaloPayment.createOrder({
        bookingId: testBooking.id,
        amount: 100000,
        description: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      // Verify payment record was created
      const payment = await prisma.payment.findFirst({
        where: { bookingId: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.paymentMethod).toBe('zalopay')
      expect(payment?.status).toBe('pending')
    })
  })

  describe('VNPay Payment Flow', () => {
    it('should create VNPay payment URL successfully', async () => {
      const vnpayPayment = new VNPayPayment()

      const result = await vnpayPayment.createPaymentUrl({
        bookingId: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })

      expect(result.success).toBe(true)
      expect(result.data?.paymentUrl).toBeDefined()
      expect(result.data?.orderId).toBeDefined()

      // Verify payment record was created
      const payment = await prisma.payment.findFirst({
        where: { bookingId: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.paymentMethod).toBe('vnpay')
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
        bookingId: testBooking.id,
        amount: 100000,
        customerName: 'Test User',
        customerEmail: 'test@example.com'
      })

      expect(result.success).toBe(true)
      expect(result.data?.transferCode).toBeDefined()
      expect(result.data?.bankAccounts).toBeDefined()
      expect(result.data?.amount).toBe(100000)

      // Verify payment record was created
      const payment = await prisma.payment.findFirst({
        where: { bookingId: testBooking.id }
      })
      expect(payment).toBeDefined()
      expect(payment?.paymentMethod).toBe('banking')
      expect(payment?.status).toBe('pending')
    })

    it('should confirm transfer successfully', async () => {
      const bankingTransfer = new BankingTransfer()

      // First create a transfer order
      const createResult = await bankingTransfer.createTransferOrder({
        bookingId: testBooking.id,
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
      const payment = await prisma.payment.findFirst({
        where: { bookingId: testBooking.id }
      })
      expect(payment?.status).toBe('completed')

      // Verify booking status was updated
      const booking = await prisma.booking.findUnique({
        where: { id: testBooking.id }
      })
      expect(booking?.paymentStatus).toBe('completed')
      expect(booking?.status).toBe('confirmed')
    })
  })

  describe('Payment Error Handling', () => {
    it('should handle invalid booking ID', async () => {
      const momoPayment = new MoMoPayment()

      const result = await momoPayment.createPayment({
        bookingId: 'invalid-id',
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
        bookingId: testBooking.id,
        amount: 100000,
        orderInfo: 'Test payment'
      })
      expect(result1.success).toBe(true)

      // Try to create second payment for same booking
      const result2 = await momoPayment.createPayment({
        bookingId: testBooking.id,
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
      const payment = await prisma.payment.create({
        data: {
          bookingId: testBooking.id,
          paymentNumber: 'TEST_PAY_001',
          amount: 100000,
          currency: 'VND',
          paymentMethod: 'momo',
          paymentGateway: 'momo',
          gatewayTransactionId: 'TEST_TXN_001',
          status: 'pending'
        }
      })

      // Test pending -> completed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed', paidAt: new Date() }
      })

      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id }
      })
      expect(updatedPayment?.status).toBe('completed')
      expect(updatedPayment?.paidAt).toBeDefined()

      // Test completed -> refunded
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'refunded',
          refundAmount: 100000,
          refundReason: 'Customer request',
          refundedAt: new Date()
        }
      })

      const refundedPayment = await prisma.payment.findUnique({
        where: { id: payment.id }
      })
      expect(refundedPayment?.status).toBe('refunded')
      expect(refundedPayment?.refundAmount).toBe(100000)
      expect(refundedPayment?.refundedAt).toBeDefined()
    })
  })
})

// Performance tests
describe('Payment Performance Tests', () => {
  it('should handle concurrent payment creation', async () => {
    const startTime = Date.now()

    // Create multiple test bookings
    const bookings = await Promise.all(
      Array.from({ length: 10 }, async (_, i) => {
        const user = await prisma.user.create({
          data: {
            email: `test${i}@example.com`,
            fullName: `Test User ${i}`,
            phone: `+8412345678${i}`
          }
        })

        const service = await prisma.service.create({
          data: {
            name: `Test Service ${i}`,
            slug: `test-service-${i}`,
            description: 'Test service description',
            basePrice: 100000,
            currency: 'VND',
            isActive: true
          }
        })

        const serviceTier = await prisma.serviceTier.create({
          data: {
            serviceId: service.id,
            name: 'Test Tier',
            slug: 'test',
            price: 100000,
            features: ['Feature 1'],
            isAvailable: true
          }
        })

        return await prisma.booking.create({
          data: {
            bookingNumber: `TEST${i.toString().padStart(3, '0')}`,
            userId: user.id,
            serviceTierId: serviceTier.id,
            status: 'pending',
            paymentStatus: 'pending',
            totalAmount: 100000,
            finalAmount: 100000,
            currency: 'VND'
          }
        })
      })
    )

    // Create payments concurrently
    const momoPayment = new MoMoPayment()
    const results = await Promise.all(
      bookings.map(booking =>
        momoPayment.createPayment({
          bookingId: booking.id,
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
        await prisma.payment.deleteMany({ where: { bookingId: booking.id } })
        await prisma.booking.delete({ where: { id: booking.id } })
        const serviceTier = await prisma.serviceTier.findFirst({
          where: { id: booking.serviceTierId }
        })
        if (serviceTier) {
          await prisma.serviceTier.delete({ where: { id: serviceTier.id } })
          await prisma.service.delete({ where: { id: serviceTier.serviceId } })
        }
        await prisma.user.delete({ where: { id: booking.userId } })
      })
    )
  })
})
