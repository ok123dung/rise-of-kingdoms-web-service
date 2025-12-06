import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth, withRateLimit, getCurrentSession, isStaff } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  PaymentError,
  handleApiError,
  ErrorMessages
} from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { BankingTransfer } from '@/lib/payments/banking'
import { MoMoPayment } from '@/lib/payments/momo'
import { VNPayPayment } from '@/lib/payments/vnpay'
import { ZaloPayPayment } from '@/lib/payments/zalopay'

const createPaymentSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  payment_method: z.enum(['momo', 'zalopay', 'vnpay', 'banking'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})

interface CreatePaymentBody {
  booking_id: string
  payment_method: string
  returnUrl?: string
  cancelUrl?: string
}

async function createPaymentHandler(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePaymentBody

    // Validate request data
    let validatedData
    try {
      validatedData = createPaymentSchema.parse(body)
    } catch (error) {
      throw new ValidationError('Invalid payment request data')
    }

    // Get session info first
    const session = await getCurrentSession()
    const userIsStaff = await isStaff()

    // Verify booking exists with all needed relations in a single query (fix N+1)
    const booking = await prisma.bookings.findUnique({
      where: { id: validatedData.booking_id },
      include: {
        user: true,
        service_tiers: {
          include: {
            service: true
          }
        },
        payments: {
          where: {
            status: { in: ['pending', 'completed'] }
          },
          select: { id: true, status: true }
        }
      }
    })

    if (!booking) {
      throw new NotFoundError('Booking')
    }

    // Check if user owns this booking (unless admin)
    if (booking.user_id !== session?.user?.id && !userIsStaff) {
      throw new AuthorizationError('You do not have access to this booking')
    }

    // Check if booking is in valid state for payment
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      throw new PaymentError('Booking is not in valid state for payment')
    }

    // Check if payment already exists (now included in the booking query)
    if (booking.payments && booking.payments.length > 0) {
      throw new PaymentError('Payment already exists for this booking')
    }

    const amount = Math.round(Number(booking.final_amount.toString()))
    const orderInfo = `Thanh toán dịch vụ ${booking.service_tiers.services.name} - ${booking.service_tiers.name}`

    // Log payment attempt
    getLogger().info('Creating payment', {
      booking_id: validatedData.booking_id,
      payment_method: validatedData.payment_method,
      amount,
      user_id: session?.user?.id
    })

    interface PaymentResult {
      success: boolean
      error?: string
      data?: {
        payUrl?: string
        order_url?: string
        orderId?: string
        app_trans_id?: string
        // Banking transfer fields
        transferCode?: string
        bankAccounts?: Array<{
          bankName: string
          accountNumber: string
          accountName: string
        }>
        amount?: number
        transferContent?: string
        expireTime?: Date
      }
    }

    let paymentResult: PaymentResult

    switch (validatedData.payment_method) {
      case 'momo': {
        const momoPayment = new MoMoPayment()
        paymentResult = await momoPayment.createPayment({
          booking_id: validatedData.booking_id,
          amount,
          orderInfo,
          redirectUrl: validatedData.returnUrl,
          ipnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/webhook`
        })
        break
      }

      case 'zalopay': {
        const zaloPayment = new ZaloPayPayment()
        paymentResult = await zaloPayment.createOrder({
          booking_id: validatedData.booking_id,
          amount,
          description: orderInfo,
          callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/zalopay/callback`
        })
        break
      }

      case 'vnpay': {
        const vnpayInstance = new VNPayPayment()
        paymentResult = await vnpayInstance.createPaymentUrl({
          booking_id: booking.id,
          amount: amount,
          orderInfo: orderInfo,
          returnUrl: `${process.env.NEXTAUTH_URL}/api/payments/vnpay/return`
        })
        break
      }

      case 'banking': {
        // For banking, create payment record and send instructions
        const bankingInstance = new BankingTransfer()
        paymentResult = await bankingInstance.createTransferOrder({
          booking_id: booking.id,
          amount: amount,
          customerName: booking.users.full_name,
          customerEmail: booking.users.email,
          customerPhone: booking.users.phone ?? undefined
        })
        break
      }

      default:
        throw new ValidationError('Unsupported payment method')
    }

    if (!paymentResult.success) {
      throw new PaymentError(paymentResult.error ?? ErrorMessages.PAYMENT_FAILED, {
        payment_method: validatedData.payment_method
      })
    }

    // Return payment URL for redirect
    const paymentUrl = paymentResult.data?.payUrl ?? paymentResult.data?.order_url

    getLogger().info('Payment created successfully', {
      booking_id: validatedData.booking_id,
      payment_method: validatedData.payment_method,
      orderId: paymentResult.data?.orderId ?? paymentResult.data?.app_trans_id
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl,
        payment_method: validatedData.payment_method,
        amount,
        orderId: paymentResult.data?.orderId ?? paymentResult.data?.app_trans_id,
        booking_id: validatedData.booking_id
      },
      message: 'Payment created successfully'
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

// Apply middleware
export const POST = withRateLimit()(withAuth(createPaymentHandler))
