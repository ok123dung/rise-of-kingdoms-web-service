import { prisma } from '@/lib/db'
import { BookingStatus, PaymentStatus } from '@/types/enums'

export class DashboardService {
  async getCustomerDashboardData(userId: string) {
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
      prisma.booking.count({ where: { userId } }),
      prisma.booking.count({
        where: {
          userId,
          status: { in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS, BookingStatus.PAUSED] }
        }
      }),
      prisma.booking.count({
        where: {
          userId,
          status: BookingStatus.COMPLETED
        }
      }),
      prisma.payment.findMany({
        where: {
          booking: { userId },
          status: PaymentStatus.COMPLETED
        },
        select: { amount: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
      }),
      prisma.booking.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      prisma.payment.findFirst({
        where: { booking: { userId }, status: PaymentStatus.COMPLETED },
        orderBy: { paidAt: 'desc' },
        select: { paidAt: true }
      }),
      prisma.booking.findFirst({
        where: {
          userId,
          status: BookingStatus.PENDING,
          startDate: { gte: new Date() }
        },
        orderBy: { startDate: 'asc' },
        select: { startDate: true }
      }),
      prisma.booking.findMany({
        where: {
          userId,
          status: { in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS, BookingStatus.PAUSED] }
        },
        include: {
          serviceTier: {
            include: {
              service: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.findMany({
        where: {
          booking: { userId }
        },
        include: {
          booking: {
            include: {
              serviceTier: {
                include: {
                  service: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
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
      memberSince: user?.createdAt.toISOString() ?? new Date().toISOString(),
      nextTierThreshold: 20000000,
      currentTierProgress: Math.min((totalSpent / 20000000) * 100, 100),
      recentActivity: {
        lastBooking: lastBooking?.createdAt.toISOString() ?? null,
        lastPayment: lastPayment?.paidAt?.toISOString() ?? null,
        upcomingService: upcomingBooking?.startDate?.toISOString() ?? null
      }
    }

    const activeBookings = activeBookingsData.map(booking => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      serviceName: booking.serviceTier.service.name,
      tierName: booking.serviceTier.name,
      status: booking.status,
      startDate: booking.startDate?.toISOString() ?? null,
      endDate: booking.endDate?.toISOString() ?? null,
      progress: booking.completionPercentage,
      nextSession: undefined,
      assignedStaff: null
    }))

    const recentPayments = recentPaymentsData.map(payment => ({
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      bookingId: payment.bookingId,
      serviceName: payment.booking.serviceTier.service.name,
      amount: Number(payment.amount),
      status: payment.status,
      method: payment.paymentMethod,
      createdAt: payment.createdAt.toISOString(),
      paidAt: payment.paidAt?.toISOString() ?? null
    }))

    // 4. Fetch Recommendations
    const activeServiceIds = activeBookingsData.map(b => b.serviceTier.serviceId)

    const recommendedServices = await prisma.service.findMany({
      where: {
        isActive: true,
        id: { notIn: activeServiceIds }
      },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      include: {
        serviceTiers: {
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      take: 3
    })

    let finalRecommendations = recommendedServices
    if (finalRecommendations.length < 3) {
      const fallbackServices = await prisma.service.findMany({
        where: {
          isActive: true,
          id: { notIn: finalRecommendations.map(s => s.id) }
        },
        include: {
          serviceTiers: {
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
      description: service.shortDescription ?? service.description,
      basePrice: Number(service.basePrice),
      originalPrice: null,
      discount: 0,
      category: service.category,
      rating: 5.0,
      reviewCount: 0,
      isPopular: false,
      isFeatured: service.isFeatured,
      recommendationReason: service.isFeatured ? 'featured' : 'suggested',
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
