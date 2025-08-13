'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  ArrowLeftIcon,
  CalendarIcon, 
  ClockIcon, 
  CreditCardIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
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
  bookingDetails: any
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
  useEffect(() => {
    if (session?.user && params.id) {
      fetchBookingDetail()
    }
  }, [session, params.id])
  const fetchBookingDetail = async () => {
    try {
      const response = await fetch(`/api/user/bookings/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data.booking)
      } else if (response.status === 404) {
        router.push('/dashboard/bookings')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
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
  if (!booking) {
    return null
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
          {booking.status === 'pending' && 'Chờ xử lý'}
          {booking.status === 'processing' && 'Đang xử lý'}
          {booking.status === 'completed' && 'Hoàn thành'}
          {booking.status === 'cancelled' && 'Đã hủy'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin dịch vụ</h2>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-rok-gold/10 flex items-center justify-center">
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
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thời gian thực hiện</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-500">Bắt đầu:</span>
                  <span className="ml-2 text-gray-900">
                    {format(new Date(booking.startDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
                {booking.endDate && (
                  <div className="flex items-center text-sm">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
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
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Yêu cầu của khách hàng</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.customerRequirements}</p>
            </div>
          )}
          {/* Game Details */}
          {booking.bookingDetails && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin game</h2>
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
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Chat với nhân viên</h2>
            <BookingChat bookingId={booking.id} />
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Thanh toán</h2>
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
                    -{new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.discountAmount)}
                  </dd>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <dt className="text-base font-medium text-gray-900">Tổng cộng</dt>
                  <dd className="text-base font-medium text-rok-gold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.finalAmount)}
                  </dd>
                </div>
              </div>
            </dl>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trạng thái</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
            {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' && (
              <div className="mt-4">
                <Link
                  href={`/dashboard/payments/new?booking=${booking.id}`}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rok-gold hover:bg-rok-gold-dark"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Thanh toán ngay
                </Link>
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Hành động</h2>
            <div className="space-y-3">
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                Liên hệ hỗ trợ
              </button>
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Xuất hóa đơn
              </button>
              {booking.status === 'pending' && (
                <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}