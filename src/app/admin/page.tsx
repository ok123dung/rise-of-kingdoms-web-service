import {
  DynamicDashboardStats,
  DynamicRecentBookings,
  DynamicRevenueChart,
  DynamicTopCustomers,
  DynamicQuickActions
} from '@/components/dynamic/DynamicAdminDashboard'

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

      {/* Stats overview - loads first */}
      <DynamicDashboardStats />

      {/* Quick actions - loads second */}
      <DynamicQuickActions />

      {/* Main content grid - loads last */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue chart */}
        <div className="lg:col-span-2">
          <DynamicRevenueChart />
        </div>

        {/* Recent bookings */}
        <div>
          <DynamicRecentBookings />
        </div>

        {/* Top customers */}
        <div>
          <DynamicTopCustomers />
        </div>
      </div>
    </div>
  )
}
