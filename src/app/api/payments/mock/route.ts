import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { bookingId, amount, method } = body

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Payment record
            const payment = await tx.payment.create({
                data: {
                    bookingId,
                    paymentNumber: `PAY-${Date.now()}`,
                    amount,
                    currency: 'VND',
                    paymentMethod: method,
                    paymentGateway: 'MOCK_GATEWAY',
                    status: 'completed',
                    gatewayTransactionId: `MOCK-${Date.now()}`,
                    paidAt: new Date()
                }
            })

            // 2. Update Booking status
            const booking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'confirmed',
                    paymentStatus: 'completed',
                    updatedAt: new Date()
                }
            })

            return { payment, booking }
        })

        // Fetch booking details with user and service for email
        const bookingDetails = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                serviceTier: {
                    include: { service: true }
                }
            }
        })

        if (bookingDetails) {
            sendOrderConfirmationEmail(
                bookingDetails.user.email,
                bookingDetails.user.fullName,
                {
                    orderNumber: bookingDetails.bookingNumber,
                    serviceName: bookingDetails.serviceTier.service.name,
                    amount: Number(amount),
                    currency: 'VND',
                    paymentMethod: method
                }
            ).catch(err => getLogger().error('Failed to send order confirmation email', err))
        }

        getLogger().info(`Mock payment successful for booking ${bookingId}`, {
            paymentId: result.payment.id,
            amount
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        getLogger().error('Mock payment failed', error as Error)
        return NextResponse.json(
            { success: false, error: 'Payment failed' },
            { status: 500 }
        )
    }
}
