'use client'

import { useState } from 'react'

interface VNPayPaymentProps {
  amount: number
  bookingId: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export default function VNPayPayment({ amount, bookingId, onSuccess, onError }: VNPayPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Mock VNPay payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to VNPay gateway (mock)
      const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${amount * 100}&vnp_OrderInfo=Payment for booking ${bookingId}`
      
      // In real implementation, you would redirect to VNPay
      // window.location.href = paymentUrl
      
      // Mock successful payment
      setTimeout(() => {
        onSuccess?.({
          transactionId: `VNPAY_${Date.now()}`,
          amount,
          bookingId,
          method: 'vnpay',
          status: 'completed'
        })
      }, 3000)
    } catch (error) {
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">V</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">VNPay</h3>
          <p className="text-sm text-gray-600">Thẻ ngân hàng, QR Pay</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Thanh toán {amount.toLocaleString('vi-VN')} VNĐ qua VNPay
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Hỗ trợ: Visa, MasterCard, JCB, ATM nội địa, QR Pay
        </p>
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Đang chuyển hướng...' : 'Thanh toán VNPay'}
        </button>
      </div>
    </div>
  )
}