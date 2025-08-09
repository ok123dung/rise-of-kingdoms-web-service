'use client'

export default function PaymentAnalytics() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-6 text-lg font-semibold">Thống kê thanh toán</h3>

      <div className="mb-8">
        <h4 className="mb-4 text-sm font-medium text-gray-700">Doanh thu theo tháng</h4>
        <div className="flex h-64 items-center justify-center rounded bg-gray-100">
          <span className="text-gray-500">📊 Biểu đồ doanh thu</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <span>M</span>
          </div>
          <div className="font-medium">MoMo</div>
          <div className="text-sm text-gray-600">45%</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <span>V</span>
          </div>
          <div className="font-medium">VNPay</div>
          <div className="text-sm text-gray-600">35%</div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-200">
            <span>Z</span>
          </div>
          <div className="font-medium">ZaloPay</div>
          <div className="text-sm text-gray-600">20%</div>
        </div>
      </div>
    </div>
  )
}
