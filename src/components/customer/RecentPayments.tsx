'use client'

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

export default function RecentPayments({ payments }: RecentPaymentsProps) {
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

  const getStatusText = (status: string) => {
    const statusMap = {
      completed: 'Thành công',
      pending: 'Đang xử lý',
      failed: 'Thất bại',
      refunded: 'Đã hoàn tiền'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMethodText = (method: string) => {
    const methodMap = {
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      vnpay: 'VNPay',
      bank_transfer: 'Chuyển khoản'
    }
    return methodMap[method as keyof typeof methodMap] || method
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

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
            <Link
              key={payment.id}
              className="block transition-colors hover:bg-gray-50"
              href={`/dashboard/payments/${payment.id}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}
                      >
                        {getStatusIcon(payment.status)}
                        {getStatusText(payment.status)}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                        {getMethodText(payment.method)}
                      </span>
                    </div>

                    <h4 className="mb-1 font-medium text-gray-900">{payment.serviceName}</h4>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="space-y-1">
                        <p>#{payment.payment_number}</p>
                        <p className="text-xs">
                          {payment.paid_at
                            ? `Thanh toán: ${formatDateTime(payment.paid_at)}`
                            : `Tạo: ${formatDateTime(payment.created_at)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div
                      className={`font-bold ${
                        payment.status === 'completed'
                          ? 'text-green-600'
                          : payment.status === 'failed'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {formatVND(payment.amount)}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <Eye className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Chi tiết</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all payments link */}
        <div className="border-t bg-gray-50 p-4">
          <Link
            className="block text-center text-sm font-medium text-amber-600 hover:text-amber-800"
            href="/dashboard/payments"
          >
            Xem tất cả giao dịch →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
