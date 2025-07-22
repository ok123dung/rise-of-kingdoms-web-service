import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerHeader from '@/components/customer/CustomerHeader'

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getCurrentSession()
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="lg:pl-64">
        <CustomerHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
