'use client'

export default function PaymentSecurity() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 text-green-600">🔒</div>
        <h4 className="font-medium text-gray-900">Bảo mật thanh toán</h4>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 text-green-600">✓</div>
          <span className="text-sm text-gray-700">Mã hóa SSL 256-bit</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 text-green-600">✓</div>
          <span className="text-sm text-gray-700">Không lưu trữ thông tin thẻ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 text-green-600">✓</div>
          <span className="text-sm text-gray-700">Tuân thủ PCI DSS</span>
        </div>
      </div>
    </div>
  )
}