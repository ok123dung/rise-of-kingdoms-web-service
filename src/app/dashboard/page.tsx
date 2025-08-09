import { Suspense } from 'react'

import { redirect } from 'next/navigation'

import ActiveBookings from '@/components/customer/ActiveBookings'
import CustomerStats from '@/components/customer/CustomerStats'
import RecentPayments from '@/components/customer/RecentPayments'
import ServiceRecommendations from '@/components/customer/ServiceRecommendations'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentUser } from '@/lib/auth'

export default async function CustomerDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Xin chào, {user.fullName}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý dịch vụ Rise of Kingdoms của bạn</p>
      </div>

      {/* Stats overview */}
      <Suspense fallback={<LoadingSpinner />}>
        <CustomerStats userId={user.id} />
      </Suspense>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active bookings */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSpinner />}>
            <ActiveBookings userId={user.id} />
          </Suspense>
        </div>

        {/* Recent payments */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentPayments userId={user.id} />
          </Suspense>
        </div>

        {/* Service recommendations */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <ServiceRecommendations userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
