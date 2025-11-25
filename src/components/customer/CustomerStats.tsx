'use client'

import {
  ShoppingCart,
  DollarSign,
  CheckCircle,
  Award,
  Target,
  Clock,
  Calendar,
  TrendingUp
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CustomerStatsData {
  totalBookings: number
  totalSpent: number
  activeServices: number
  completedServices: number
  averageRating: number
  memberSince: string
  nextTierThreshold?: number
  currentTierProgress: number
  recentActivity: {
    lastBooking: string | null
    lastPayment: string | null
    upcomingService?: string | null
  }
}

interface CustomerStatsProps {
  stats: CustomerStatsData
}

export default function CustomerStats({ stats }: CustomerStatsProps) {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString))
  }

  const getTimeSince = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 ngày'
    if (diffDays < 7) return `${diffDays} ngày`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần`
    return `${Math.ceil(diffDays / 30)} tháng`
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="mt-1 text-xs font-medium text-green-600">
                  +{stats.activeServices} đang hoạt động
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-900">{formatVND(stats.totalSpent)}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Trung bình:{' '}
                  {stats.totalBookings > 0 ? formatVND(stats.totalSpent / stats.totalBookings) : 0}
                  /đơn
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalBookings > 0
                    ? Math.round((stats.completedServices / stats.totalBookings) * 100)
                    : 0}
                  %
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {stats.completedServices}/{stats.totalBookings} dịch vụ
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div
                        key={star}
                        className={`h-4 w-4 ${star <= stats.averageRating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Khách hàng hài lòng cao</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tier Progress */}
        {stats.nextTierThreshold && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tiến độ lên hạng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiến độ lên VIP Premium</span>
                  <span className="font-medium">{stats.currentTierProgress.toFixed(1)}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${stats.currentTierProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatVND(stats.totalSpent)}</span>
                  <span>{formatVND(stats.nextTierThreshold)}</span>
                </div>

                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Còn {formatVND(stats.nextTierThreshold - stats.totalSpent)}</strong> nữa
                    để lên hạng VIP Premium và nhận được các ưu đãi đặc biệt!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thành viên từ</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(stats.memberSince)} ({getTimeSince(stats.memberSince)} trước)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Đơn hàng cuối</p>
                    <p className="text-xs text-gray-600">
                      {stats.recentActivity.lastBooking ? (
                        <>
                          {formatDate(stats.recentActivity.lastBooking)} (
                          {getTimeSince(stats.recentActivity.lastBooking)} trước)
                        </>
                      ) : (
                        'Chưa có đơn hàng'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thanh toán cuối</p>
                    <p className="text-xs text-gray-600">
                      {stats.recentActivity.lastPayment ? (
                        <>
                          {formatDate(stats.recentActivity.lastPayment)} (
                          {getTimeSince(stats.recentActivity.lastPayment)} trước)
                        </>
                      ) : (
                        'Chưa có thanh toán'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {stats.recentActivity.upcomingService && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Dịch vụ sắp tới</p>
                      <p className="text-xs text-yellow-700">
                        {formatDate(stats.recentActivity.upcomingService)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
