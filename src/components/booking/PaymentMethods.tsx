'use client'

import { useState } from 'react'

import { QrCode, CreditCard, Smartphone, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentMethodsProps {
  booking: any
}

export default function PaymentMethods({ booking }: PaymentMethodsProps) {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<string>('momo')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Simulate API call
      const res = await fetch('/api/payments/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.finalAmount,
          method: selectedMethod
        })
      })

      if (res.ok) {
        router.push('/booking/success')
      } else {
        alert('Thanh toán thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra.')
    } finally {
      setIsProcessing(false)
    }
  }

  const methods = [
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: Smartphone,
      description: 'Quét mã QR MoMo'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: QrCode,
      description: 'Quét mã QR ZaloPay'
    },
    {
      id: 'bank',
      name: 'Chuyển khoản',
      icon: CreditCard,
      description: 'Vietcombank, Techcombank...'
    }
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5">
      <h2 className="text-lg font-semibold text-gray-900">Chọn phương thức thanh toán</h2>

      <div className="mt-4 space-y-3">
        {methods.map(method => (
          <div
            key={method.id}
            className={`relative flex cursor-pointer items-center rounded-xl border p-4 transition-all ${
              selectedMethod === method.id
                ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                selectedMethod === method.id
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <method.icon className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p
                className={`font-medium ${selectedMethod === method.id ? 'text-amber-900' : 'text-gray-900'}`}
              >
                {method.name}
              </p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            {selectedMethod === method.id && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mock QR Code Display */}
      <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center">
        <p className="mb-4 text-sm text-gray-600">
          Đây là môi trường thử nghiệm. Nhấn nút bên dưới để giả lập thanh toán thành công.
        </p>
        <button
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-center font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang xử lý...
            </span>
          ) : (
            `Thanh toán ${Number(booking.finalAmount).toLocaleString()} VNĐ`
          )}
        </button>
      </div>
    </div>
  )
}
