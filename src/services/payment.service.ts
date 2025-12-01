import { generateSecurePaymentRef } from '@/lib/crypto-utils'
import { prisma } from '@/lib/db'
import { NotFoundError, ValidationError, PaymentError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { BankingTransfer } from '@/lib/payments/banking'
import { MoMoPayment } from '@/lib/payments/momo'
import { VNPayPayment } from '@/lib/payments/vnpay'
import { ZaloPayPayment } from '@/lib/payments/zalopay'
import type { Payment, Booking } from '@/types/database'

export class PaymentService {
  private logger = getLogger()
  private momoPayment = new MoMoPayment()
  private vnpayPayment = new VNPayPayment()
  private zalopayPayment = new ZaloPayPayment()
  private bankingTransfer = new BankingTransfer()

  /**
   * Create payment for booking
   */
  async createPayment(data: {
    bookingId: string
    paymentMethod: 'momo' | 'vnpay' | 'zalopay' | 'banking'
    userId: string
    returnUrl?: string
  }) {
    // Validate booking
    const booking = await this.validateBooking(data.bookingId, data.userId)

    // Check for existing pending payment
    const existingPayment = await this.checkExistingPayment(data.bookingId)
    if (existingPayment) {
      throw new ConflictError('Booking already has a pending payment')
    }

    // Generate payment number
    const paymentNumber = this.generatePaymentNumber()

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        paymentNumber,
        amount:
          typeof booking.finalAmount === 'number'
            ? booking.finalAmount
            : booking.finalAmount.toNumber(),
        currency: booking.currency,
        paymentMethod: data.paymentMethod,
        paymentGateway: data.paymentMethod,
        status: 'pending'
      }
    })

    try {
      // Process payment based on method
      const result = await this.processPayment({
        payment,
        booking,
        paymentMethod: data.paymentMethod,
        returnUrl: data.returnUrl
      })

      this.logger.info('Payment created', {
        paymentId: payment.id,
        bookingId: data.bookingId,
        method: data.paymentMethod
      })

      return result
    } catch (error) {
      // Update payment status to failed
      await this.updatePaymentStatus(payment.id, 'failed', {
        failureReason: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  /**
   * Verify payment callback
   */
  async verifyPaymentCallback(paymentMethod: string, callbackData: Record<string, unknown>) {
    switch (paymentMethod) {
      case 'momo':
        return this.momoPayment.handleWebhook(
          callbackData as unknown as Parameters<typeof this.momoPayment.handleWebhook>[0]
        )
      case 'vnpay':
        return this.vnpayPayment.verifyReturnUrl(
          callbackData as Parameters<typeof this.vnpayPayment.verifyReturnUrl>[0]
        )
      case 'zalopay':
        return this.zalopayPayment.handleCallback(
          callbackData as unknown as Parameters<typeof this.zalopayPayment.handleCallback>[0]
        )
      default:
        throw new ValidationError('Invalid payment method')
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId?: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: true,
            serviceTier: {
              include: { service: true }
            }
          }
        }
      }
    })

    if (!payment) {
      throw new NotFoundError('Payment')
    }

    // Check ownership if userId provided
    if (userId && payment.booking.userId !== userId) {
      throw new ValidationError('Unauthorized access to payment')
    }

    return payment
  }

  /**
   * Get user payments
   */
  async getUserPayments(
    userId: string,
    options?: {
      status?: string
      limit?: number
      offset?: number
    }
  ) {
    interface PaymentWhereInput {
      booking: { userId: string }
      status?: string
    }

    const where: PaymentWhereInput = {
      booking: { userId }
    }

    if (options?.status) {
      where.status = options.status
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            include: {
              serviceTier: {
                include: { service: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 10,
        skip: options?.offset ?? 0
      }),
      prisma.payment.count({ where })
    ])

    return { payments, total }
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentId: string,
    data: {
      amount: number
      reason: string
      adminId: string
    }
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId)

    // Validate refund
    if (payment.status !== 'completed') {
      throw new ValidationError('Only completed payments can be refunded')
    }

    if (payment.refundAmount && Number(payment.refundAmount) > 0) {
      throw new ValidationError('Payment already has refunds')
    }

    // Process refund based on payment method
    let refundResult
    switch (payment.paymentMethod) {
      case 'momo':
        refundResult = await this.momoPayment.refundPayment(
          payment.gatewayTransactionId!,
          data.amount,
          data.reason || 'Customer refund request'
        )
        break
      case 'vnpay':
        refundResult = await this.vnpayPayment.refundPayment(
          payment.gatewayTransactionId!,
          data.amount,
          new Date().toISOString().slice(0, 8).replace(/-/g, ''),
          data.reason || 'Customer refund request'
        )
        break
      default:
        throw new ValidationError('Refund not supported for this payment method')
    }

    if (!refundResult.success) {
      throw new PaymentError('Refund failed: ' + refundResult.error)
    }

    // Update payment record
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        refundAmount: data.amount,
        refundedAt: new Date(),
        refundReason: data.reason,
        status: 'refunded'
      }
    })

    this.logger.info('Payment refunded', {
      paymentId,
      amount: data.amount,
      adminId: data.adminId
    })

    return updated
  }

  /**
   * Private helper methods
   */
  private async validateBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        serviceTier: {
          include: { service: true }
        }
      }
    })

    if (!booking) {
      throw new NotFoundError('Booking')
    }

    if (booking.userId !== userId) {
      throw new ValidationError('Unauthorized access to booking')
    }

    if (booking.paymentStatus === 'completed') {
      throw new ValidationError('Booking already paid')
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      throw new ValidationError('Cannot create payment for this booking')
    }

    return booking
  }

  private async checkExistingPayment(bookingId: string): Promise<boolean> {
    const count = await prisma.payment.count({
      where: {
        bookingId,
        status: { in: ['pending', 'processing'] }
      }
    })

    return count > 0
  }

  private generatePaymentNumber(): string {
    return generateSecurePaymentRef('PAY')
  }

  private async processPayment(options: {
    payment: Payment
    booking: Booking
    paymentMethod: string
    returnUrl?: string
  }) {
    const { payment, booking, paymentMethod, returnUrl } = options

    switch (paymentMethod) {
      case 'momo':
        return this.momoPayment.createPayment({
          bookingId: booking.id,
          amount: typeof payment.amount === 'number' ? payment.amount : payment.amount.toNumber(),
          orderInfo: `Payment for ${booking.bookingNumber}`,
          redirectUrl: returnUrl
        })

      case 'vnpay':
        return this.vnpayPayment.createPaymentUrl({
          bookingId: booking.id,
          amount: typeof payment.amount === 'number' ? payment.amount : payment.amount.toNumber(),
          orderInfo: `Payment for booking ${booking.bookingNumber}`,
          returnUrl: returnUrl ?? `${process.env.NEXT_PUBLIC_SITE_URL}/payment/callback`
        })

      case 'zalopay':
        return this.zalopayPayment.createOrder({
          bookingId: booking.id,
          amount: typeof payment.amount === 'number' ? payment.amount : payment.amount.toNumber(),
          description: `Payment for ${booking.bookingNumber}`,
          callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/zalopay/callback`
        })

      case 'banking':
        return this.bankingTransfer.createTransferOrder({
          bookingId: booking.id,
          amount: typeof payment.amount === 'number' ? payment.amount : payment.amount.toNumber(),
          customerName: booking.user.fullName,
          customerEmail: booking.user.email,
          customerPhone: booking.user.phone ?? undefined
        })

      default:
        throw new ValidationError('Invalid payment method')
    }
  }

  private async updatePaymentStatus(
    paymentId: string,
    status: string,
    data?: {
      failureReason?: string
      gatewayResponse?: Record<string, unknown>
    }
  ) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        failureReason: data?.failureReason,
        gatewayResponse: data?.gatewayResponse as Parameters<
          typeof prisma.payment.update
        >[0]['data']['gatewayResponse']
      }
    })
  }
}
