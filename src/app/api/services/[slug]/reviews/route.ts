import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

// GET - Get all public reviews for a service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    // Find service by slug
    const service = await prisma.services.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Get reviews for this service (from completed bookings with ratings)
    const reviews = await prisma.bookings.findMany({
      where: {
        service_tiers: {
          service_id: service.id
        },
        status: 'completed',
        customer_rating: { not: null }
      },
      select: {
        id: true,
        customer_rating: true,
        customer_feedback: true,
        created_at: true,
        users: {
          select: {
            full_name: true,
            image: true
          }
        },
        service_tiers: {
          select: {
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset
    })

    // Get aggregate stats
    const stats = await prisma.bookings.aggregate({
      where: {
        service_tiers: {
          service_id: service.id
        },
        status: 'completed',
        customer_rating: { not: null }
      },
      _avg: { customer_rating: true },
      _count: { customer_rating: true }
    })

    // Get rating distribution
    const distribution = await prisma.bookings.groupBy({
      by: ['customer_rating'],
      where: {
        service_tiers: {
          service_id: service.id
        },
        status: 'completed',
        customer_rating: { not: null }
      },
      _count: { customer_rating: true }
    })

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    distribution.forEach(d => {
      if (d.customer_rating !== null) {
        ratingDistribution[d.customer_rating] = d._count.customer_rating
      }
    })

    return NextResponse.json({
      success: true,
      service: { name: service.name },
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.customer_rating,
        feedback: r.customer_feedback,
        date: r.created_at,
        customerName: r.users?.full_name?.split(' ')[0] + ' ***', // Partial name for privacy
        tierName: r.service_tiers?.name
      })),
      stats: {
        averageRating: stats._avg.customer_rating ?? 0,
        totalReviews: stats._count.customer_rating,
        distribution: ratingDistribution
      },
      pagination: {
        limit,
        offset,
        hasMore: reviews.length === limit
      }
    })
  } catch (error) {
    console.error('Get service reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    )
  }
}
