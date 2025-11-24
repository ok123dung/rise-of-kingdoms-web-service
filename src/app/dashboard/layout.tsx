import { redirect } from 'next/navigation'

import CustomerHeader from '@/components/customer/CustomerHeader'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import { getCurrentSession } from '@/lib/auth'

export default async function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  return (
    <div className="min-h-screen bg-background-dark">
      <CustomerSidebar />
      <div className="lg:pl-64">
        <CustomerHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
