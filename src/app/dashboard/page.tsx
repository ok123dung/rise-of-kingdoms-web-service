import { Suspense } from 'react'

import { redirect } from 'next/navigation'

import ActiveBookings from '@/components/customer/ActiveBookings'
import CustomerStats from '@/components/customer/CustomerStats'
import RecentPayments from '@/components/customer/RecentPayments'
import ServiceRecommendations from '@/components/customer/ServiceRecommendations'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getDashboardData(userId: string) {
  // 1. Fetch User Stats
  const totalBookings = await prisma.booking.count({
    where: { userId }
  })

  const activeServices = await prisma.booking.count({
    where: {
      userId,
      status: { in: ['pending', 'in_progress', 'paused'] }
    }
  })

  const completedServices = await prisma.booking.count({
    where: {
      userId,
      status: 'completed'
    }
  })

  // Calculate total spent (sum of completed payments)
  const payments = await prisma.payment.findMany({
    where: {
      booking: { userId },
      status: 'completed'
    },
    select: { amount: true }
  })

  const totalSpent = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  // Fetch user creation date for "Member Since"
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true }
  })

  // Get last booking date
  const lastBooking = await prisma.booking.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  })

  // Get last payment date
  const lastPayment = await prisma.payment.findFirst({
    where: { booking: { userId }, status: 'completed' },
    orderBy: { paidAt: 'desc' },
    select: { paidAt: true }
  })

  // Get upcoming service (first active booking with start date in future or null)
  // For simplicity, let's just take the next session of an active booking if we had that field,
  // or just the start date of a pending booking.
  const upcomingBooking = await prisma.booking.findFirst({
    where: {
      userId,
      status: 'pending',
      startDate: { gte: new Date() }
    },
    orderBy: { startDate: 'asc' },
    select: { startDate: true }
  })

  const stats = {
    totalBookings,
    totalSpent,
    activeServices,
    completedServices,
    averageRating: 5.0, // Placeholder as we don't have rating system yet
    memberSince: user?.createdAt.toISOString() || new Date().toISOString(),
    nextTierThreshold: 20000000, // Hardcoded for now
    currentTierProgress: Math.min((totalSpent / 20000000) * 100, 100),
    recentActivity: {
      lastBooking: lastBooking?.createdAt.toISOString() || null,
      lastPayment: lastPayment?.paidAt?.toISOString() || null,
      upcomingService: upcomingBooking?.startDate?.toISOString() || null
    }
  }

  // 2. Fetch Active Bookings
  const activeBookingsData = await prisma.booking.findMany({
    where: {
      userId,
      status: { in: ['pending', 'in_progress', 'paused'] }
    },
    include: {
      serviceTier: {
        include: {
          service: true
        }
      }
      // assignedStaff: true // We don't have relation setup in schema properly yet for assignedStaff to User/Staff
    },
    orderBy: { createdAt: 'desc' }
  })

  const activeBookings = activeBookingsData.map(booking => ({
    id: booking.id,
    bookingNumber: booking.bookingNumber,
    serviceName: booking.serviceTier.service.name,
    tierName: booking.serviceTier.name,
    status: booking.status,
    startDate: booking.startDate?.toISOString() || null,
    endDate: booking.endDate?.toISOString() || null,
    progress: booking.completionPercentage,
    nextSession: undefined, // Not implemented yet
    assignedStaff: null // Not implemented yet
  }))

  // 3. Fetch Recent Payments
  const recentPaymentsData = await prisma.payment.findMany({
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

  const recentPayments = recentPaymentsData.map(payment => ({
    id: payment.id,
    paymentNumber: payment.paymentNumber,
    bookingId: payment.bookingId,
    serviceName: payment.booking.serviceTier.service.name,
    amount: Number(payment.amount),
    status: payment.status,
    method: payment.paymentMethod,
    createdAt: payment.createdAt.toISOString(),
    paidAt: payment.paidAt?.toISOString() || null
  }))

  // 4. Fetch Recommendations (Featured Services)
  // In a real app, this would be personalized. For now, just return featured services.
  const featuredServices = await prisma.service.findMany({
    where: {
      isActive: true,
      isFeatured: true
    },
    include: {
      serviceTiers: {
        orderBy: { price: 'asc' },
        take: 1
      }
    },
    take: 3
  })

  const recommendations = featuredServices.map(service => ({
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.shortDescription || service.description,
    basePrice: Number(service.basePrice),
    originalPrice: null, // Not in schema
    discount: 0,
    category: service.category,
    rating: 5.0, // Placeholder
    reviewCount: 0, // Placeholder
    isPopular: false,
    isFeatured: service.isFeatured,
    recommendationReason: 'popular', // Default reason
    estimatedDuration: 'N/A'
  }))

  return {
    stats,
    activeBookings,
    recentPayments,
    recommendations
  }
}

export default async function CustomerDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const data = await getDashboardData(user.id)

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Xin chào, {user.fullName}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">Quản lý dịch vụ Rise of Kingdoms của bạn</p>
      </div>

      {/* Stats overview */}
      <Suspense fallback={<LoadingSpinner />}>
        <CustomerStats stats={data.stats} />
      </Suspense>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active bookings */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveBookings bookings={data.activeBookings} />
          </Suspense>
        </div>

        {/* Recent payments */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentPayments payments={data.recentPayments} />
          </Suspense>
        </div>

        {/* Service recommendations */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <ServiceRecommendations recommendations={data.recommendations} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
