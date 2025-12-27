import { NextRequest, NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface DateRange {
  start: Date
  end: Date
}

function getDateRange(period: string): DateRange {
  const now = new Date()
  let start: Date

  switch (period) {
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      break
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  return { start, end: now }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user?.staff || (user.staff.role !== 'admin' && user.staff.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const { start, end } = getDateRange(period)

    // Revenue Analytics
    const revenueData = await prisma.payments.aggregate({
      where: {
        status: 'completed',
        created_at: { gte: start, lte: end }
      },
      _sum: { amount: true },
      _count: { id: true }
    })

    // Previous period for comparison
    const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()))
    const prevRevenueData = await prisma.payments.aggregate({
      where: {
        status: 'completed',
        created_at: { gte: prevStart, lt: start }
      },
      _sum: { amount: true }
    })

    const currentRevenue = Number(revenueData._sum.amount ?? 0)
    const prevRevenue = Number(prevRevenueData._sum.amount ?? 0)
    const revenueGrowth = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : currentRevenue > 0 ? 100 : 0

    // Booking Analytics
    const bookingStats = await prisma.bookings.groupBy({
      by: ['status'],
      where: {
        created_at: { gte: start, lte: end }
      },
      _count: { id: true }
    })

    const totalBookings = bookingStats.reduce((sum, s) => sum + s._count.id, 0)
    const completedBookings = bookingStats.find(s => s.status === 'completed')?._count.id ?? 0
    const pendingBookings = bookingStats.find(s => s.status === 'pending')?._count.id ?? 0
    const inProgressBookings = bookingStats.find(s => s.status === 'in_progress')?._count.id ?? 0

    // Customer Analytics
    const newCustomers = await prisma.users.count({
      where: {
        created_at: { gte: start, lte: end },
        staff: { is: null }
      }
    })

    const activeCustomers = await prisma.bookings.groupBy({
      by: ['user_id'],
      where: {
        created_at: { gte: start, lte: end }
      }
    })

    // Payment Method Distribution
    const paymentMethods = await prisma.payments.groupBy({
      by: ['payment_method'],
      where: {
        status: 'completed',
        created_at: { gte: start, lte: end }
      },
      _sum: { amount: true },
      _count: { id: true }
    })

    // Daily Revenue Trend
    const dailyRevenue = await prisma.$queryRaw<Array<{ date: Date; revenue: number; count: number }>>`
      SELECT
        DATE(created_at) as date,
        SUM(CAST(amount AS DECIMAL(12,2))) as revenue,
        COUNT(*) as count
      FROM payments
      WHERE status = 'completed'
        AND created_at >= ${start}
        AND created_at <= ${end}
      GROUP BY DATE(created_at)
      ORDER BY date
    `

    // Top Services
    const topServices = await prisma.bookings.groupBy({
      by: ['service_tier_id'],
      where: {
        created_at: { gte: start, lte: end },
        payment_status: 'completed'
      },
      _count: { id: true },
      _sum: { total_amount: true },
      orderBy: { _sum: { total_amount: 'desc' } },
      take: 5
    })

    const serviceTierIds = topServices.map(s => s.service_tier_id)
    const serviceTiers = await prisma.service_tiers.findMany({
      where: { id: { in: serviceTierIds } },
      include: { services: true }
    })

    // Average Order Value
    const avgOrderValue = totalBookings > 0 ? currentRevenue / totalBookings : 0

    // Customer Retention
    const repeatCustomers = await prisma.bookings.groupBy({
      by: ['user_id'],
      where: {
        created_at: { gte: start, lte: end }
      },
      _count: { id: true },
      having: {
        id: { _count: { gt: 1 } }
      }
    })

    // Review Stats
    const reviewStats = await prisma.bookings.aggregate({
      where: {
        customer_rating: { not: null },
        created_at: { gte: start, lte: end }
      },
      _avg: { customer_rating: true },
      _count: { customer_rating: true }
    })

    return NextResponse.json({
      success: true,
      period,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      metrics: {
        revenue: {
          total: currentRevenue,
          previous: prevRevenue,
          growth: revenueGrowth,
          transactionCount: revenueData._count.id
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          inProgress: inProgressBookings,
          completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
        },
        customers: {
          new: newCustomers,
          active: activeCustomers.length,
          repeat: repeatCustomers.length,
          retentionRate: activeCustomers.length > 0
            ? (repeatCustomers.length / activeCustomers.length) * 100
            : 0
        },
        orders: {
          averageValue: avgOrderValue
        },
        reviews: {
          averageRating: reviewStats._avg.customer_rating ?? 0,
          totalReviews: reviewStats._count.customer_rating
        }
      },
      charts: {
        dailyRevenue: dailyRevenue.map(d => ({
          date: d.date,
          revenue: Number(d.revenue),
          count: Number(d.count)
        })),
        paymentMethods: paymentMethods.map(p => ({
          method: p.payment_method,
          amount: Number(p._sum.amount),
          count: p._count.id
        })),
        topServices: topServices.map(s => {
          const tier = serviceTiers.find(t => t.id === s.service_tier_id)
          return {
            name: tier ? `${tier.services.name} - ${tier.name}` : 'Unknown',
            bookings: s._count.id,
            revenue: Number(s._sum.total_amount)
          }
        })
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
