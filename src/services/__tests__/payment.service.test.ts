/**
 * Payment Service Tests
 * Tests for payment processing and gateway integrations
 */

import { Prisma } from '@prisma/client'

import { PaymentService } from '../payment.service'
import { NotFoundError, ValidationError, ConflictError, PaymentError } from '@/lib/errors'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      findUnique: jest.fn(),
    },
    payments: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

jest.mock('@/lib/crypto-utils', () => ({
  generateSecurePaymentRef: jest.fn(() => 'PAY241230ABC123'),
}))

jest.mock('@/lib/payments/momo', () => ({
  MoMoPayment: jest.fn().mockImplementation(() => ({
    createPayment: jest.fn().mockResolvedValue({ payUrl: 'https://momo.vn/pay' }),
    handleWebhook: jest.fn().mockResolvedValue({ success: true }),
    refundPayment: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

jest.mock('@/lib/payments/vnpay', () => ({
  VNPayPayment: jest.fn().mockImplementation(() => ({
    createPaymentUrl: jest.fn().mockResolvedValue({ paymentUrl: 'https://vnpay.vn/pay' }),
    verifyReturnUrl: jest.fn().mockResolvedValue({ success: true }),
    refundPayment: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

jest.mock('@/lib/payments/zalopay', () => ({
  ZaloPayPayment: jest.fn().mockImplementation(() => ({
    createOrder: jest.fn().mockResolvedValue({ orderUrl: 'https://zalopay.vn/pay' }),
    handleCallback: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

jest.mock('@/lib/payments/banking', () => ({
  BankingTransfer: jest.fn().mockImplementation(() => ({
    createTransferOrder: jest.fn().mockResolvedValue({
      qrCode: 'data:image/png;base64,abc123',
      bankInfo: { accountNumber: '123456789' },
    }),
  })),
}))

import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('PaymentService', () => {
  let service: PaymentService

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '0912345678',
  }

  const mockServiceTier = {
    id: 'tier-123',
    name: 'Premium',
    price: new Prisma.Decimal(500000),
    services: {
      id: 'service-123',
      name: 'Account Upgrade',
    },
  }

  const mockBooking = {
    id: 'booking-123',
    booking_number: 'BK241230001234',
    user_id: 'user-123',
    status: 'pending',
    payment_status: 'pending',
    total_amount: new Prisma.Decimal(500000),
    final_amount: new Prisma.Decimal(500000),
    currency: 'VND',
    users: mockUser,
    service_tiers: mockServiceTier,
  }

  const mockPayment = {
    id: 'payment-123',
    booking_id: 'booking-123',
    payment_number: 'PAY241230ABC123',
    amount: new Prisma.Decimal(500000),
    currency: 'VND',
    payment_method: 'momo',
    payment_gateway: 'momo',
    status: 'pending',
    gateway_transaction_id: 'momo-tx-123',
    refund_amount: new Prisma.Decimal(0),
    created_at: new Date(),
    updated_at: new Date(),
    bookings: mockBooking,
  }

  beforeEach(() => {
    service = new PaymentService()
    jest.clearAllMocks()
  })

  describe('createPayment', () => {
    it('should create MoMo payment successfully', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.payments.count.mockResolvedValue(0)
      mockPrisma.payments.create.mockResolvedValue(mockPayment as any)

      const result = await service.createPayment({
        booking_id: 'booking-123',
        payment_method: 'momo',
        user_id: 'user-123',
      })

      expect(result).toBeDefined()
      expect(mockPrisma.payments.create).toHaveBeenCalled()
    })

    it('should create VNPay payment successfully', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.payments.count.mockResolvedValue(0)
      mockPrisma.payments.create.mockResolvedValue({
        ...mockPayment,
        payment_method: 'vnpay',
      } as any)

      const result = await service.createPayment({
        booking_id: 'booking-123',
        payment_method: 'vnpay',
        user_id: 'user-123',
        returnUrl: 'https://example.com/callback',
      })

      expect(result).toBeDefined()
    })

    it('should create ZaloPay payment successfully', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.payments.count.mockResolvedValue(0)
      mockPrisma.payments.create.mockResolvedValue({
        ...mockPayment,
        payment_method: 'zalopay',
      } as any)

      const result = await service.createPayment({
        booking_id: 'booking-123',
        payment_method: 'zalopay',
        user_id: 'user-123',
      })

      expect(result).toBeDefined()
    })

    it('should create banking transfer successfully', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.payments.count.mockResolvedValue(0)
      mockPrisma.payments.create.mockResolvedValue({
        ...mockPayment,
        payment_method: 'banking',
      } as any)

      const result = await service.createPayment({
        booking_id: 'booking-123',
        payment_method: 'banking',
        user_id: 'user-123',
      })

      expect(result).toBeDefined()
    })

    it('should throw NotFoundError when booking not found', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(null)

      await expect(
        service.createPayment({
          booking_id: 'nonexistent',
          payment_method: 'momo',
          user_id: 'user-123',
        })
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when user does not own booking', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)

      await expect(
        service.createPayment({
          booking_id: 'booking-123',
          payment_method: 'momo',
          user_id: 'different-user',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when booking already paid', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({
        ...mockBooking,
        payment_status: 'completed',
      } as any)

      await expect(
        service.createPayment({
          booking_id: 'booking-123',
          payment_method: 'momo',
          user_id: 'user-123',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ConflictError when pending payment exists', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.payments.count.mockResolvedValue(1)

      await expect(
        service.createPayment({
          booking_id: 'booking-123',
          payment_method: 'momo',
          user_id: 'user-123',
        })
      ).rejects.toThrow(ConflictError)
    })

    it('should throw ValidationError for cancelled booking', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({
        ...mockBooking,
        status: 'cancelled',
      } as any)

      await expect(
        service.createPayment({
          booking_id: 'booking-123',
          payment_method: 'momo',
          user_id: 'user-123',
        })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('verifyPaymentCallback', () => {
    it('should verify MoMo callback', async () => {
      const result = await service.verifyPaymentCallback('momo', {
        orderId: 'order-123',
        resultCode: 0,
      })

      expect(result).toBeDefined()
    })

    it('should verify VNPay callback', async () => {
      const result = await service.verifyPaymentCallback('vnpay', {
        vnp_TxnRef: 'order-123',
        vnp_ResponseCode: '00',
      })

      expect(result).toBeDefined()
    })

    it('should verify ZaloPay callback', async () => {
      const result = await service.verifyPaymentCallback('zalopay', {
        app_trans_id: 'order-123',
        status: 1,
      })

      expect(result).toBeDefined()
    })

    it('should throw ValidationError for invalid payment method', async () => {
      await expect(
        service.verifyPaymentCallback('invalid', {})
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getPaymentById', () => {
    it('should return payment when found', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue(mockPayment as any)

      const result = await service.getPaymentById('payment-123')

      expect(result).toEqual(mockPayment)
    })

    it('should throw NotFoundError when payment not found', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue(null)

      await expect(service.getPaymentById('nonexistent')).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when user does not own payment', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue(mockPayment as any)

      await expect(
        service.getPaymentById('payment-123', 'different-user')
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getUserPayments', () => {
    it('should return user payments with pagination', async () => {
      mockPrisma.payments.findMany.mockResolvedValue([mockPayment] as any)
      mockPrisma.payments.count.mockResolvedValue(1)

      const result = await service.getUserPayments('user-123')

      expect(result.payments).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should filter by status', async () => {
      mockPrisma.payments.findMany.mockResolvedValue([])
      mockPrisma.payments.count.mockResolvedValue(0)

      await service.getUserPayments('user-123', { status: 'completed' })

      expect(mockPrisma.payments.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'completed' }),
        })
      )
    })

    it('should apply pagination', async () => {
      mockPrisma.payments.findMany.mockResolvedValue([])
      mockPrisma.payments.count.mockResolvedValue(0)

      await service.getUserPayments('user-123', { limit: 5, offset: 10 })

      expect(mockPrisma.payments.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        })
      )
    })
  })

  describe('processRefund', () => {
    const completedPayment = {
      ...mockPayment,
      status: 'completed',
      gateway_transaction_id: 'momo-tx-123',
      refund_amount: new Prisma.Decimal(0),
    }

    it('should process MoMo refund successfully', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue(completedPayment as any)
      mockPrisma.payments.update.mockResolvedValue({
        ...completedPayment,
        status: 'refunded',
        refund_amount: new Prisma.Decimal(500000),
      } as any)

      const result = await service.processRefund('payment-123', {
        amount: 500000,
        reason: 'Customer request',
        adminId: 'admin-123',
      })

      expect(result.status).toBe('refunded')
    })

    it('should throw ValidationError for non-completed payment', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue(mockPayment as any)

      await expect(
        service.processRefund('payment-123', {
          amount: 500000,
          reason: 'Refund',
          adminId: 'admin-123',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for already refunded payment', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue({
        ...completedPayment,
        refund_amount: new Prisma.Decimal(500000),
      } as any)

      await expect(
        service.processRefund('payment-123', {
          amount: 500000,
          reason: 'Refund',
          adminId: 'admin-123',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError for unsupported refund method', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue({
        ...completedPayment,
        payment_method: 'banking',
      } as any)

      await expect(
        service.processRefund('payment-123', {
          amount: 500000,
          reason: 'Refund',
          adminId: 'admin-123',
        })
      ).rejects.toThrow(ValidationError)
    })

    it('should process VNPay refund successfully', async () => {
      mockPrisma.payments.findUnique.mockResolvedValue({
        ...completedPayment,
        payment_method: 'vnpay',
      } as any)
      mockPrisma.payments.update.mockResolvedValue({
        ...completedPayment,
        payment_method: 'vnpay',
        status: 'refunded',
      } as any)

      const result = await service.processRefund('payment-123', {
        amount: 500000,
        reason: 'Customer request',
        adminId: 'admin-123',
      })

      expect(result.status).toBe('refunded')
    })
  })
})
