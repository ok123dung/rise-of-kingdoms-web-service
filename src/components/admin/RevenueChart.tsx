'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export default function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for the last 6 months
      const mockData: RevenueData[] = [
        { month: 'T7/2024', revenue: 45000000, bookings: 89 },
        { month: 'T8/2024', revenue: 52000000, bookings: 103 },
        { month: 'T9/2024', revenue: 38000000, bookings: 76 },
        { month: 'T10/2024', revenue: 67000000, bookings: 134 },
        { month: 'T11/2024', revenue: 73000000, bookings: 145 },
        { month: 'T12/2024', revenue: 89000000, bookings: 178 }
      ]
      
      setData(mockData)
    } catch (err) {
      setError('Không thể tải dữ liệu doanh thu')
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

  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <LoadingSpinner text="Đang tải dữ liệu..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchRevenueData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate growth
  const currentMonth = data[data.length - 1]?.revenue || 0
  const previousMonth = data[data.length - 2]?.revenue || 0
  const growth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0
  const isPositiveGrowth = growth >= 0

  // Calculate max value for scaling
  const maxRevenue = Math.max(...data.map(d => d.revenue))

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Biểu đồ doanh thu</CardTitle>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositiveGrowth ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositiveGrowth ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {Math.abs(growth).toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Doanh thu 6 tháng gần nhất
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end justify-between h-[200px] gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div className="flex flex-col items-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    {formatVND(item.revenue)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.bookings} đơn
                  </div>
                </div>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-700 hover:to-blue-500 transition-all duration-200 min-h-[20px]"
                  style={{
                    height: `${(item.revenue / maxRevenue) * 160}px`
                  }}
                />
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {item.month}
                </div>
              </div>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatVND(currentMonth)}
              </p>
              <p className="text-sm text-gray-600">Tháng này</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data.reduce((sum, item) => sum + item.bookings, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatVND(data.reduce((sum, item) => sum + item.revenue, 0) / data.length)}
              </p>
              <p className="text-sm text-gray-600">Trung bình/tháng</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}