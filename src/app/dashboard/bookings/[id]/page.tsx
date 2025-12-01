'use client'
import { useState, useEffect, useCallback } from 'react'

import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { BookingChat } from '@/components/BookingChat'

interface BookingDetail {
  id: string
  bookingNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  finalAmount: number
  discountAmount: number
  createdAt: string
  startDate: string | null
  endDate: string | null
  customerRequirements: string | null
  bookingDetails: Record<string, unknown> | null
  serviceTier: {
    name: string
    description: string
    service: {
      name: string
      icon: string
      description: string
    }
  }
  user: {
    fullName: string
    email: string
    phone: string | null
  }
  payments: Array<{
    id: string
    paymentNumber: string
    amount: number
    status: string
    paymentMethod: string
    createdAt: string
  }>
}
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}
export default function BookingDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const fetchBookingDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/bookings/${String(params.id)}`)
      if (response.ok) {
        const data = (await response.json()) as { booking: BookingDetail }
        setBooking(data.booking)
      } else if (response.status === 404) {
        router.push('/dashboard/bookings')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error fetching booking:', message)
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (session?.user && params.id) {
      void fetchBookingDetail()
    }
  }, [session, params.id, fetchBookingDetail])

  const handleCancelBooking = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch(`/api/user/bookings/${booking?.id}/cancel`, {
        method: 'POST'
      })
      const data = (await response.json()) as { message?: string }

      if (response.ok) {
        // Refresh booking data
        void fetchBookingDetail()
        // eslint-disable-next-line no-alert
        alert('Đã hủy đơn hàng thành công')
      } else {
        // eslint-disable-next-line no-alert
        alert(data.message ?? 'Không thể hủy đơn hàng')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error cancelling booking:', message)
      // eslint-disable-next-line no-alert
      alert('Có lỗi xảy ra khi hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-rok-gold h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    )
  }
  if (!booking) {
    return null
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            href="/dashboard/bookings"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết đơn hàng #{booking.bookingNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Đặt ngày {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}
        >
          {booking.status === 'pending' && 'Chờ xử lý'}
          {booking.status === 'processing' && 'Đang xử lý'}
          {booking.status === 'completed' && 'Hoàn thành'}
          {booking.status === 'cancelled' && 'Đã hủy'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Service Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Thông tin dịch vụ</h2>
            <div className="flex items-start space-x-4">
              <div className="bg-rok-gold/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                <span className="text-3xl">{booking.serviceTier.service.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900">
                  {booking.serviceTier.service.name} - {booking.serviceTier.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{booking.serviceTier.description}</p>
              </div>
            </div>
          </div>
          {/* Timeline */}
          {booking.startDate && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Thời gian thực hiện</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">Bắt đầu:</span>
                  <span className="ml-2 text-gray-900">
                    {format(new Date(booking.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
                {booking.endDate && (
                  <div className="flex items-center text-sm">
                    <ClockIcon className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="text-gray-500">Dự kiến hoàn thành:</span>
                    <span className="ml-2 text-gray-900">
                      {format(new Date(booking.endDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Requirements */}
          {booking.customerRequirements && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Yêu cầu của khách hàng</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {booking.customerRequirements}
              </p>
            </div>
          )}
          {/* Game Details */}
          {booking.bookingDetails && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Thông tin game</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                {Object.entries(booking.bookingDetails).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                    <dd className="mt-1 text-sm text-gray-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {/* Live Chat */}
          <div className="rounded-lg bg-white p-6 shadow" id="booking-chat">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Chat với nhân viên</h2>
            <BookingChat bookingId={booking.id} />
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Thanh toán</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Tạm tính</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(booking.totalAmount)}
                </dd>
              </div>
              {booking.discountAmount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Giảm giá</dt>
                  <dd className="text-sm font-medium text-green-600">
                    -
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.discountAmount)}
                  </dd>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Tổng cộng</dt>
                  <dd className="text-rok-gold text-base font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.finalAmount)}
                  </dd>
                </div>
              </div>
            </dl>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trạng thái</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
            {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
              <div className="mt-4">
                <Link
                  className="bg-rok-gold hover:bg-rok-gold-dark inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
                  href={`/dashboard/payments/new?booking=${booking.id}`}
                >
                  <CreditCardIcon className="mr-2 h-4 w-4" />
                  Thanh toán ngay
                </Link>
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Hành động</h2>
            <div className="space-y-3">
              <button
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                onClick={() => {
                  document.getElementById('booking-chat')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <ChatBubbleLeftRightIcon className="mr-2 h-4 w-4" />
                Liên hệ hỗ trợ
              </button>
              <Link
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                href={`/dashboard/bookings/${booking.id}/invoice`}
                target="_blank"
              >
                <DocumentTextIcon className="mr-2 h-4 w-4" />
                Xuất hóa đơn
              </Link>
              {booking.status === 'pending' && (
                <button
                  className="inline-flex w-full items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 disabled:opacity-50"
                  disabled={cancelling}
                  onClick={() => void handleCancelBooking()}
                >
                  {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
