'use client'

import { ShieldCheck } from 'lucide-react'

/**
 * PaymentBadges Component
 *
 * Hiển thị các phương thức thanh toán Việt Nam được hỗ trợ.
 * Component này giúp tăng độ tin cậy và conversion rate.
 *
 * @example
 * <PaymentBadges />
 */

// Payment method configuration - dễ maintain và mở rộng
const PAYMENT_METHODS = [
  {
    id: 'momo',
    name: 'MoMo',
    description: 'Ví điện tử',
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    bgLight: 'bg-pink-50',
    // Keyword để SEO tools detect
    keywords: ['momo', 'ví momo', 'thanh toán momo']
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    description: 'Ví Zalo',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
    keywords: ['zalopay', 'ví zalopay', 'thanh toán zalopay']
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Thẻ ngân hàng',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
    keywords: ['vnpay', 'vnpay qr', 'thanh toán vnpay']
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'Chuyển khoản',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    bgLight: 'bg-green-50',
    keywords: ['chuyển khoản', 'banking', 'ngân hàng']
  }
] as const

// Type cho payment method
type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/**
 * PaymentBadge - Single payment method badge
 */
function PaymentBadge({ method }: { method: PaymentMethod }) {
  return (
    <div
      data-payment-method={method.id}
      data-testid={`payment-badge-${method.id}`}
      className={`
        flex items-center gap-3 rounded-xl p-4
        ${method.bgLight}
        transition-transform duration-200 hover:scale-105
      `}
    >
      {/* Icon circle */}
      <div
        className={`
        flex h-10 w-10 items-center justify-center rounded-full
        ${method.color} text-sm font-bold text-white
      `}
      >
        {method.name.charAt(0)}
      </div>

      {/* Text */}
      <div>
        <div className={`font-semibold ${method.textColor}`}>{method.name}</div>
        <div className="text-xs text-gray-500">{method.description}</div>
      </div>
    </div>
  )
}

/**
 * PaymentBadges - Main component
 *
 * Features:
 * - Responsive grid (2 cols mobile, 4 cols desktop)
 * - SEO-friendly với data attributes
 * - Accessible với proper labels
 */
export default function PaymentBadges() {
  return (
    <section
      aria-label="Phương thức thanh toán"
      className="bg-gradient-to-b from-gray-50 to-white py-12"
      data-testid="payment-badges-section"
    >
      <div className="container-max px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Thanh toán an toàn</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Hỗ trợ thanh toán đa dạng
          </h2>

          <p className="mt-2 text-gray-600">
            Chấp nhận MoMo, ZaloPay, VNPay và chuyển khoản ngân hàng
          </p>
        </div>

        {/* Payment badges grid */}
        <div
          aria-label="Danh sách phương thức thanh toán"
          className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
          role="list"
        >
          {PAYMENT_METHODS.map(method => (
            <PaymentBadge key={method.id} method={method} />
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Bảo mật SSL
          </span>
          <span>•</span>
          <span>Hoàn tiền trong 24h nếu không hài lòng</span>
          <span>•</span>
          <span>Hỗ trợ 24/7</span>
        </div>

        {/* Hidden SEO text - giúp crawlers detect */}
        <div className="sr-only">
          Chúng tôi chấp nhận thanh toán qua các phương thức phổ biến tại Việt Nam: MoMo - ví điện
          tử hàng đầu Việt Nam, ZaloPay - thanh toán qua ứng dụng Zalo, VNPay - cổng thanh toán liên
          kết với tất cả ngân hàng Việt Nam, Chuyển khoản ngân hàng trực tiếp. Tất cả giao dịch được
          bảo mật với SSL và mã hóa đầu cuối.
        </div>
      </div>
    </section>
  )
}

/**
 * PaymentBadgesCompact - Phiên bản nhỏ gọn cho footer hoặc sidebar
 */
export function PaymentBadgesCompact() {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="payment-badges-compact">
      <span className="text-sm text-gray-500">Thanh toán:</span>
      {PAYMENT_METHODS.map(method => (
        <span
          key={method.id}
          data-payment-method={method.id}
          className={`
            rounded-full px-3 py-1 text-xs font-medium
            ${method.bgLight} ${method.textColor}
          `}
        >
          {method.name}
        </span>
      ))}
    </div>
  )
}
