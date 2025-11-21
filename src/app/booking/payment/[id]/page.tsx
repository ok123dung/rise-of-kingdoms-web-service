import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import PaymentMethods from '@/components/booking/PaymentMethods'
import { Shield, CheckCircle } from 'lucide-react'

async function getBooking(id: string) {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            serviceTier: {
                include: { service: true }
            },
            user: true
        }
    })

    if (!booking) return null
    return booking
}

export default async function PaymentPage({ params }: { params: { id: string } }) {
    const booking = await getBooking(params.id)

    if (!booking) notFound()

    // If already paid, redirect to success
    if (booking.paymentStatus === 'completed') {
        redirect('/booking/success')
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Thanh toán đơn hàng</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Vui lòng hoàn tất thanh toán để kích hoạt dịch vụ
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Order Summary */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5">
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin đơn hàng</h2>
                            <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Mã đơn hàng</span>
                                    <span className="font-medium text-gray-900">{booking.bookingNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dịch vụ</span>
                                    <span className="font-medium text-gray-900">{booking.serviceTier.service.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Gói</span>
                                    <span className="font-medium text-gray-900">{booking.serviceTier.name}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-gray-200 pt-4">
                                    <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                                    <span className="text-lg font-bold text-amber-600">
                                        {Number(booking.finalAmount).toLocaleString()} VNĐ
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Shield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Thanh toán an toàn</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            Giao dịch của bạn được bảo mật 100%. Hoàn tiền trong vòng 24h nếu không hài lòng.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <PaymentMethods booking={booking} />
                    </div>
                </div>
            </div>
        </div>
    )
}
