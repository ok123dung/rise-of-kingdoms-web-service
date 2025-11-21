import { Suspense } from 'react'

import DashboardStats from '@/components/admin/DashboardStats'
import RecentBookings from '@/components/admin/RecentBookings'
import {
  DynamicRevenueChart,
  DynamicTopCustomers,
  DynamicQuickActions
} from '@/components/dynamic/DynamicAdminDashboard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan hoạt động kinh doanh RoK Services</p>
      </div>

      {/* Stats overview - Server Component */}
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-gray-200" />}>
        <DashboardStats />
      </Suspense>

      {/* Quick actions - Client Component */}
      <DynamicQuickActions />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue chart - Client Component */}
        <div className="lg:col-span-2">
          <DynamicRevenueChart />
        </div>

        {/* Recent bookings - Server Component */}
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentBookings />
          </Suspense>
        </div>

        {/* Top customers - Client Component */}
        <div>
          <DynamicTopCustomers />
        </div>
      </div>
    </div>
  )
}
