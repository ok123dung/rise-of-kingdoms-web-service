import { Suspense } from 'react'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentBookings from '@/components/admin/RecentBookings'
import RevenueChart from '@/components/admin/RevenueChart'
import TopCustomers from '@/components/admin/TopCustomers'
import QuickActions from '@/components/admin/QuickActions'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tổng quan hoạt động kinh doanh RoK Services
        </p>
      </div>

      {/* Stats overview */}
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardStats />
      </Suspense>

      {/* Quick actions */}
      <QuickActions />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue chart */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingSpinner />}>
            <RevenueChart />
          </Suspense>
        </div>

        {/* Recent bookings */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentBookings />
          </Suspense>
        </div>

        {/* Top customers */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <TopCustomers />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
