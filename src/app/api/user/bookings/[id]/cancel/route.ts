import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const booking_id = params.id

    // Find the booking
    const booking = await prisma.bookings.findUnique({
      where: {
        id: booking_id
      }
    })

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
    }

    // Verify ownership
    if (booking.user_id !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Check if cancellable (only pending bookings can be cancelled by user)
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Only pending bookings can be cancelled' },
        { status: 400 }
      )
    }

    // Cancel the booking
    const updatedBooking = await prisma.bookings.update({
      where: {
        id: booking_id
      },
      data: {
        status: 'cancelled',
        updated_at: new Date()
      }
    })

    getLogger().info('Booking cancelled by user', {
      booking_id,
      user_id: session.user.id
    })

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    })
  } catch (error) {
    getLogger().error('Error cancelling booking', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
