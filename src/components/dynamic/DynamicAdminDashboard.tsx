'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamically import admin components with loading states
export const DynamicAdminHeader = dynamic(
  () => import('@/components/admin/AdminHeader'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicAdminSidebar = dynamic(
  () => import('@/components/admin/AdminSidebar'),
  {
    loading: () => (
      <div className="w-64 h-screen bg-gray-800 animate-pulse">
        <div className="p-4">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicDashboardStats = dynamic(
  () => import('@/components/admin/DashboardStats'),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    ),
    ssr: false
  }
)

export const DynamicRevenueChart = dynamic(
  () => import('@/components/admin/RevenueChart'),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicRecentBookings = dynamic(
  () => import('@/components/admin/RecentBookings'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicTopCustomers = dynamic(
  () => import('@/components/admin/TopCustomers'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded mb-1 w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicQuickActions = dynamic(
  () => import('@/components/admin/QuickActions'),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-6 bg-gray-300 rounded mb-4 w-32"></div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

// Chart components (would be heavy if we had chart libraries)
export const DynamicChart = dynamic(
  () => Promise.resolve(() => (
    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 mb-2">📊</div>
        <div className="text-gray-600">Chart Component</div>
        <div className="text-sm text-gray-500">Install chart library to enable</div>
      </div>
    </div>
  )),
  {
    loading: () => (
      <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2 text-gray-500">Loading chart...</span>
      </div>
    ),
    ssr: false
  }
)

// Performance monitoring component
export const DynamicPerformanceMonitor = dynamic(
  () => import('@/components/performance/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor })),
  {
    loading: () => null, // Hidden loading for monitoring component
    ssr: false
  }
)