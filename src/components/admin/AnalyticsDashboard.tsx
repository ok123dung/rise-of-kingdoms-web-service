'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Star,
  RefreshCw,
  Calendar
} from 'lucide-react'

interface AnalyticsData {
  period: string
  dateRange: { start: string; end: string }
  metrics: {
    revenue: {
      total: number
      previous: number
      growth: number
      transactionCount: number
    }
    bookings: {
      total: number
      completed: number
      pending: number
      inProgress: number
      completionRate: number
    }
    customers: {
      new: number
      active: number
      repeat: number
      retentionRate: number
    }
    orders: {
      averageValue: number
    }
    reviews: {
      averageRating: number
      totalReviews: number
    }
  }
  charts: {
    dailyRevenue: Array<{ date: string; revenue: number; count: number }>
    paymentMethods: Array<{ method: string; amount: number; count: number }>
    topServices: Array<{ name: string; bookings: number; revenue: number }>
  }
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        setError(result.error)
      }
    } catch {
      setError('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error || 'No data available'}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const { metrics, charts } = data

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
            <option value="year">Năm nay</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${metrics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.revenue.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatPercent(metrics.revenue.growth)}
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{formatCurrency(metrics.revenue.total)}</p>
          <p className="text-sm text-gray-600">Doanh thu</p>
          <p className="text-xs text-gray-500">{metrics.revenue.transactionCount} giao dịch</p>
        </div>

        {/* Bookings */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-blue-100 p-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-sm text-green-600">
              {metrics.bookings.completionRate.toFixed(0)}% hoàn thành
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{metrics.bookings.total}</p>
          <p className="text-sm text-gray-600">Đơn hàng</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-green-600">{metrics.bookings.completed} xong</span>
            <span className="text-yellow-600">{metrics.bookings.pending} chờ</span>
            <span className="text-blue-600">{metrics.bookings.inProgress} đang làm</span>
          </div>
        </div>

        {/* Customers */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-sm text-purple-600">
              {metrics.customers.retentionRate.toFixed(0)}% quay lại
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900">{metrics.customers.active}</p>
          <p className="text-sm text-gray-600">Khách hàng hoạt động</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-green-600">+{metrics.customers.new} mới</span>
            <span className="text-purple-600">{metrics.customers.repeat} quay lại</span>
          </div>
        </div>

        {/* Reviews */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-full bg-yellow-100 p-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{metrics.reviews.averageRating.toFixed(1)}</span>
            <span className="text-lg text-gray-600">/5</span>
          </div>
          <p className="text-sm text-gray-600">Đánh giá trung bình</p>
          <p className="text-xs text-gray-500">{metrics.reviews.totalReviews} đánh giá</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Phương thức thanh toán</h3>
          <div className="space-y-3">
            {charts.paymentMethods.map((method) => {
              const total = charts.paymentMethods.reduce((sum, m) => sum + m.amount, 0)
              const percentage = total > 0 ? (method.amount / total) * 100 : 0

              return (
                <div key={method.method}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-gray-700">{method.method}</span>
                    <span className="text-gray-600">{formatCurrency(method.amount)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs text-gray-500">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Services */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Dịch vụ phổ biến</h3>
          <div className="space-y-3">
            {charts.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.bookings} đơn</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{formatCurrency(service.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Giá trị đơn hàng trung bình</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.orders.averageValue)}</p>
          </div>
          <div className="rounded-full bg-white/50 p-4">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
