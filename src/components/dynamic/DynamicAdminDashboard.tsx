'use client'

import dynamic from 'next/dynamic'

import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import admin components with loading states
export const DynamicAdminHeader = dynamic(() => import('@/components/admin/AdminHeader'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

export const DynamicAdminSidebar = dynamic(() => import('@/components/admin/AdminSidebar'), {
  loading: () => (
    <div className="h-screen w-64 animate-pulse bg-gray-800">
      <div className="p-4">
        <div className="mb-4 h-8 rounded bg-gray-700" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-700" />
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicDashboardStats = dynamic(() => import('@/components/admin/DashboardStats'), {
  loading: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
          <div className="mb-2 h-6 rounded bg-gray-300" />
          <div className="h-8 rounded bg-gray-300" />
        </div>
      ))}
    </div>
  ),
  ssr: false
})

export const DynamicRevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  loading: () => (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 h-6 rounded bg-gray-300" />
      <div className="h-64 animate-pulse rounded bg-gray-200" />
    </div>
  ),
  ssr: false
})

export const DynamicRecentBookings = dynamic(() => import('@/components/admin/RecentBookings'), {
  loading: () => (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="h-6 w-32 rounded bg-gray-300" />
      </div>
      <div className="space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-300" />
            <div className="flex-1">
              <div className="mb-2 h-4 rounded bg-gray-300" />
              <div className="h-3 w-3/4 rounded bg-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicTopCustomers = dynamic(() => import('@/components/admin/TopCustomers'), {
  loading: () => (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="h-6 w-32 rounded bg-gray-300" />
      </div>
      <div className="space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-300" />
              <div>
                <div className="mb-1 h-4 w-24 rounded bg-gray-300" />
                <div className="h-3 w-16 rounded bg-gray-300" />
              </div>
            </div>
            <div className="h-4 w-16 rounded bg-gray-300" />
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicQuickActions = dynamic(() => import('@/components/admin/QuickActions'), {
  loading: () => (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 h-6 w-32 rounded bg-gray-300" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-gray-300" />
        ))}
      </div>
    </div>
  ),
  ssr: false
})

// Chart components (would be heavy if we had chart libraries)
export const DynamicChart = dynamic(
  () =>
    Promise.resolve(() => (
      <div className="flex h-64 items-center justify-center rounded bg-gray-200">
        <div className="text-center">
          <div className="mb-2 text-gray-500">📊</div>
          <div className="text-gray-600">Chart Component</div>
          <div className="text-sm text-gray-500">Install chart library to enable</div>
        </div>
      </div>
    )),
  {
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded bg-gray-200">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading chart...</span>
      </div>
    ),
    ssr: false
  }
)

// Performance monitoring component
export const DynamicPerformanceMonitor = dynamic(
  () =>
    import('@/components/performance/PerformanceMonitor').then(mod => ({
      default: mod.PerformanceMonitor
    })),
  {
    loading: () => null, // Hidden loading for monitoring component
    ssr: false
  }
)
