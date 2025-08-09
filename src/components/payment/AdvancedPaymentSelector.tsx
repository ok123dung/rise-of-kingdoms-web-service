'use client'

export default function AdvancedPaymentSelector() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chọn phương thức thanh toán</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="cursor-pointer rounded-lg border-2 border-gray-300 p-6 hover:border-pink-400">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div className="text-center">
            <div className="mb-2 font-medium">MoMo</div>
            <div className="mb-4 text-sm text-gray-600">Ví điện tử phổ biến</div>
            <div className="text-sm text-pink-600">Ưu đãi 5%</div>
          </div>
        </div>
        <div className="cursor-pointer rounded-lg border-2 border-gray-300 p-6 hover:border-blue-400">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
            <span className="text-xl font-bold text-white">V</span>
          </div>
          <div className="text-center">
            <div className="mb-2 font-medium">VNPay</div>
            <div className="mb-4 text-sm text-gray-600">Thẻ ngân hàng</div>
            <div className="text-sm text-blue-600">Tất cả ngân hàng</div>
          </div>
        </div>
        <div className="cursor-pointer rounded-lg border-2 border-gray-300 p-6 hover:border-blue-600">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <span className="text-xl font-bold text-white">Z</span>
          </div>
          <div className="text-center">
            <div className="mb-2 font-medium">ZaloPay</div>
            <div className="mb-4 text-sm text-gray-600">Ví Zalo</div>
            <div className="text-sm text-blue-600">Nhanh chóng</div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700">
          Tiếp tục thanh toán
        </button>
      </div>
    </div>
  )
}
