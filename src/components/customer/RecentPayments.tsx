'use client'

import { memo, useMemo } from 'react'

import { CreditCard, CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentPayment {
  id: string
  payment_number: string
  booking_id: string
  serviceName: string
  amount: number
  status: string
  method: string
  created_at: string
  paid_at: string | null
}

interface RecentPaymentsProps {
  payments: RecentPayment[]
}

// Helper functions moved outside component
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'refunded':
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const STATUS_TEXT_MAP = {
  completed: 'Thành công',
  pending: 'Đang xử lý',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền'
} as const

const STATUS_COLOR_MAP = {
  completed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200'
} as const

const METHOD_TEXT_MAP = {
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
  bank_transfer: 'Chuyển khoản'
} as const

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const formatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

// Memoized payment item component
const PaymentItem = memo(({ payment }: { payment: RecentPayment }) => {
  const statusColor = useMemo(
    () => STATUS_COLOR_MAP[payment.status as keyof typeof STATUS_COLOR_MAP] || 'bg-gray-100 text-gray-800 border-gray-200',
    [payment.status]
  )
  const statusText = useMemo(
    () => STATUS_TEXT_MAP[payment.status as keyof typeof STATUS_TEXT_MAP] || payment.status,
    [payment.status]
  )
  const methodText = useMemo(
    () => METHOD_TEXT_MAP[payment.method as keyof typeof METHOD_TEXT_MAP] || payment.method,
    [payment.method]
  )
  const amountColorClass = useMemo(() => {
    if (payment.status === 'completed') return 'text-green-600'
    if (payment.status === 'failed') return 'text-red-600'
    return 'text-gray-600'
  }, [payment.status])

  return (
    <Link className="block transition-colors hover:bg-gray-50" href={`/dashboard/payments/${payment.id}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${statusColor}`}>
                {getStatusIcon(payment.status)}
                {statusText}
              </span>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">{methodText}</span>
            </div>
            <h4 className="mb-1 font-medium text-gray-900">{payment.serviceName}</h4>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="space-y-1">
                <p>#{payment.payment_number}</p>
                <p className="text-xs">
                  {payment.paid_at ? `Thanh toán: ${formatDateTime(payment.paid_at)}` : `Tạo: ${formatDateTime(payment.created_at)}`}
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className={`font-bold ${amountColorClass}`}>{formatVND(payment.amount)}</div>
            <div className="mt-1 flex items-center gap-1">
              <Eye className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">Chi tiết</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

PaymentItem.displayName = 'PaymentItem'

function RecentPayments({ payments }: RecentPaymentsProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán gần đây</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <div className="text-center text-gray-500">
            <CreditCard className="mx-auto mb-2 h-12 w-12 text-gray-300" />
            <p className="text-sm">Bạn chưa có giao dịch thanh toán nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Thanh toán gần đây
        </CardTitle>
        <p className="text-sm text-gray-600">{payments.length} giao dịch gần nhất</p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {payments.map(payment => (
            <PaymentItem key={payment.id} payment={payment} />
          ))}
        </div>

        <div className="border-t bg-gray-50 p-4">
          <Link className="block text-center text-sm font-medium text-amber-600 hover:text-amber-800" href="/dashboard/payments">
            Xem tất cả giao dịch →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(RecentPayments)
