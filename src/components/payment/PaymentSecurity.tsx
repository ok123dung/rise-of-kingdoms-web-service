'use client'

export default function PaymentSecurity() {
  return (
    <div className="rounded-lg border border-green-200 bg-linear-to-r from-green-50 to-blue-50 p-6">
      <div className="mb-4 flex items-center space-x-3">
        <div className="h-6 w-6 text-green-600">🔒</div>
        <h4 className="font-medium text-gray-900">Bảo mật thanh toán</h4>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 text-green-600">✓</div>
          <span className="text-sm text-gray-700">Mã hóa SSL 256-bit</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 text-green-600">✓</div>
          <span className="text-sm text-gray-700">Không lưu trữ thông tin thẻ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 text-green-600">✓</div>
          <span className="text-sm text-gray-700">Tuân thủ PCI DSS</span>
        </div>
      </div>
    </div>
  )
}
