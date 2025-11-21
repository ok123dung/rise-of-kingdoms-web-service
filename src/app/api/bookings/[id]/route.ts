import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const updateBookingSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'])
    .optional(),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  internalNotes: z.string().optional()
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check auth
    const user = await getCurrentUser()
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateBookingSchema.parse(body)

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    // Log activity
    getLogger().info(`Booking ${booking.bookingNumber} updated by ${user?.email}`, {
      bookingId: booking.id,
      updates: JSON.stringify(data)
    })

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    getLogger().error('Failed to update booking', error as Error)
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        serviceTier: {
          include: { service: true }
        },
        payments: true,
        convertedLead: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch booking' }, { status: 500 })
  }
}
