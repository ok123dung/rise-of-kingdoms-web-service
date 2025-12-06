'use client'

import { useState } from 'react'

import type { PaymentResponse, PaymentError } from '@/types/payment'

interface ZaloPayPaymentProps {
  amount: number
  booking_id: string
  onSuccess?: (data: PaymentResponse) => void
  onError?: (error: PaymentError) => void
}

export default function ZaloPayPayment({
  amount,
  booking_id,
  onSuccess,
  onError
}: ZaloPayPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Mock ZaloPay payment processing
      await new Promise(resolve => setTimeout(resolve, 1800))

      // Generate mock QR code
      setQrCode(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=zalopay://pay?amount=${amount}&booking=${booking_id}`
      )

      // Simulate payment completion after QR scan
      setTimeout(() => {
        onSuccess?.({
          transactionId: `ZALOPAY_${Date.now()}`,
          amount,
          booking_id,
          method: 'zalopay',
          status: 'completed'
        })
      }, 4000)
    } catch (error) {
      onError?.(error as PaymentError)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-lg border-2 border-blue-300 bg-white p-6">
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
          <span className="text-lg font-bold text-white">Z</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">ZaloPay</h3>
          <p className="text-sm text-gray-600">Ví điện tử ZaloPay</p>
        </div>
      </div>

      {!qrCode ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Thanh toán {amount.toLocaleString('vi-VN')} VNĐ qua ZaloPay
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isProcessing}
            onClick={() => void handlePayment()}
          >
            {isProcessing ? 'Đang tạo QR...' : 'Tạo mã QR ZaloPay'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <img alt="ZaloPay QR Code" className="mx-auto rounded-lg shadow" src={qrCode} />
          </div>
          <p className="mb-2 text-sm text-gray-600">
            Mở ứng dụng ZaloPay và quét mã QR để thanh toán
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm">Đang chờ thanh toán...</span>
          </div>
        </div>
      )}
    </div>
  )
}
