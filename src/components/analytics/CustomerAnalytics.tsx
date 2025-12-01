'use client'

import { useState, useEffect } from 'react'

import { BarChart3, TrendingUp, Calendar, Award } from 'lucide-react'

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

    void loadAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-gray-300" />
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-100 p-4">
                <div className="mb-2 h-4 rounded bg-gray-300" />
                <div className="h-8 rounded bg-gray-300" />
              </div>
            ))}
          </div>
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="rounded-lg bg-white shadow">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
            Thống kê sử dụng dịch vụ
          </h3>
          <select
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as '3m' | '6m' | '1y')}
          >
            <option value="3m">3 tháng qua</option>
            <option value="6m">6 tháng qua</option>
            <option value="1y">1 năm qua</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-blue-600">Tổng booking</p>
                <p className="text-2xl font-bold text-blue-900">{data.totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-green-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-900">{data.completedServices}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-purple-600">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(data.totalSpent / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-yellow-600">Đánh giá TB</p>
                <p className="text-2xl font-bold text-yellow-900">{data.averageRating}</p>
              </div>
              <div className="text-yellow-500">{'★'.repeat(Math.floor(data.averageRating))}</div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="mb-8">
          <h4 className="mb-4 text-sm font-medium text-gray-700">Xu hướng theo tháng</h4>
          <div className="flex h-64 items-end justify-between rounded-lg bg-gray-50 p-4">
            {data.monthlyData.map((month, _index) => (
              <div key={month.month} className="flex flex-col items-center space-y-2">
                <div className="text-xs text-gray-600">{(month.spent / 1000000).toFixed(1)}M</div>
                <div
                  className="w-8 rounded-t bg-blue-500"
                  style={{
                    height: `${(month.spent / Math.max(...data.monthlyData.map(m => m.spent))) * 200}px`,
                    minHeight: '4px'
                  }}
                />
                <div className="text-xs text-gray-600">{month.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h4 className="mb-4 text-sm font-medium text-gray-700">Phân bố dịch vụ</h4>
            <div className="space-y-3">
              {data.serviceBreakdown.map((service, _index) => (
                <div
                  key={service.service}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
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
            <h4 className="mb-4 text-sm font-medium text-gray-700">Chỉ số hiệu suất</h4>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Thời gian phản hồi trung bình</span>
                  <span className="font-medium">{data.performanceMetrics.responseTime}h</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${100 - (data.performanceMetrics.responseTime / 24) * 100}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ hài lòng</span>
                  <span className="font-medium">{data.performanceMetrics.satisfactionRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${data.performanceMetrics.satisfactionRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Khách hàng thân thiết</span>
                  <div className="flex items-center">
                    {data.performanceMetrics.repeatCustomer ? (
                      <>
                        <span className="mr-2 font-medium text-green-600">Có</span>
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                      </>
                    ) : (
                      <>
                        <span className="mr-2 font-medium text-gray-600">Chưa</span>
                        <div className="h-3 w-3 rounded-full bg-gray-400" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">💡 Gợi ý cho bạn</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Bạn là khách hàng thân thiết! Liên hệ để nhận ưu đãi đặc biệt</li>
            <li>• Dịch vụ Coaching 1-1 phù hợp nhất với bạn, hãy book thêm để cải thiện</li>
            <li>• Thời điểm tốt nhất để book: Thứ 2-5, 19:00-22:00</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
