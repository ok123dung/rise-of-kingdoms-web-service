import { redirect } from 'next/navigation'
import { getCurrentSession, getCurrentUser, isAdmin } from '@/lib/auth'
import { Suspense } from 'react'
import { 
  DynamicAdminHeader, 
  DynamicAdminSidebar,
  DynamicPerformanceMonitor 
} from '@/components/dynamic/DynamicAdminDashboard'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <Suspense fallback={
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 animate-pulse">
            <div className="p-4 space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <DynamicAdminSidebar />
        </Suspense>
        
        <div className="lg:pl-64">
          {/* Admin Header - loads first */}
          <Suspense fallback={<div className="h-16 bg-white shadow-sm animate-pulse" />}>
            <DynamicAdminHeader />
          </Suspense>
          
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ErrorBoundary
                fallback={
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                      Admin Dashboard Error
                    </h2>
                    <p className="text-red-600">
                      There was an error loading the admin dashboard. Please refresh the page or contact support.
                    </p>
                  </div>
                }
              >
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-96">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600">Loading admin content...</span>
                  </div>
                }>
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
