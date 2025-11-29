import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        serviceTier: {
          include: {
            service: true
          }
        },
        payments: true
      }
    })

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
    }

    // Check if booking belongs to user
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      booking
    })
  } catch (error) {
    getLogger().error('Error fetching booking detail', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
