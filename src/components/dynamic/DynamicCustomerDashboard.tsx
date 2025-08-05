'use client'

import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Customer dashboard components with optimized loading
export const DynamicCustomerHeader = dynamic(
  () => import('@/components/customer/CustomerHeader'),
  {
    loading: () => (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    ),
    ssr: false
  }
)

export const DynamicCustomerSidebar = dynamic(
  () => import('@/components/customer/CustomerSidebar'),
  {
    loading: () => (
      <aside className="w-64 bg-white shadow-sm">
        <div className="p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </aside>
    ),
    ssr: false
  }
)

export const DynamicCustomerStats = dynamic(
  () => import('@/components/customer/CustomerStats'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-5 bg-gray-300 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    ),
    ssr: false
  }
)

export const DynamicActiveBookings = dynamic(
  () => import('@/components/customer/ActiveBookings'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-gray-300 rounded w-32"></div>
                  <div className="h-6 bg-blue-300 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded mb-2 w-48"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicRecentPayments = dynamic(
  () => import('@/components/customer/RecentPayments'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-36"></div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded mb-1 w-20"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded mb-1 w-16"></div>
                  <div className="h-3 bg-green-300 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicServiceRecommendations = dynamic(
  () => import('@/components/customer/ServiceRecommendations'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-44"></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-gray-300 rounded mb-2 w-32"></div>
                <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="mt-4 h-8 bg-blue-300 rounded w-24"></div>
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
export const DynamicPaymentModal = dynamic(
  () => import('@/components/modals/PaymentModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-96">
          <LoadingSpinner />
          <p className="text-center mt-4">Loading payment options...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicBookingModal = dynamic(
  () => import('@/components/modals/BookingModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="h-6 bg-gray-300 rounded mb-4 w-48"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <div className="h-10 bg-gray-300 rounded w-20"></div>
            <div className="h-10 bg-blue-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Analytics components (potentially heavy)
export const DynamicCustomerAnalytics = dynamic(
  () => import('@/components/analytics/CustomerAnalytics'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-300 rounded mb-4 w-32"></div>
        <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ),
    ssr: false
  }
)