'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Calendar, Clock, AlertCircle, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react'
import Link from 'next/link'

interface ActiveBooking {
  id: string
  bookingNumber: string
  serviceName: string
  tierName: string
  status: 'pending' | 'in_progress' | 'paused' | 'completed'
  startDate: string
  endDate: string
  progress: number
  nextSession?: string
  assignedStaff?: {
    name: string
    avatar?: string
  }
}

export default function ActiveBookings() {
  const [bookings, setBookings] = useState<ActiveBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActiveBookings()
  }, [])

  const fetchActiveBookings = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock active bookings data
      const mockBookings: ActiveBooking[] = [
        {
          id: '1',
          bookingNumber: 'RK240720001',
          serviceName: 'Coaching KvK chuyên sâu',
          tierName: 'Premium',
          status: 'in_progress',
          startDate: '2024-07-15',
          endDate: '2024-08-15',
          progress: 65,
          nextSession: '2024-07-25T19:00:00',
          assignedStaff: {
            name: 'Trainer Alex',
            avatar: undefined
          }
        },
        {
          id: '2',
          bookingNumber: 'RK240718002',
          serviceName: 'Tối ưu tài nguyên',
          tierName: 'Pro',
          status: 'pending',
          startDate: '2024-07-20',
          endDate: '2024-07-27',
          progress: 0,
          assignedStaff: {
            name: 'Manager Sarah'
          }
        }
      ]
      
      setBookings(mockBookings)
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ đang hoạt động')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-orange-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Chờ bắt đầu',
      in_progress: 'Đang thực hiện',
      paused: 'Tạm dừng',
      completed: 'Hoàn thành'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString))
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ đang hoạt động</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <LoadingSpinner text="Đang tải..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ đang hoạt động</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchActiveBookings}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dịch vụ đang hoạt động</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Bạn chưa có dịch vụ nào đang hoạt động</p>
            <Link
              href="/services"
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Đặt dịch vụ mới
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Dịch vụ đang hoạt động
        </CardTitle>
        <p className="text-sm text-gray-600">
          {bookings.length} dịch vụ đang được thực hiện
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {bookings.map((booking) => (
            <Link 
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
              className="block hover:bg-gray-50 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {booking.serviceName}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="font-medium">{booking.tierName}</span>
                      <span>•</span>
                      <span>#{booking.bookingNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </div>
                      {booking.assignedStaff && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                            {booking.assignedStaff.avatar ? (
                              <img 
                                src={booking.assignedStaff.avatar} 
                                alt={booking.assignedStaff.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(booking.assignedStaff.name)
                            )}
                          </div>
                          <span>{booking.assignedStaff.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {booking.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium">{booking.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${booking.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Next session info */}
                {booking.nextSession && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">
                        Phiên tiếp theo: {formatDateTime(booking.nextSession)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* View all bookings link */}
        <div className="p-4 border-t bg-gray-50">
          <Link 
            href="/dashboard/bookings"
            className="block text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Xem tất cả dịch vụ →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}