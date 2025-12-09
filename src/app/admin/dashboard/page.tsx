import {
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  MessageCircle,
  DollarSign,
  Shield,
  LogOut
} from 'lucide-react'
import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getAdminDashboardData() {
  // 1. Overall Stats
  const totalRevenueResult = await prisma.payments.aggregate({
    where: { status: 'completed' },
    _sum: { amount: true }
  })
  const totalRevenue = Number(totalRevenueResult._sum.amount ?? 0)

  const totalBookings = await prisma.bookings.count()
  // Count users who are customers (no staff profile)
  const totalUsers = await prisma.users.count({
    where: {
      staff: {
        is: null
      }
    }
  })
  const totalLeads = await prisma.leads.count()

  // Conversion Rate: (Bookings / Leads) * 100 (Simplified proxy)
  const conversionRate = totalLeads > 0 ? (totalBookings / totalLeads) * 100 : 0

  // 2. Recent Bookings
  const recentBookingsData = await prisma.bookings.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: {
      users: true,
      service_tiers: {
        include: { services: true }
      }
    }
  })

  const recentBookings = recentBookingsData.map(booking => ({
    id: booking.id,
    booking_number: booking.booking_number,
    customerName: booking.users?.full_name ?? 'Unknown',
    serviceName: booking.service_tiers?.services?.name ?? 'Unknown Service',
    amount: Number(booking.total_amount),
    status: booking.status,
    created_at: booking.created_at.toISOString()
  }))

  // 3. Recent Leads
  const recentLeadsData = await prisma.leads.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  })

  const recentLeads = recentLeadsData.map(lead => ({
    id: lead.id,
    full_name: lead.full_name,
    email: lead.email,
    service_interest: lead.service_interest,
    lead_score: lead.lead_score,
    status: lead.status,
    source: lead.source
  }))

  // 4. Top Services (Aggregation)
  // Prisma doesn't support complex grouping with relations easily in one go,
  // so we might need to do some manual aggregation or raw query.
  // For simplicity/performance, let's just count bookings per service tier for now.
  const topServicesData = await prisma.bookings.groupBy({
    by: ['service_tier_id'],
    _count: {
      service_tier_id: true
    },
    _sum: {
      total_amount: true
    },
    orderBy: {
      _count: {
        service_tier_id: 'desc'
      }
    },
    take: 5
  })

  // We need to fetch service names for these IDs
  const service_tiersIds = topServicesData.map(item => item.service_tier_id)
  const service_tiers = await prisma.service_tiers.findMany({
    where: { id: { in: service_tiersIds } },
    include: { services: true }
  })

  const topServices = topServicesData.map(item => {
    const tier = service_tiers.find(t => t.id === item.service_tier_id)
    const serviceName = tier?.services?.name ?? 'Unknown'
    return {
      name: tier ? `${serviceName} - ${tier.name}` : 'Unknown Service',
      bookings: item._count.service_tier_id,
      revenue: Number(item._sum.total_amount ?? 0)
    }
  })

  return {
    totalRevenue,
    totalBookings,
    totalUsers,
    totalLeads,
    conversionRate,
    recentBookings,
    recentLeads,
    topServices
  }
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/admin/dashboard')
  }

  const userRole = user.staff?.role

  if (userRole !== 'admin' && userRole !== 'superadmin') {
    redirect('/auth/error?error=accessdenied')
  }

  const stats = await getAdminDashboardData()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}
      >
        {status}
      </span>
    )
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Admin Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Tổng quan business Rise of Kingdoms Services</p>
        </div>
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm">
            <div className="rounded-full bg-blue-100 p-2">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.full_name || user.email}</p>
              <p className="text-xs capitalize text-gray-500">{user.staff?.role} • Online</p>
            </div>
          </div>
          {/* Logout Button - Client Component needed for onClick, or use Link to signout route if available. 
              For now, let's keep it simple or use a form action if we were strictly server. 
              But since we are in a server component, we can't use onClick. 
              We should probably extract the Header to a client component or just link to signout.
          */}
          <a
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
            href="/api/auth/signout"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </a>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-green-600">+100%</span>
            <span className="ml-1 text-sm text-gray-600">từ tháng trước</span>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-blue-600">+100%</span>
            <span className="ml-1 text-sm text-gray-600">từ tháng trước</span>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-purple-600">+100%</span>
            <span className="ml-1 text-sm text-gray-600">từ tháng trước</span>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-medium text-orange-600">Tốt</span>
            <span className="ml-1 text-sm text-gray-600">so với trung bình</span>
          </div>
        </div>
      </div>
      {/* Charts and Tables */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
          <div className="space-y-4">
            {stats.recentBookings.map((booking, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-600">{booking.serviceName}</p>
                    <p className="text-xs text-gray-500">{booking.booking_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(booking.amount)}</p>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Top Services */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Dịch vụ phổ biến</h3>
          <div className="space-y-4">
            {stats.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.bookings} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Leads */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Leads mới nhất</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Dịch vụ quan tâm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Điểm lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nguồn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stats.recentLeads.map((lead, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{lead.full_name}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="capitalize text-gray-900">{lead.service_interest}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getLeadScoreColor(lead.lead_score)}`}
                    >
                      {lead.lead_score}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="capitalize text-gray-600">{lead.source}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(lead.status)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button className="mr-3 text-blue-600 hover:text-blue-900">Liên hệ</button>
                    <button className="text-green-600 hover:text-green-900">Convert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button className="flex items-center justify-center rounded-lg border-2 border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-600">Quản lý khách hàng</span>
          </button>
          <button className="flex items-center justify-center rounded-lg border-2 border-green-200 bg-green-50 p-4 transition-colors hover:bg-green-100">
            <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">Xem báo cáo</span>
          </button>
          <button className="flex items-center justify-center rounded-lg border-2 border-purple-200 bg-purple-50 p-4 transition-colors hover:bg-purple-100">
            <MessageCircle className="mr-2 h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-600">Discord dashboard</span>
          </button>
        </div>
      </div>
    </div>
  )
}
