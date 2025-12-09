import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { notFound } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  const booking = await prisma.bookings.findUnique({
    where: {
      id: params.id,
      user_id: user.id // Ensure user owns the booking
    },
    include: {
      users: true,
      service_tiers: {
        include: {
          services: true
        }
      },
      payments: true
    }
  })

  if (!booking) {
    return notFound()
  }

  const totalPaid = booking.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="min-h-screen bg-white p-8 text-black print:p-0">
      <div className="mx-auto max-w-3xl border border-gray-200 p-8 print:border-0">
        {/* Header */}
        <div className="mb-8 flex justify-between border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HÓA ĐƠN</h1>
            <p className="text-sm text-gray-500">#{booking.booking_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-rok-gold text-xl font-bold">RoK Services</h2>
            <p className="text-sm text-gray-500">Rise of Kingdoms Professional Services</p>
            <p className="text-sm text-gray-500">support@rokdbot.com</p>
          </div>
        </div>

        {/* Info */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-2 text-sm font-bold uppercase text-gray-500">Khách hàng</h3>
            <p className="font-medium">{booking.users.full_name || booking.users.email}</p>
            <p className="text-sm text-gray-500">{booking.users.email}</p>
            {booking.users.phone && <p className="text-sm text-gray-500">{booking.users.phone}</p>}
          </div>
          <div className="text-right">
            <h3 className="mb-2 text-sm font-bold uppercase text-gray-500">Chi tiết</h3>
            <p className="text-sm">
              <span className="font-medium">Ngày đặt:</span>{' '}
              {format(booking.created_at, 'dd/MM/yyyy', { locale: vi })}
            </p>
            <p className="text-sm">
              <span className="font-medium">Trạng thái:</span>{' '}
              <span className="uppercase">{booking.status}</span>
            </p>
          </div>
        </div>

        {/* Items */}
        <table className="mb-8 w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-bold uppercase text-gray-500">
              <th className="py-3">Dịch vụ</th>
              <th className="py-3 text-right">Đơn giá</th>
              <th className="py-3 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4">
                <p className="font-medium">{booking.service_tiers.services.name}</p>
                <p className="text-sm text-gray-500">{booking.service_tiers.name}</p>
              </td>
              <td className="py-4 text-right">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Number(booking.total_amount)
                )}
              </td>
              <td className="py-4 text-right">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Number(booking.total_amount)
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="mb-8 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tạm tính:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Number(booking.total_amount)
                )}
              </span>
            </div>
            {Number(booking.discount_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Giảm giá:</span>
                <span className="font-medium text-green-600">
                  -
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    Number(booking.discount_amount)
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
              <span>Tổng cộng:</span>
              <span className="text-rok-gold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  Number(booking.final_amount)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Đã thanh toán:</span>
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  totalPaid
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của RoK Services!</p>
        </div>
      </div>

      <div className="mt-8 text-center print:hidden">
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => window.print()}
        >
          In hóa đơn / Lưu PDF
        </button>
      </div>
    </div>
  )
}
