'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CreditCardIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Payment {
  id: string
  paymentNumber: string
  amount: number
  status: string
  paymentMethod: string
  paymentGateway: string
  createdAt: string
  paidAt: string | null
  booking: {
    id: string
    bookingNumber: string
    serviceTier: {
      name: string
      service: {
        name: string
        icon: string
      }
    }
  }
}

const statusIcons = {
  pending: ClockIcon,
  completed: CheckCircleIcon,
  failed: XCircleIcon,
  cancelled: XCircleIcon
}

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-100',
  completed: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
  cancelled: 'text-gray-600 bg-gray-100'
}

const paymentMethodNames: Record<string, string> = {
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
  bank_transfer: 'Chuyển khoản',
  cash: 'Tiền mặt'
}

export default function PaymentsPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (session?.user) {
      fetchPayments()
    }
  }, [session, filter])

  const fetchPayments = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/user/payments'
        : `/api/user/payments?status=${filter}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: 'Chờ thanh toán',
      completed: 'Thành công',
      failed: 'Thất bại',
      cancelled: 'Đã hủy'
    }
    return statusTexts[status] || status
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
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử thanh toán</h1>
        <p className="mt-1 text-sm text-gray-500">
          Xem lại tất cả các giao dịch thanh toán của bạn
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === 'all' 
              ? 'bg-rok-gold text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === 'completed' 
              ? 'bg-rok-gold text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Thành công
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === 'pending' 
              ? 'bg-rok-gold text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Đang chờ
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === 'failed' 
              ? 'bg-rok-gold text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Thất bại
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'all' ? 'Chưa có thanh toán nào' : `Không có thanh toán ${getStatusText(filter).toLowerCase()}`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' && 'Các thanh toán của bạn sẽ xuất hiện ở đây.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {payments.map((payment) => {
              const StatusIcon = statusIcons[payment.status as keyof typeof statusIcons]
              const statusColor = statusColors[payment.status as keyof typeof statusColors]
              
              return (
                <li key={payment.id}>
                  <Link href={`/dashboard/payments/${payment.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 p-2 rounded-full ${statusColor}`}>
                            <StatusIcon className="h-6 w-6" />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{payment.booking.serviceTier.service.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {payment.booking.serviceTier.service.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Mã thanh toán: {payment.paymentNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(payment.amount)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {paymentMethodNames[payment.paymentMethod] || payment.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {getStatusText(payment.status)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </p>
                          </div>
                        </div>
                      </div>
                      {payment.booking && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Đơn hàng: #{payment.booking.bookingNumber} - {payment.booking.serviceTier.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}