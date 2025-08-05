'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  bookingId: string
  onPaymentSuccess?: (paymentData: any) => void
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  bookingId,
  onPaymentSuccess 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'vnpay' | 'zalopay' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handlePayment = async () => {
    if (!selectedMethod) return

    setIsProcessing(true)
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const paymentData = {
        bookingId,
        amount,
        method: selectedMethod,
        transactionId: `TX_${Date.now()}`,
        status: 'completed'
      }
      
      onPaymentSuccess?.(paymentData)
      onClose()
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Thanh toán dịch vụ
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Amount */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-600 mb-1">Tổng thanh toán</div>
          <div className="text-2xl font-bold text-blue-900">
            {amount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="text-sm text-blue-600 mt-1">
            Booking ID: {bookingId}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn phương thức thanh toán
          </label>
          <div className="space-y-3">
            {/* MoMo */}
            <button
              onClick={() => setSelectedMethod('momo')}
              className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                selectedMethod === 'momo' 
                  ? 'border-pink-500 bg-pink-50' 
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">MoMo</div>
                <div className="text-sm text-gray-500">Ví điện tử MoMo</div>
              </div>
              {selectedMethod === 'momo' && (
                <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
              )}
            </button>

            {/* VNPay */}
            <button
              onClick={() => setSelectedMethod('vnpay')}
              className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                selectedMethod === 'vnpay' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">V</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">VNPay</div>
                <div className="text-sm text-gray-500">Thẻ ngân hàng, QR Pay</div>
              </div>
              {selectedMethod === 'vnpay' && (
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              )}
            </button>

            {/* ZaloPay */}
            <button
              onClick={() => setSelectedMethod('zalopay')}
              className={`w-full p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                selectedMethod === 'zalopay' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">Z</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">ZaloPay</div>
                <div className="text-sm text-gray-500">Ví điện tử ZaloPay</div>
              </div>
              {selectedMethod === 'zalopay' && (
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Hủy
          </button>
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600">
              Thanh toán an toàn với mã hóa SSL 256-bit
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}