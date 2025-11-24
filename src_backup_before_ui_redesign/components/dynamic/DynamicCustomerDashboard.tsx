'use client'

import dynamic from 'next/dynamic'

import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Customer dashboard components with optimized loading
export const DynamicCustomerHeader = dynamic(() => import('@/components/customer/CustomerHeader'), {
  loading: () => (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <div className="h-8 w-32 animate-pulse rounded bg-gray-300" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
            <div className="h-8 w-24 animate-pulse rounded bg-gray-300" />
          </div>
        </div>
      </div>
    </header>
  ),
  ssr: false
})

export const DynamicCustomerSidebar = dynamic(
  () => import('@/components/customer/CustomerSidebar'),
  {
    loading: () => (
      <aside className="w-64 bg-white shadow-sm">
        <div className="space-y-2 p-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </aside>
    ),
    ssr: false
  }
)

export const DynamicCustomerStats = dynamic(() => import('@/components/customer/CustomerStats'), {
  loading: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
          <div className="mb-2 h-5 w-24 rounded bg-gray-300" />
          <div className="h-8 w-16 rounded bg-gray-300" />
        </div>
      ))}
    </div>
  ),
  ssr: false
})

export const DynamicActiveBookings = dynamic(() => import('@/components/customer/ActiveBookings'), {
  loading: () => (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="h-6 w-40 rounded bg-gray-300" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="h-5 w-32 rounded bg-gray-300" />
                <div className="h-6 w-20 rounded bg-blue-300" />
              </div>
              <div className="mb-2 h-4 w-48 rounded bg-gray-300" />
              <div className="h-4 w-24 rounded bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicRecentPayments = dynamic(() => import('@/components/customer/RecentPayments'), {
  loading: () => (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="h-6 w-36 rounded bg-gray-300" />
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center justify-between border-b py-3 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded bg-gray-300" />
                <div>
                  <div className="mb-1 h-4 w-20 rounded bg-gray-300" />
                  <div className="h-3 w-16 rounded bg-gray-300" />
                </div>
              </div>
              <div className="text-right">
                <div className="mb-1 h-4 w-16 rounded bg-gray-300" />
                <div className="h-3 w-12 rounded bg-green-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicServiceRecommendations = dynamic(
  () => import('@/components/customer/ServiceRecommendations'),
  {
    loading: () => (
      <div className="rounded-lg bg-white shadow">
        <div className="border-b p-6">
          <div className="h-6 w-44 rounded bg-gray-300" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="mb-2 h-5 w-32 rounded bg-gray-300" />
                <div className="mb-2 h-4 w-full rounded bg-gray-300" />
                <div className="h-4 w-3/4 rounded bg-gray-300" />
                <div className="mt-4 h-8 w-24 rounded bg-blue-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Heavy UI components
export const DynamicPaymentModal = dynamic(() => import('@/components/modals/PaymentModal'), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6">
        <LoadingSpinner />
        <p className="mt-4 text-center">Loading payment options...</p>
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicBookingModal = dynamic(() => import('@/components/modals/BookingModal'), {
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6">
        <div className="mb-4 h-6 w-48 rounded bg-gray-300" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-24 rounded bg-gray-300" />
              <div className="h-10 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <div className="h-10 w-20 rounded bg-gray-300" />
          <div className="h-10 w-24 rounded bg-blue-300" />
        </div>
      </div>
    </div>
  ),
  ssr: false
})

// Analytics components (potentially heavy)
export const DynamicCustomerAnalytics = dynamic(
  () => import('@/components/analytics/CustomerAnalytics'),
  {
    loading: () => (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 h-6 w-32 rounded bg-gray-300" />
        <div className="h-48 animate-pulse rounded bg-gray-200" />
      </div>
    ),
    ssr: false
  }
)
