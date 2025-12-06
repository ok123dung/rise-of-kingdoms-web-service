import { Eye } from 'lucide-react'
import Link from 'next/link'

import SearchInput from '@/components/admin/SearchInput'
import { prisma } from '@/lib/db'
import type { BookingWhereInput } from '@/types/prisma'

export const dynamic = 'force-dynamic'

async function getBookings(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1
  const limit = 10
  const skip = (page - 1) * limit
  const status = searchParams.status as string | undefined
  const query = searchParams.query as string | undefined

  const where: BookingWhereInput = {}

  if (status && status !== 'all') {
    where.status = status
  }

  if (query) {
    where.OR = [
      { booking_number: { contains: query, mode: 'insensitive' } },
      { user: { email: { contains: query, mode: 'insensitive' } } },
      { user: { full_name: { contains: query, mode: 'insensitive' } } }
    ]
  }

  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: true,
        service_tiers: {
          include: { services: true }
        }
      }
    }),
    prisma.bookings.count({ where })
  ])

  return { bookings, total, totalPages: Math.ceil(total / limit) }
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { color: string; text: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' },
    confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Đã xác nhận' },
    in_progress: { color: 'bg-purple-100 text-purple-800', text: 'Đang thực hiện' },
    completed: { color: 'bg-green-100 text-green-800', text: 'Hoàn thành' },
    cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
    refunded: { color: 'bg-gray-100 text-gray-800', text: 'Đã hoàn tiền' }
  }
  const config = statusConfig[status] || statusConfig.pending
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.text}
    </span>
  )
}

export default async function BookingsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { bookings, total, totalPages } = await getBookings(searchParams)
  const currentPage = Number(searchParams.page) || 1
  const currentStatus = (searchParams.status as string) || 'all'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Booking ({total})</h1>
        <div className="flex space-x-2">
          <SearchInput />
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
          <Link
            key={status}
            href={`/admin/bookings?status=${status}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              currentStatus === status
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Mã Booking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Dịch vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Giá trị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {bookings.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={7}>
                  Không tìm thấy booking nào
                </td>
              </tr>
            ) : (
              bookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {booking.booking_number}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.users.full_name}</div>
                    <div className="text-sm text-gray-500">{booking.users.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {booking.service_tiers.services.name}
                    <span className="ml-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {booking.service_tiers.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {Number(booking.final_amount).toLocaleString()} đ
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(booking.status)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      className="text-blue-600 hover:text-blue-900"
                      href={`/admin/bookings/${booking.id}`}
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/bookings?page=${p}&status=${currentStatus}`}
              className={`rounded px-3 py-1 ${
                currentPage === p
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
