'use client'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  Users,
  CreditCard,
  TrendingUp,
  MessageCircle,
  AlertCircle,
  DollarSign,
  Shield,
  LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  totalUsers: number
  totalLeads: number
  conversionRate: number
  avgOrderValue: number
  recentBookings: any[]
  recentLeads: any[]
  monthlyRevenue: number[]
  topServices: any[]
}
export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Check authentication and admin role
    if (status === 'loading') return // Still loading
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/dashboard')
      return
    }
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
      router.push('/auth/error?error=accessdenied')
      return
    }
    fetchDashboardData()
  }, [session, status, router])
  const fetchDashboardData = async () => {
    try {
      // In real app, these would be API calls
      // For now, using mock data based on our seeded database
      const mockStats: DashboardStats = {
        totalRevenue: 900000,
        totalBookings: 1,
        totalUsers: 2,
        totalLeads: 3,
        conversionRate: 33.33,
        avgOrderValue: 900000,
        monthlyRevenue: [0, 0, 0, 0, 0, 900000], // Last 6 months
        recentBookings: [
          {
            id: '1',
            bookingNumber: 'RK24010001',
            customerName: 'Nguyễn Văn A',
            serviceName: 'Tư vấn chiến thuật - Pro',
            amount: 900000,
            status: 'confirmed',
            createdAt: new Date().toISOString()
          }
        ],
        recentLeads: [
          {
            id: '1',
            fullName: 'Trần Văn B',
            email: 'lead1@example.com',
            serviceInterest: 'strategy',
            leadScore: 75,
            status: 'new',
            source: 'website'
          },
          {
            id: '2',
            fullName: 'Lê Thị C',
            email: 'lead2@example.com',
            serviceInterest: 'farming',
            leadScore: 60,
            status: 'contacted',
            source: 'discord'
          },
          {
            id: '3',
            fullName: 'Phạm Văn D',
            email: 'lead3@example.com',
            serviceInterest: 'premium',
            leadScore: 90,
            status: 'qualified',
            source: 'referral'
          }
        ],
        topServices: [
          { name: 'Tư vấn chiến thuật - Pro', bookings: 1, revenue: 900000 },
          { name: 'Farm Gem - Basic', bookings: 0, revenue: 0 },
          { name: 'KvK Support - Elite', bookings: 0, revenue: 0 }
        ]
      }
      setStats(mockStats)
      setLoading(false)
    } catch (error) {
      // Error handled by error boundary
      setLoading(false)
    }
  }
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
      qualified: 'bg-green-100 text-green-800'
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
  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    )
  }
  // Don't render anything if not authenticated (redirect will happen)
  if (status === 'unauthenticated') {
    return null
  }
  // Don't render if user doesn't have admin role (redirect will happen)
  if (session?.user?.role !== 'admin' && session?.user?.role !== 'superadmin') {
    return null
  }
  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Không thể tải dữ liệu</h2>
          <p className="text-gray-600">Vui lòng thử lại sau</p>
        </div>
      </div>
    )
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
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs capitalize text-gray-500">{session?.user?.role} • Online</p>
            </div>
          </div>
          {/* Logout Button */}
          <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
            title="Đăng xuất"
            onClick={() => {
              // Handle logout
              window.location.href = '/auth/signin'
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
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
                    <p className="text-xs text-gray-500">{booking.bookingNumber}</p>
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
                      <p className="font-medium text-gray-900">{lead.fullName}</p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="capitalize text-gray-900">{lead.serviceInterest}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getLeadScoreColor(lead.leadScore)}`}
                    >
                      {lead.leadScore}
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
