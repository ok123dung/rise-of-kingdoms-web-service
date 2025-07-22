'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react'

interface CustomerStats {
  totalBookings: number
  totalSpent: number
  activeServices: number
  completedServices: number
  averageRating: number
  memberSince: string
  nextTierThreshold?: number
  currentTierProgress: number
  recentActivity: {
    lastBooking: string
    lastPayment: string
    upcomingService?: string
  }
}

interface CustomerStatsProps {
  userId?: string
}

export default function CustomerStats({ userId }: CustomerStatsProps) {
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerStats()
  }, [])

  const fetchCustomerStats = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock customer stats data
      const mockStats: CustomerStats = {
        totalBookings: 12,
        totalSpent: 15750000,
        activeServices: 2,
        completedServices: 10,
        averageRating: 4.8,
        memberSince: '2024-01-15',
        nextTierThreshold: 20000000,
        currentTierProgress: 78.75, // (15750000/20000000) * 100
        recentActivity: {
          lastBooking: '2024-07-20',
          lastPayment: '2024-07-20',
          upcomingService: '2024-07-25'
        }
      }
      
      setStats(mockStats)
    } catch (err) {
      setError('Không thể tải thống kê khách hàng')
    } finally {
      setLoading(false)
    }
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString))
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 ngày'
    if (diffDays < 7) return `${diffDays} ngày`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần`
    return `${Math.ceil(diffDays / 30)} tháng`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <LoadingSpinner size="sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button 
            onClick={fetchCustomerStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  +{stats.activeServices} đang hoạt động
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(stats.totalSpent)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Trung bình: {formatVND(stats.totalSpent / stats.totalBookings)}/đơn
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round((stats.completedServices / stats.totalBookings) * 100)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.completedServices}/{stats.totalBookings} dịch vụ
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đánh giá trung bình</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`h-4 w-4 ${
                          star <= stats.averageRating 
                            ? 'text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Khách hàng hài lòng cao</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <span className="font-medium">
                    {stats.currentTierProgress.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.currentTierProgress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatVND(stats.totalSpent)}</span>
                  <span>{formatVND(stats.nextTierThreshold)}</span>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
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
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
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
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Đơn hàng cuối</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(stats.recentActivity.lastBooking)} ({getTimeSince(stats.recentActivity.lastBooking)} trước)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thanh toán cuối</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(stats.recentActivity.lastPayment)} ({getTimeSince(stats.recentActivity.lastPayment)} trước)
                    </p>
                  </div>
                </div>
              </div>

              {stats.recentActivity.upcomingService && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
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