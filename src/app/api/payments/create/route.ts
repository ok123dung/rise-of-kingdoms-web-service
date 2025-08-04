import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRateLimit, getCurrentSession, getCurrentUser, isStaff } from '@/lib/auth'
import { db, prisma } from '@/lib/db'
import { MoMoPayment } from '@/lib/payments/momo'
import { ZaloPayPayment } from '@/lib/payments/zalopay'
import { VNPayPayment } from '@/lib/payments/vnpay'
import { BankingTransfer } from '@/lib/payments/banking'

const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentMethod: z.enum(['momo', 'zalopay', 'vnpay', 'banking'], {
    errorMap: () => ({ message: 'Invalid payment method' })
  }),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})

async function createPaymentHandler(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)
    
    // Verify booking exists and belongs to user
    const booking = await db.booking.findById(validatedData.bookingId)
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }

    // Check if user owns this booking (unless admin)
    const session = await getCurrentSession()
    if (booking.userId !== session?.user?.id && !await isStaff()) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access to booking'
      }, { status: 403 })
    }

    // Check if booking is in valid state for payment
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json({
        success: false,
        error: 'Booking is not in valid state for payment'
      }, { status: 400 })
    }

    // Check if payment already exists and is pending/completed
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId: validatedData.bookingId,
        status: { in: ['pending', 'completed'] }
      }
    })

    if (existingPayment) {
      return NextResponse.json({
        success: false,
        error: 'Payment already exists for this booking'
      }, { status: 400 })
    }

    const amount = Math.round(Number(booking.finalAmount.toString()))
    const orderInfo = `Thanh toán dịch vụ ${booking.serviceTier.service.name} - ${booking.serviceTier.name}`

    let paymentResult: any

    switch (validatedData.paymentMethod) {
      case 'momo':
        const momoPayment = new MoMoPayment()
        paymentResult = await momoPayment.createPayment({
          bookingId: validatedData.bookingId,
          amount,
          orderInfo,
          redirectUrl: validatedData.returnUrl,
          ipnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/webhook`
        })
        break

      case 'zalopay':
        const zaloPayment = new ZaloPayPayment()
        paymentResult = await zaloPayment.createOrder({
          bookingId: validatedData.bookingId,
          amount,
          description: orderInfo,
          callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/zalopay/callback`
        })
        break

      case 'vnpay':
        const vnpayInstance = new VNPayPayment()
        paymentResult = await vnpayInstance.createPaymentUrl({
          bookingId: booking.id,
          amount: amount,
          orderInfo: orderInfo,
          returnUrl: `${process.env.NEXTAUTH_URL}/api/payments/vnpay/return`
        })
        break

      case 'banking':
        // For banking, create payment record and send instructions
        const bankingInstance = new BankingTransfer()
        paymentResult = await bankingInstance.createTransferOrder({
          bookingId: booking.id,
          amount: amount,
          customerName: booking.user.fullName,
          customerEmail: booking.user.email,
          customerPhone: booking.user.phone || undefined
        })
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Unsupported payment method'
        }, { status: 400 })
    }

    if (!paymentResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payment creation failed',
        details: paymentResult.error
      }, { status: 500 })
    }

    // Return payment URL for redirect
    const paymentUrl = paymentResult.data?.payUrl || paymentResult.data?.order_url
    
    return NextResponse.json({
      success: true,
      data: {
        paymentUrl,
        paymentMethod: validatedData.paymentMethod,
        amount,
        orderId: paymentResult.data?.orderId || paymentResult.data?.app_trans_id,
        bookingId: validatedData.bookingId
      },
      message: 'Payment created successfully'
    })

  } catch (error) {
    console.error('Payment creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Apply middleware
export const POST = withRateLimit()(withAuth(createPaymentHandler))
