import { Eye } from 'lucide-react'
import Link from 'next/link'

import { prisma } from '@/lib/db'

async function getRecentBookings() {
  return await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      serviceTier: {
        include: {
          service: true
        }
      },
      payments: {
        where: { status: 'completed' },
        take: 1
      }
    }
  })
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
    confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Đã xác nhận' },
    in_progress: { color: 'bg-purple-100 text-purple-800', text: 'Đang thực hiện' },
    completed: { color: 'bg-green-100 text-green-800', text: 'Hoàn thành' },
    cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
    refunded: { color: 'bg-gray-100 text-gray-800', text: 'Đã hoàn tiền' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  )
}

function getPaymentStatusBadge(paymentStatus: string) {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ thanh toán' },
    completed: { color: 'bg-green-100 text-green-800', text: 'Đã thanh toán' },
    failed: { color: 'bg-red-100 text-red-800', text: 'Thất bại' },
    refunded: { color: 'bg-gray-100 text-gray-800', text: 'Đã hoàn tiền' }
  }

  const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  )
}

export default async function RecentBookings() {
  const bookings = await getRecentBookings()

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Bookings gần đây</h3>
          <Link
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            href="/admin/bookings"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200" role="list">
            {bookings.length === 0 ? (
              <li className="py-4">
                <div className="text-center text-gray-500">
                  <p>Chưa có booking nào</p>
                </div>
              </li>
            ) : (
              bookings.map(booking => (
                <li key={booking.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          {booking.user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {booking.user.fullName}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(booking.status)}
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-gray-500">
                          {booking.serviceTier.service.name} - {booking.serviceTier.name}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {Number(booking.finalAmount).toLocaleString()} VNĐ
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{booking.bookingNumber}</p>
                        <p className="text-xs text-gray-400">
                          {new Intl.DateTimeFormat('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(new Date(booking.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        className="inline-flex items-center rounded-full bg-white p-1.5 text-gray-400 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        href={`/admin/bookings/${booking.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
