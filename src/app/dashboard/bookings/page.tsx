'use client'
import { useState, useEffect, useCallback } from 'react'

import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface Booking {
  id: string
  booking_number: string
  service_tiers: {
    name: string
    service: {
      name: string
      slug: string
    }
  }
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  start_date: string | null
  end_date: string | null
}
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}
const payment_statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}
// Helper to get service icon based on slug
const getServiceIcon = (slug: string) => {
  switch (slug) {
    case 'kvk-pilot':
      return '⚔️'
    case 'account-care':
      return '🛡️'
    case 'event-push':
      return '🎯'
    case 'equipment-crafting':
      return '⚒️'
    default:
      return '🎮'
  }
}

export default function BookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/user/bookings')
      if (response.ok) {
        const data = (await response.json()) as { bookings?: Booking[] }
        setBookings(data.bookings ?? [])
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error fetching bookings:', message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      void fetchBookings()
    }
  }, [session, fetchBookings])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-rok-gold h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đơn hàng</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách đặt dịch vụ đầu tiên.</p>
          <div className="mt-6">
            <Link
              className="bg-rok-gold hover:bg-rok-gold-dark inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
              href="/services"
            >
              Xem dịch vụ
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <li key={booking.id}>
                <Link className="block hover:bg-gray-50" href={`/dashboard/bookings/${booking.id}`}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-rok-gold/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                          <span className="text-2xl">
                            {getServiceIcon(booking.service_tiers.services.slug || '')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.service_tiers.services.name} - {booking.service_tiers.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Mã đơn: {booking.booking_number}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(booking.total_amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.created_at), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}
                          >
                            {booking.status === 'pending' && 'Chờ xử lý'}
                            {booking.status === 'processing' && 'Đang xử lý'}
                            {booking.status === 'completed' && 'Hoàn thành'}
                            {booking.status === 'cancelled' && 'Đã hủy'}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${payment_statusColors[booking.payment_status as keyof typeof payment_statusColors]}`}
                          >
                            {booking.payment_status === 'pending' && 'Chưa thanh toán'}
                            {booking.payment_status === 'paid' && 'Đã thanh toán'}
                            {booking.payment_status === 'failed' && 'Thanh toán thất bại'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {booking.start_date && (
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                            Bắt đầu:{' '}
                            {format(new Date(booking.start_date), 'dd/MM/yyyy HH:mm', {
                              locale: vi
                            })}
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
