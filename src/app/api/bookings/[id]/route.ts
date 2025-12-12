import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getCurrentUser, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const updateBookingSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'])
    .optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  internal_notes: z.string().optional()
})

interface UpdateBookingRequest {
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded'
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
  internal_notes?: string
}

// Note: params is async in Next.js 16+
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Check auth
    const user = await getCurrentUser()
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = (await request.json()) as UpdateBookingRequest
    const data = updateBookingSchema.parse(body)

    const booking = await prisma.bookings.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    })

    // Log activity
    getLogger().info(`Booking ${booking.booking_number} updated by ${user?.email}`, {
      booking_id: booking.id,
      updates: JSON.stringify(data)
    })

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    getLogger().error('Failed to update booking', error as Error)
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: {
        users: true,
        service_tiers: {
          include: { services: true }
        },
        payments: true,
        leads: true
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
