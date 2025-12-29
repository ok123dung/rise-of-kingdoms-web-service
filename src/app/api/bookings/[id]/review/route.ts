import { type NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface ReviewBody {
  rating: number
  feedback?: string
}

// POST - Submit a review for a completed booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json() as ReviewBody

    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Find booking and verify ownership
    const booking = await prisma.bookings.findUnique({
      where: { id },
      include: {
        service_tiers: {
          include: { services: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow reviews for completed bookings
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed bookings' },
        { status: 400 }
      )
    }

    // Check if already reviewed
    if (booking.customer_rating !== null) {
      return NextResponse.json(
        { error: 'Booking already reviewed' },
        { status: 400 }
      )
    }

    // Update booking with review
    const updated = await prisma.bookings.update({
      where: { id },
      data: {
        customer_rating: body.rating,
        customer_feedback: body.feedback ?? null,
        updated_at: new Date()
      }
    })

    getLogger().info('Review submitted', {
      booking_id: id,
      rating: body.rating,
      user_id: user.id
    })

    return NextResponse.json({
      success: true,
      review: {
        rating: updated.customer_rating,
        feedback: updated.customer_feedback
      }
    })
  } catch (error) {
    getLogger().error('Review submission error', error as Error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

// GET - Get review for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.bookings.findUnique({
      where: { id },
      select: {
        id: true,
        customer_rating: true,
        customer_feedback: true,
        status: true,
        user_id: true,
        service_tiers: {
          select: {
            name: true,
            services: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Allow owner or admin to view
    const isAdmin = user.staff?.role === 'admin' || user.staff?.role === 'superadmin'
    if (booking.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      review: booking.customer_rating ? {
        rating: booking.customer_rating,
        feedback: booking.customer_feedback,
        serviceName: booking.service_tiers?.services?.name,
        tierName: booking.service_tiers?.name
      } : null,
      canReview: booking.status === 'completed' && booking.customer_rating === null
    })
  } catch (error) {
    getLogger().error('Get review error', error as Error)
    return NextResponse.json(
      { error: 'Failed to get review' },
      { status: 500 }
    )
  }
}
