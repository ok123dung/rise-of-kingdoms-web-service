'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Calendar, Clock, Award } from 'lucide-react'

interface AnalyticsData {
  totalBookings: number
  completedServices: number
  totalSpent: number
  averageRating: number
  monthlyData: Array<{
    month: string
    bookings: number
    spent: number
  }>
  serviceBreakdown: Array<{
    service: string
    count: number
    total: number
  }>
  performanceMetrics: {
    responseTime: number
    satisfactionRate: number
    repeatCustomer: boolean
  }
}

export default function CustomerAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m')

  useEffect(() => {
    // Mock data loading
    const loadAnalytics = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData({
        totalBookings: 15,
        completedServices: 12,
        totalSpent: 18500000,
        averageRating: 4.8,
        monthlyData: [
          { month: 'T1', bookings: 2, spent: 3000000 },
          { month: 'T2', bookings: 3, spent: 4500000 },
          { month: 'T3', bookings: 1, spent: 2000000 },
          { month: 'T4', bookings: 4, spent: 5000000 },
          { month: 'T5', bookings: 3, spent: 2500000 },
          { month: 'T6', bookings: 2, spent: 1500000 }
        ],
        serviceBreakdown: [
          { service: 'Coaching 1-1', count: 8, total: 4000000 },
          { service: 'Account Boost', count: 4, total: 8000000 },
          { service: 'KvK Support', count: 2, total: 4000000 },
          { service: 'Alliance Management', count: 1, total: 2500000 }
        ],
        performanceMetrics: {
          responseTime: 2.5,
          satisfactionRate: 96,
          repeatCustomer: true
        }
      })
      setLoading(false)
    }

    loadAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Thống kê sử dụng dịch vụ
          </h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '3m' | '6m' | '1y')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="3m">3 tháng qua</option>
            <option value="6m">6 tháng qua</option>
            <option value="1y">1 năm qua</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Tổng booking</p>
                <p className="text-2xl font-bold text-blue-900">{data.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-900">{data.completedServices}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(data.totalSpent / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 mb-1">Đánh giá TB</p>
                <p className="text-2xl font-bold text-yellow-900">{data.averageRating}</p>
              </div>
              <div className="text-yellow-500">
                {'★'.repeat(Math.floor(data.averageRating))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Xu hướng theo tháng</h4>
          <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
            {data.monthlyData.map((month, index) => (
              <div key={month.month} className="flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-600">
                  {(month.spent / 1000000).toFixed(1)}M
                </div>
                <div 
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(month.spent / Math.max(...data.monthlyData.map(m => m.spent))) * 200}px`,
                    minHeight: '4px'
                  }}
                ></div>
                <div className="text-xs text-gray-600">{month.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Phân bố dịch vụ</h4>
            <div className="space-y-3">
              {data.serviceBreakdown.map((service, index) => (
                <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{service.service}</div>
                    <div className="text-sm text-gray-600">{service.count} lần sử dụng</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {(service.total / 1000000).toFixed(1)}M VNĐ
                    </div>
                    <div className="text-sm text-gray-600">
                      {((service.total / data.totalSpent) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Chỉ số hiệu suất</h4>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Thời gian phản hồi trung bình</span>
                  <span className="font-medium">{data.performanceMetrics.responseTime}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${100 - (data.performanceMetrics.responseTime / 24) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Tỷ lệ hài lòng</span>
                  <span className="font-medium">{data.performanceMetrics.satisfactionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${data.performanceMetrics.satisfactionRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Khách hàng thân thiết</span>
                  <div className="flex items-center">
                    {data.performanceMetrics.repeatCustomer ? (
                      <>
                        <span className="text-green-600 font-medium mr-2">Có</span>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-600 font-medium mr-2">Chưa</span>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Gợi ý cho bạn</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Bạn là khách hàng thân thiết! Liên hệ để nhận ưu đãi đặc biệt</li>
            <li>• Dịch vụ Coaching 1-1 phù hợp nhất với bạn, hãy book thêm để cải thiện</li>
            <li>• Thời điểm tốt nhất để book: Thứ 2-5, 19:00-22:00</li>
          </ul>
        </div>
      </div>
    </div>
  )
}