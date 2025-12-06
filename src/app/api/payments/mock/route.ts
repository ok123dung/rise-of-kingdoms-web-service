import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { getLogger } from '@/lib/monitoring/logger'

interface MockPaymentBody {
  booking_id: string
  amount: number
  method: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MockPaymentBody
    const { booking_id, amount, method } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Start transaction
    const result = await prisma.$transaction(async tx => {
      // 1. Create Payment record
      const payment = await tx.payments.create({
        data: {
          booking_id,
          payment_number: `PAY-${Date.now()}`,
          amount,
          currency: 'VND',
          payment_method: method,
          payment_gateway: 'MOCK_GATEWAY',
          status: 'completed',
          gateway_transaction_id: `MOCK-${Date.now()}`,
          paid_at: new Date()
        }
      })

      // 2. Update Booking status
      const booking = await tx.bookings.update({
        where: { id: booking_id },
        data: {
          status: 'confirmed',
          payment_status: 'completed',
          updated_at: new Date()
        }
      })

      return { payment, booking }
    })

    // Fetch booking details with user and service for email
    const booking_details = await prisma.bookings.findUnique({
      where: { id: booking_id },
      include: {
        user: true,
        service_tiers: {
          include: { services: true }
        }
      }
    })

    if (booking_details) {
      sendOrderConfirmationEmail(booking_details.users.email, booking_details.users.full_name, {
        orderNumber: booking_details.booking_number,
        serviceName: booking_details.service_tiers.services.name,
        amount: Number(amount),
        currency: 'VND',
        payment_method: method
      }).catch((err: unknown) =>
        getLogger().error(
          'Failed to send order confirmation email',
          err instanceof Error ? err : new Error(String(err))
        )
      )
    }

    getLogger().info(`Mock payment successful for booking ${booking_id}`, {
      payment_id: result.payments.id,
      amount
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    getLogger().error('Mock payment failed', error as Error)
    return NextResponse.json({ success: false, error: 'Payment failed' }, { status: 500 })
  }
}
