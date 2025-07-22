import { redirect } from 'next/navigation'
import { getCurrentSession, getCurrentUser, isAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

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
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
