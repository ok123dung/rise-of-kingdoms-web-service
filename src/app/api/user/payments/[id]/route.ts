import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

// Note: params is async in Next.js 16+
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const payment = await prisma.payments.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            users: true,
            service_tiers: {
              include: {
                services: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 })
    }

    // Check if payment belongs to user
    if (payment.bookings?.user_id !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    getLogger().error('Error fetching payment detail', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}
