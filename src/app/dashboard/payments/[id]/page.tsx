'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
interface PaymentDetail {
  id: string
  paymentNumber: string
  amount: number
  status: string
  paymentMethod: string
  paymentGateway: string
  gatewayTransactionId: string | null
  gatewayOrderId: string | null
  gatewayResponse: any
  createdAt: string
  paidAt: string | null
  booking: {
    id: string
    bookingNumber: string
    status: string
    serviceTier: {
      name: string
      description: string
      service: {
        name: string
        icon: string
      }
    }
    user: {
      fullName: string
      email: string
    }
  }
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
const paymentMethodNames: Record<string, string> = {
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
  useEffect(() => {
    if (session?.user && params.id) {
      fetchPaymentDetail()
    }
  }, [session, params.id])
  const fetchPaymentDetail = async () => {
    try {
      const response = await fetch(`/api/user/payments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPayment(data.payment)
      } else if (response.status === 404) {
        router.push('/dashboard/payments')
      }
    } catch (error) {
      console.error('Error fetching payment:', error)
    } finally {
      setLoading(false)
    }
  }
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const retryPayment = () => {
    if (payment) {
      router.push(`/dashboard/payments/new?booking=${payment.booking.id}`)
    }
  }
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rok-gold"></div>
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
            href="/dashboard/payments"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết thanh toán #{payment.paymentNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Tạo lúc {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${config.color}`}>
          <StatusIcon className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">{config.text}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin thanh toán</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Phương thức</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {paymentMethodNames[payment.paymentMethod] || payment.paymentMethod}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cổng thanh toán</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.paymentGateway}</dd>
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    {config.text}
                  </span>
                </dd>
              </div>
              {payment.gatewayTransactionId && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Mã giao dịch</dt>
                  <dd className="mt-1 flex items-center">
                    <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {payment.gatewayTransactionId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(payment.gatewayTransactionId!)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    {copied && <span className="ml-2 text-xs text-green-600">Đã sao chép!</span>}
                  </dd>
                </div>
              )}
              {payment.paidAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Thời gian thanh toán</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {/* Related Booking */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Đơn hàng liên quan</h2>
            <Link 
              href={`/dashboard/bookings/${payment.booking.id}`}
              className="block hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-rok-gold/10 flex items-center justify-center">
                  <span className="text-2xl">{payment.booking.serviceTier.service.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {payment.booking.serviceTier.service.name} - {payment.booking.serviceTier.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Mã đơn: #{payment.booking.bookingNumber}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Trạng thái: 
                    <span className="ml-1 font-medium">
                      {payment.booking.status === 'completed' && 'Hoàn thành'}
                      {payment.booking.status === 'processing' && 'Đang xử lý'}
                      {payment.booking.status === 'pending' && 'Chờ xử lý'}
                      {payment.booking.status === 'cancelled' && 'Đã hủy'}
                    </span>
                  </p>
                </div>
                <div className="text-sm text-rok-gold">
                  Xem chi tiết →
                </div>
              </div>
            </Link>
          </div>
          {/* Gateway Response (for debugging, only show in development) */}
          {process.env.NODE_ENV === 'development' && payment.gatewayResponse && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Gateway Response (Dev Only)</h2>
              <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 p-4 rounded">
                {JSON.stringify(payment.gatewayResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Hành động</h2>
            <div className="space-y-3">
              {payment.status === 'failed' && (
                <button
                  onClick={retryPayment}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rok-gold hover:bg-rok-gold-dark"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Thử lại thanh toán
                </button>
              )}
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                Xuất biên lai
              </button>
              <Link
                href="/dashboard/support"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Báo cáo vấn đề
              </Link>
            </div>
          </div>
          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.booking.user.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{payment.booking.user.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}