import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  CreditCard,
  UserCheck
} from 'lucide-react'

import { prisma } from '@/lib/db'

async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Current month stats
  const [
    totalRevenue,
    totalBookings,
    totalCustomers,
    completedPayments,
    activeLeads,
    todayBookings,
    lastMonthRevenue,
    lastMonthBookings
  ] = await Promise.all([
    // Total revenue this month
    prisma.payments.aggregate({
      where: {
        status: 'completed',
        paid_at: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),

    // Total bookings this month
    prisma.bookings.count({
      where: { created_at: { gte: startOfMonth } }
    }),

    // Total customers this month
    prisma.users.count({
      where: { created_at: { gte: startOfMonth } }
    }),

    // Completed payments this month
    prisma.payments.count({
      where: {
        status: 'completed',
        paid_at: { gte: startOfMonth }
      }
    }),

    // Active leads
    prisma.leads.count({
      where: {
        status: { in: ['new', 'contacted', 'qualified'] }
      }
    }),

    // Today's bookings
    prisma.bookings.count({
      where: { created_at: { gte: startOfToday } }
    }),

    // Last month revenue for comparison
    prisma.payments.aggregate({
      where: {
        status: 'completed',
        paid_at: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      _sum: { amount: true }
    }),

    // Last month bookings for comparison
    prisma.bookings.count({
      where: {
        created_at: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    })
  ])

  // Calculate growth percentages
  const revenueGrowth = lastMonthRevenue._sum.amount
    ? ((Number(totalRevenue._sum.amount ?? 0) - Number(lastMonthRevenue._sum.amount)) /
        Number(lastMonthRevenue._sum.amount)) *
      100
    : 0

  const bookingGrowth =
    lastMonthBookings > 0 ? ((totalBookings - lastMonthBookings) / lastMonthBookings) * 100 : 0

  return {
    revenue: {
      current: Number(totalRevenue._sum.amount ?? 0),
      growth: revenueGrowth
    },
    bookings: {
      current: totalBookings,
      growth: bookingGrowth,
      today: todayBookings
    },
    customers: {
      current: totalCustomers
    },
    payments: {
      completed: completedPayments
    },
    leads: {
      active: activeLeads
    }
  }
}

export default async function DashboardStats() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      name: 'Doanh thu tháng này',
      value: `${stats.revenue.current.toLocaleString()} VNĐ`,
      change: stats.revenue.growth,
      changeType: stats.revenue.growth >= 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'Bookings tháng này',
      value: stats.bookings.current.toString(),
      change: stats.bookings.growth,
      changeType: stats.bookings.growth >= 0 ? 'increase' : 'decrease',
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-100',
      subtitle: `${stats.bookings.today} hôm nay`
    },
    {
      name: 'Khách hàng mới',
      value: stats.customers.current.toString(),
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'Thanh toán thành công',
      value: stats.payments.completed.toString(),
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      name: 'Leads đang xử lý',
      value: stats.leads.active.toString(),
      icon: UserCheck,
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map(stat => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color}`}>
              <stat.icon aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            {stat.change !== undefined && (
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 shrink-0 self-center" />
                ) : (
                  <TrendingDown className="h-4 w-4 shrink-0 self-center" />
                )}
                <span className="ml-1">{Math.abs(stat.change).toFixed(1)}%</span>
              </p>
            )}
          </dd>
          {stat.subtitle && <p className="ml-16 mt-1 text-xs text-gray-400">{stat.subtitle}</p>}
        </div>
      ))}
    </div>
  )
}
