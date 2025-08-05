'use client'

import { useState } from 'react'

interface MoMoPaymentProps {
  amount: number
  bookingId: string
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
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
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=momo://pay?amount=${amount}&booking=${bookingId}`)
      
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
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white border-2 border-pink-200 rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">MoMo</h3>
          <p className="text-sm text-gray-600">Ví điện tử MoMo</p>
        </div>
      </div>

      {!qrCode ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Thanh toán {amount.toLocaleString('vi-VN')} VNĐ qua MoMo
          </p>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Đang tạo QR...' : 'Tạo mã QR MoMo'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <img src={qrCode} alt="MoMo QR Code" className="mx-auto rounded-lg shadow" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Mở ứng dụng MoMo và quét mã QR để thanh toán
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Đang chờ thanh toán...</span>
          </div>
        </div>
      )}
    </div>
  )
}