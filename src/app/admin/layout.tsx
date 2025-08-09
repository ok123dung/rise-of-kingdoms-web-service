import { Suspense } from 'react'

import { redirect } from 'next/navigation'

import {
  DynamicAdminHeader,
  DynamicAdminSidebar,
  DynamicPerformanceMonitor
} from '@/components/dynamic/DynamicAdminDashboard'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getCurrentSession, getCurrentUser, isAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  const user = await getCurrentUser()
  if (!isAdmin(user)) {
    redirect('/dashboard')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Performance monitoring (loads async, no blocking) */}
        <DynamicPerformanceMonitor />

        {/* Admin Sidebar - loads async */}
        <Suspense
          fallback={
            <div className="fixed inset-y-0 left-0 z-50 w-64 animate-pulse bg-gray-800">
              <div className="space-y-2 p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 rounded bg-gray-700" />
                ))}
              </div>
            </div>
          }
        >
          <DynamicAdminSidebar />
        </Suspense>

        <div className="lg:pl-64">
          {/* Admin Header - loads first */}
          <Suspense fallback={<div className="h-16 animate-pulse bg-white shadow-sm" />}>
            <DynamicAdminHeader />
          </Suspense>

          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ErrorBoundary
                fallback={
                  <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h2 className="mb-2 text-lg font-semibold text-red-800">
                      Admin Dashboard Error
                    </h2>
                    <p className="text-red-600">
                      There was an error loading the admin dashboard. Please refresh the page or
                      contact support.
                    </p>
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="flex min-h-96 items-center justify-center">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600">Loading admin content...</span>
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
