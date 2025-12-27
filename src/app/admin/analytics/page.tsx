import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/admin/analytics')
  }

  const userRole = user.staff?.role

  if (userRole !== 'admin' && userRole !== 'superadmin') {
    redirect('/auth/error?error=accessdenied')
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Thống kê chi tiết hoạt động kinh doanh</p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
