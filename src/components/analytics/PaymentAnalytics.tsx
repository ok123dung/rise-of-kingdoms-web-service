'use client'

export default function PaymentAnalytics() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Thống kê thanh toán</h3>
      
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Doanh thu theo tháng</h4>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-500">📊 Biểu đồ doanh thu</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="w-16 h-16 bg-pink-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span>M</span>
          </div>
          <div className="font-medium">MoMo</div>
          <div className="text-sm text-gray-600">45%</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span>V</span>
          </div>
          <div className="font-medium">VNPay</div>
          <div className="text-sm text-gray-600">35%</div>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span>Z</span>
          </div>
          <div className="font-medium">ZaloPay</div>
          <div className="text-sm text-gray-600">20%</div>
        </div>
      </div>
    </div>
  )
}