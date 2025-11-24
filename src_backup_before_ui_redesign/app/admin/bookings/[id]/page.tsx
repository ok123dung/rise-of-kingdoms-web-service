import { ArrowLeft, CreditCard, User, Mail, Phone, Shield, FileText } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import BookingActions from '@/components/admin/BookingActions'
import { prisma } from '@/lib/db'

async function getBooking(id: string): Promise<any> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      serviceTier: {
        include: { service: true }
      },
      payments: true,
      convertedLead: true
    }
  })

  if (!booking) notFound()
  return booking
}

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            className="rounded-full p-2 transition-colors hover:bg-gray-100"
            href="/admin/bookings"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.bookingNumber}</h1>
            <p className="text-sm text-gray-500">
              Tạo ngày {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <BookingActions booking={booking} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Service Details */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Thông tin dịch vụ
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Dịch vụ</p>
                <p className="font-medium text-gray-900">{booking.serviceTier.service.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gói (Tier)</p>
                <p className="font-medium text-gray-900">{booking.serviceTier.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giá trị</p>
                <p className="font-medium text-gray-900">
                  {Number(booking.finalAmount).toLocaleString()} VNĐ
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${
                    booking.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Requirements */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <FileText className="mr-2 h-5 w-5 text-amber-500" />
              Yêu cầu khách hàng
            </h2>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="whitespace-pre-wrap text-gray-700">
                {booking.customerRequirements || 'Không có ghi chú thêm'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <User className="mr-2 h-5 w-5 text-purple-500" />
              Khách hàng
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  {booking.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.user.fullName}</p>
                  <p className="text-xs text-gray-500">ID: {booking.user.id.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  {booking.user.email}
                </div>
                {booking.user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {booking.user.phone}
                  </div>
                )}
                {booking.user.rokKingdom && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="mr-2 h-4 w-4" />
                    Kingdom #{booking.user.rokKingdom}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <CreditCard className="mr-2 h-5 w-5 text-green-500" />
              Thanh toán
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Trạng thái</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${
                    booking.paymentStatus === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.paymentStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.paymentStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-gray-900">Tổng cộng</span>
                <span className="font-bold text-green-600">
                  {Number(booking.finalAmount).toLocaleString()} đ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
