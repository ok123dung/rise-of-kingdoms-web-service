'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
interface Booking {
  id: string
  bookingNumber: string
  serviceTier: {
    name: string
    service: {
      name: string
      icon: string
    }
  }
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  startDate: string | null
  endDate: string | null
}
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}
const paymentStatusColors = {
  pending: 'bg-gray-100 text-gray-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}
export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (session?.user) {
      fetchBookings()
    }
  }, [session])
  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/user/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rok-gold"></div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </p>
      </div>
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đơn hàng</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách đặt dịch vụ đầu tiên.</p>
          <div className="mt-6">
            <Link
              href="/services"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rok-gold hover:bg-rok-gold-dark"
            >
              Xem dịch vụ
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <Link href={`/dashboard/bookings/${booking.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-rok-gold/10 flex items-center justify-center">
                          <span className="text-2xl">{booking.serviceTier.service.icon}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.serviceTier.service.name} - {booking.serviceTier.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Mã đơn: {booking.bookingNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(booking.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.createdAt), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                            {booking.status === 'pending' && 'Chờ xử lý'}
                            {booking.status === 'processing' && 'Đang xử lý'}
                            {booking.status === 'completed' && 'Hoàn thành'}
                            {booking.status === 'cancelled' && 'Đã hủy'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors]}`}>
                            {booking.paymentStatus === 'pending' && 'Chưa thanh toán'}
                            {booking.paymentStatus === 'paid' && 'Đã thanh toán'}
                            {booking.paymentStatus === 'failed' && 'Thanh toán thất bại'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {booking.startDate && (
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            Bắt đầu: {format(new Date(booking.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}