'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { CreditCard, CheckCircle, XCircle, Clock, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'

interface RecentPayment {
  id: string
  paymentNumber: string
  bookingId: string
  serviceName: string
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  method: 'momo' | 'zalopay' | 'vnpay' | 'bank_transfer'
  createdAt: string
  paidAt?: string
}

interface RecentPaymentsProps {
  userId?: string
}

export default function RecentPayments({ userId }: RecentPaymentsProps) {
  const [payments, setPayments] = useState<RecentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentPayments()
  }, [])

  const fetchRecentPayments = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock recent payments data
      const mockPayments: RecentPayment[] = [
        {
          id: '1',
          paymentNumber: 'PAY24072001',
          bookingId: 'RK240720001',
          serviceName: 'Coaching KvK chuyên sâu',
          amount: 2250000,
          status: 'completed',
          method: 'momo',
          createdAt: '2024-07-20T14:30:00',
          paidAt: '2024-07-20T14:32:00'
        },
        {
          id: '2',
          paymentNumber: 'PAY24071802',
          bookingId: 'RK240718002',
          serviceName: 'Tối ưu tài nguyên',
          amount: 1650000,
          status: 'completed',
          method: 'zalopay',
          createdAt: '2024-07-18T16:45:00',
          paidAt: '2024-07-18T16:47:00'
        },
        {
          id: '3',
          paymentNumber: 'PAY24071503',
          bookingId: 'RK240715003',
          serviceName: 'Quản lý guild nâng cao',
          amount: 3200000,
          status: 'failed',
          method: 'vnpay',
          createdAt: '2024-07-15T10:20:00'
        }
      ]
      
      setPayments(mockPayments)
    } catch (err) {
      setError('Không thể tải lịch sử thanh toán')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán gần đây</CardTitle>
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
          <CardTitle>Thanh toán gần đây</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchRecentPayments}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thanh toán gần đây</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
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
        <p className="text-sm text-gray-600">
          {payments.length} giao dịch gần nhất
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {payments.map((payment) => (
            <Link 
              key={payment.id}
              href={`/dashboard/payments/${payment.id}`}
              className="block hover:bg-gray-50 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {getStatusText(payment.status)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getMethodText(payment.method)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">
                      {payment.serviceName}
                    </h4>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="space-y-1">
                        <p>#{payment.paymentNumber}</p>
                        <p className="text-xs">
                          {payment.paidAt ? `Thanh toán: ${formatDateTime(payment.paidAt)}` : `Tạo: ${formatDateTime(payment.createdAt)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={`font-bold ${
                      payment.status === 'completed' ? 'text-green-600' :
                      payment.status === 'failed' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {formatVND(payment.amount)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
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
        <div className="p-4 border-t bg-gray-50">
          <Link 
            href="/dashboard/payments"
            className="block text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Xem tất cả giao dịch →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}