'use client'

export default function AdvancedPaymentSelector() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chọn phương thức thanh toán</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-gray-300 rounded-lg p-6 hover:border-pink-400 cursor-pointer">
          <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div className="text-center">
            <div className="font-medium mb-2">MoMo</div>
            <div className="text-sm text-gray-600 mb-4">Ví điện tử phổ biến</div>
            <div className="text-sm text-pink-600">Ưu đãi 5%</div>
          </div>
        </div>
        <div className="border-2 border-gray-300 rounded-lg p-6 hover:border-blue-400 cursor-pointer">
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div className="text-center">
            <div className="font-medium mb-2">VNPay</div>
            <div className="text-sm text-gray-600 mb-4">Thẻ ngân hàng</div>
            <div className="text-sm text-blue-600">Tất cả ngân hàng</div>
          </div>
        </div>
        <div className="border-2 border-gray-300 rounded-lg p-6 hover:border-blue-600 cursor-pointer">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <div className="text-center">
            <div className="font-medium mb-2">ZaloPay</div>
            <div className="text-sm text-gray-600 mb-4">Ví Zalo</div>
            <div className="text-sm text-blue-600">Nhanh chóng</div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
          Tiếp tục thanh toán
        </button>
      </div>
    </div>
  )
}