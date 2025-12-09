import { prisma } from '@/lib/db'
import { BookingStatus, PaymentStatus } from '@/types/enums'

export class DashboardService {
  async getCustomerDashboardData(user_id: string) {
    // 1. Fetch User Stats & Data in Parallel
    const [
      totalBookings,
      activeServices,
      completedServices,
      payments,
      user,
      lastBooking,
      lastPayment,
      upcomingBooking,
      activeBookingsData,
      recentPaymentsData
    ] = await Promise.all([
      prisma.bookings.count({ where: { user_id } }),
      prisma.bookings.count({
        where: {
          user_id,
          status: { in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS, BookingStatus.PAUSED] }
        }
      }),
      prisma.bookings.count({
        where: {
          user_id,
          status: BookingStatus.COMPLETED
        }
      }),
      prisma.payments.findMany({
        where: { bookings: { user_id }, status: PaymentStatus.COMPLETED },
        select: { amount: true }
      }),
      prisma.users.findUnique({
        where: { id: user_id },
        select: { created_at: true }
      }),
      prisma.bookings.findFirst({
        where: { user_id },
        orderBy: { created_at: 'desc' },
        select: { created_at: true }
      }),
      prisma.payments.findFirst({
        where: { bookings: { user_id }, status: PaymentStatus.COMPLETED },
        orderBy: { paid_at: 'desc' },
        select: { paid_at: true }
      }),
      prisma.bookings.findFirst({
        where: {
          user_id,
          status: BookingStatus.PENDING,
          start_date: { gte: new Date() }
        },
        orderBy: { start_date: 'asc' },
        select: { start_date: true }
      }),
      prisma.bookings.findMany({
        where: {
          user_id,
          status: { in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS, BookingStatus.PAUSED] }
        },
        include: {
          service_tiers: {
            include: { services: true }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.payments.findMany({
        where: { bookings: { user_id } },
        include: {
          bookings: {
            include: {
              service_tiers: {
                include: { services: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      })
    ])

    const totalSpent = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

    const stats = {
      totalBookings,
      totalSpent,
      activeServices,
      completedServices,
      averageRating: 5.0,
      memberSince: user?.created_at.toISOString() ?? new Date().toISOString(),
      nextTierThreshold: 20000000,
      currentTierProgress: Math.min((totalSpent / 20000000) * 100, 100),
      recentActivity: {
        lastBooking: lastBooking?.created_at.toISOString() ?? null,
        lastPayment: lastPayment?.paid_at?.toISOString() ?? null,
        upcomingService: upcomingBooking?.start_date?.toISOString() ?? null
      }
    }

    const activeBookings = activeBookingsData.map(booking => ({
      id: booking.id,
      booking_number: booking.booking_number,
      serviceName: booking.service_tiers.services.name,
      tierName: booking.service_tiers.name,
      status: booking.status,
      start_date: booking.start_date?.toISOString() ?? null,
      end_date: booking.end_date?.toISOString() ?? null,
      progress: booking.completion_percentage,
      nextSession: undefined,
      assignedStaff: null
    }))

    const recentPayments = recentPaymentsData.map(payment => ({
      id: payment.id,
      payment_number: payment.payment_number,
      booking_id: payment.booking_id,
      serviceName: payment.bookings.service_tiers.services.name,
      amount: Number(payment.amount),
      status: payment.status,
      method: payment.payment_method,
      created_at: payment.created_at.toISOString(),
      paid_at: payment.paid_at?.toISOString() ?? null
    }))

    // 4. Fetch Recommendations
    const activeServiceIds = activeBookingsData.map(b => b.service_tiers.service_id)

    const recommendedServices = await prisma.services.findMany({
      where: {
        is_active: true,
        id: { notIn: activeServiceIds }
      },
      orderBy: [{ is_featured: 'desc' }, { name: 'asc' }],
      include: {
        service_tiers: {
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      take: 3
    })

    let finalRecommendations = recommendedServices
    if (finalRecommendations.length < 3) {
      const fallbackServices = await prisma.services.findMany({
        where: {
          is_active: true,
          id: { notIn: finalRecommendations.map(s => s.id) }
        },
        include: {
          service_tiers: {
            orderBy: { price: 'asc' },
            take: 1
          }
        },
        take: 3 - finalRecommendations.length
      })
      finalRecommendations = [...finalRecommendations, ...fallbackServices]
    }

    const recommendations = finalRecommendations.map(service => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.short_description ?? service.description,
      base_price: Number(service.base_price),
      original_price: null,
      discount: 0,
      category: service.category,
      rating: 5.0,
      reviewCount: 0,
      is_popular: false,
      is_featured: service.is_featured,
      recommendationReason: service.is_featured ? 'featured' : 'suggested',
      estimatedDuration: 'N/A'
    }))

    return {
      stats,
      activeBookings,
      recentPayments,
      recommendations
    }
  }
}

export const dashboardService = new DashboardService()
