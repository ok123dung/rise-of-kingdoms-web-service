'use client'

import { useState } from 'react'
import type { PaymentResponse, PaymentError } from '@/types/payment'

interface MoMoPaymentProps {
  amount: number
  bookingId: string
  onSuccess?: (data: PaymentResponse) => void
  onError?: (error: PaymentError) => void
}

export default function MoMoPayment({ amount, bookingId, onSuccess, onError }: MoMoPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Mock MoMo payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock QR code
      setQrCode(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=momo://pay?amount=${amount}&booking=${bookingId}`
      )

      // Simulate payment completion after QR scan
      setTimeout(() => {
        onSuccess?.({
          transactionId: `MOMO_${Date.now()}`,
          amount,
          bookingId,
          method: 'momo',
          status: 'completed'
        })
      }, 5000)
    } catch (error) {
      onError?.(error as PaymentError)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-lg border-2 border-pink-200 bg-white p-6">
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500">
          <span className="text-lg font-bold text-white">M</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">MoMo</h3>
          <p className="text-sm text-gray-600">Ví điện tử MoMo</p>
        </div>
      </div>

      {!qrCode ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Thanh toán {amount.toLocaleString('vi-VN')} VNĐ qua MoMo
          </p>
          <button
            className="rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isProcessing}
            onClick={handlePayment}
          >
            {isProcessing ? 'Đang tạo QR...' : 'Tạo mã QR MoMo'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <img alt="MoMo QR Code" className="mx-auto rounded-lg shadow" src={qrCode} />
          </div>
          <p className="mb-2 text-sm text-gray-600">Mở ứng dụng MoMo và quét mã QR để thanh toán</p>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm">Đang chờ thanh toán...</span>
          </div>
        </div>
      )}
    </div>
  )
}
