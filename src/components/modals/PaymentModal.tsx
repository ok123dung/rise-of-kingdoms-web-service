'use client'
import { useState } from 'react'

import { X } from 'lucide-react'

interface PaymentData {
  bookingId: string
  amount: number
  method: 'momo' | 'vnpay' | 'zalopay'
  transactionId: string
  status: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  bookingId: string
  onPaymentSuccess?: (paymentData: PaymentData) => void
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Thanh toán dịch vụ</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Amount */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="mb-1 text-sm text-blue-600">Tổng thanh toán</div>
          <div className="text-2xl font-bold text-blue-900">
            {amount.toLocaleString('vi-VN')} VNĐ
          </div>
          <div className="mt-1 text-sm text-blue-600">Booking ID: {bookingId}</div>
        </div>
        {/* Payment Methods */}
        <div className="mb-6">
          <p className="mb-3 block text-sm font-medium text-gray-700">
            Chọn phương thức thanh toán
          </p>
          <div className="space-y-3">
            {/* MoMo */}
            <button
              className={`flex w-full items-center space-x-3 rounded-lg border p-4 transition-colors ${
                selectedMethod === 'momo'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
              onClick={() => setSelectedMethod('momo')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">MoMo</div>
                <div className="text-sm text-gray-500">Ví điện tử MoMo</div>
              </div>
              {selectedMethod === 'momo' && <div className="h-4 w-4 rounded-full bg-pink-500" />}
            </button>
            {/* VNPay */}
            <button
              className={`flex w-full items-center space-x-3 rounded-lg border p-4 transition-colors ${
                selectedMethod === 'vnpay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedMethod('vnpay')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">VNPay</div>
                <div className="text-sm text-gray-500">Thẻ ngân hàng, QR Pay</div>
              </div>
              {selectedMethod === 'vnpay' && <div className="h-4 w-4 rounded-full bg-blue-500" />}
            </button>
            {/* ZaloPay */}
            <button
              className={`flex w-full items-center space-x-3 rounded-lg border p-4 transition-colors ${
                selectedMethod === 'zalopay'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedMethod('zalopay')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <span className="text-sm font-bold text-white">Z</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">ZaloPay</div>
                <div className="text-sm text-gray-500">Ví điện tử ZaloPay</div>
              </div>
              {selectedMethod === 'zalopay' && <div className="h-4 w-4 rounded-full bg-blue-600" />}
            </button>
          </div>
        </div>
        {/* Actions */}
        <div className="flex space-x-3">
          <button
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            disabled={isProcessing}
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!selectedMethod || isProcessing}
            onClick={() => void handlePayment()}
          >
            {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
          </button>
        </div>
        {/* Security Note */}
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                clipRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                fillRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-600">Thanh toán an toàn với mã hóa SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
