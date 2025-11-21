'use client'

import { useState } from 'react'

import type { PaymentResponse, PaymentError } from '@/types/payment'

interface VNPayPaymentProps {
  amount: number
  bookingId: string
  onSuccess?: (data: PaymentResponse) => void
  onError?: (error: PaymentError) => void
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
      onError?.(error as PaymentError)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-white p-6">
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <span className="text-lg font-bold text-white">V</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">VNPay</h3>
          <p className="text-sm text-gray-600">Thẻ ngân hàng, QR Pay</p>
        </div>
      </div>

      <div className="text-center">
        <p className="mb-4 text-gray-600">
          Thanh toán {amount.toLocaleString('vi-VN')} VNĐ qua VNPay
        </p>
        <p className="mb-4 text-sm text-gray-500">
          Hỗ trợ: Visa, MasterCard, JCB, ATM nội địa, QR Pay
        </p>
        <button
          className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          disabled={isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? 'Đang chuyển hướng...' : 'Thanh toán VNPay'}
        </button>
      </div>
    </div>
  )
}
