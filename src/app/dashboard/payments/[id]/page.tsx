'use client'
import { useState, useEffect, useCallback } from 'react'

import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface PaymentDetail {
  id: string
  payment_number: string
  amount: number
  status: string
  payment_method: string
  payment_gateway: string
  gateway_transaction_id: string | null
  gateway_order_id: string | null
  gateway_response: Record<string, unknown> | null
  created_at: string
  paid_at: string | null
  bookings: {
    id: string
    booking_number: string
    status: string
    user_id: string
    service_tiers: {
      name: string
      description: string
      services: {
        name: string
        icon: string
      }
    }
    users: {
      full_name: string
      email: string
    }
  }
}

interface PaymentDetailResponse {
  payment: PaymentDetail
}
const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-100',
    text: 'Chờ thanh toán'
  },
  completed: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-100',
    text: 'Thành công'
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-100',
    text: 'Thất bại'
  },
  cancelled: {
    icon: XCircleIcon,
    color: 'text-gray-600 bg-gray-100',
    text: 'Đã hủy'
  }
}
const payment_methodNames: Record<string, string> = {
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
  bank_transfer: 'Chuyển khoản ngân hàng',
  cash: 'Tiền mặt'
}
export default function PaymentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchPaymentDetail = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/payments/${String(params.id)}`)
      if (response.ok) {
        const data = (await response.json()) as PaymentDetailResponse
        setPayment(data.payment)
      } else if (response.status === 404) {
        router.push('/dashboard/payments')
      }
    } catch (error) {
      console.error('Error fetching payment:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (session?.user && params.id) {
      void fetchPaymentDetail()
    }
  }, [session, params.id, fetchPaymentDetail])
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const retryPayment = () => {
    if (payment) {
      router.push(`/dashboard/payments/new?booking=${payment.bookings.id}`)
    }
  }
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-rok-gold h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    )
  }
  if (!payment) {
    return null
  }
  const config = statusConfig[payment.status as keyof typeof statusConfig]
  const StatusIcon = config.icon
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            href="/dashboard/payments"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết thanh toán #{payment.payment_number}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tạo lúc {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
        </div>
        <div className={`inline-flex items-center rounded-full px-3 py-1 ${config.color}`}>
          <StatusIcon className="mr-1 h-5 w-5" />
          <span className="text-sm font-medium">{config.text}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Payment Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Thông tin thanh toán</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Phương thức</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {payment_methodNames[payment.payment_method] || payment.payment_method}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cổng thanh toán</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.payment_gateway}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Số tiền</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(payment.amount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                  >
                    {config.text}
                  </span>
                </dd>
              </div>
              {payment.gateway_transaction_id && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Mã giao dịch</dt>
                  <dd className="mt-1 flex items-center">
                    <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-900">
                      {payment.gateway_transaction_id}
                    </code>
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={() => copyToClipboard(payment.gateway_transaction_id!)}
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    {copied && <span className="ml-2 text-xs text-green-600">Đã sao chép!</span>}
                  </dd>
                </div>
              )}
              {payment.paid_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Thời gian thanh toán</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(payment.paid_at), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {/* Related Booking */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Đơn hàng liên quan</h2>
            <Link
              className="-m-2 block rounded-lg p-2 transition-colors hover:bg-gray-50"
              href={`/dashboard/bookings/${payment.bookings.id}`}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-rok-gold/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                  <span className="text-2xl">{payment.bookings.service_tiers.services.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {payment.bookings.service_tiers.services.name} -{' '}
                    {payment.bookings.service_tiers.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Mã đơn: #{payment.bookings.booking_number}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Trạng thái:
                    <span className="ml-1 font-medium">
                      {payment.bookings.status === 'completed' && 'Hoàn thành'}
                      {payment.bookings.status === 'processing' && 'Đang xử lý'}
                      {payment.bookings.status === 'pending' && 'Chờ xử lý'}
                      {payment.bookings.status === 'cancelled' && 'Đã hủy'}
                    </span>
                  </p>
                </div>
                <div className="text-rok-gold text-sm">Xem chi tiết →</div>
              </div>
            </Link>
          </div>
          {/* Gateway Response (for debugging, only show in development) */}
          {process.env.NODE_ENV === 'development' && payment.gateway_response && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Gateway Response (Dev Only)
              </h2>
              <pre className="overflow-auto rounded bg-gray-50 p-4 text-xs text-gray-600">
                {JSON.stringify(payment.gateway_response, null, 2)}
              </pre>
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Hành động</h2>
            <div className="space-y-3">
              {payment.status === 'failed' && (
                <button
                  className="bg-rok-gold hover:bg-rok-gold-dark inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
                  onClick={retryPayment}
                >
                  <ArrowPathIcon className="mr-2 h-4 w-4" />
                  Thử lại thanh toán
                </button>
              )}
              <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                Xuất biên lai
              </button>
              <Link
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                href="/dashboard/support"
              >
                Báo cáo vấn đề
              </Link>
            </div>
          </div>
          {/* Customer Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Thông tin khách hàng</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.bookings.users.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.bookings.users.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
