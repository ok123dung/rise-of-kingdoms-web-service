'use client'

import dynamic from 'next/dynamic'

import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Payment gateway components - heavy because they include external scripts
export const DynamicMoMoPayment = dynamic(() => import('@/components/payment/MoMoPayment'), {
  loading: () => (
    <div className="animate-pulse rounded-lg border-2 border-gray-200 bg-white p-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded bg-pink-200" />
        <div>
          <div className="mb-2 h-5 w-24 rounded bg-gray-300" />
          <div className="h-4 w-32 rounded bg-gray-300" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="mx-auto h-4 w-48 rounded bg-gray-300" />
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicVNPayPayment = dynamic(() => import('@/components/payment/VNPayPayment'), {
  loading: () => (
    <div className="animate-pulse rounded-lg border-2 border-gray-200 bg-white p-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded bg-blue-200" />
        <div>
          <div className="mb-2 h-5 w-24 rounded bg-gray-300" />
          <div className="h-4 w-36 rounded bg-gray-300" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="mx-auto h-4 w-52 rounded bg-gray-300" />
      </div>
    </div>
  ),
  ssr: false
})

export const DynamicZaloPayPayment = dynamic(() => import('@/components/payment/ZaloPayPayment'), {
  loading: () => (
    <div className="animate-pulse rounded-lg border-2 border-gray-200 bg-white p-6">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded bg-blue-200" />
        <div>
          <div className="mb-2 h-5 w-24 rounded bg-gray-300" />
          <div className="h-4 w-40 rounded bg-gray-300" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="mx-auto h-4 w-44 rounded bg-gray-300" />
      </div>
    </div>
  ),
  ssr: false
})

// QR Code component (can be heavy due to QR generation)
export const DynamicQRCodeGenerator = dynamic(
  () => import('@/components/payment/QRCodeGenerator'),
  {
    loading: () => (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-48 w-48 animate-pulse items-center justify-center rounded bg-gray-200">
          <LoadingSpinner />
        </div>
        <div className="h-4 w-36 rounded bg-gray-300" />
      </div>
    ),
    ssr: false
  }
)

// Payment history component (potentially large data)
export const DynamicPaymentHistory = dynamic(() => import('@/components/payment/PaymentHistory'), {
  loading: () => (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="h-6 w-40 rounded bg-gray-300" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded bg-gray-300" />
                <div>
                  <div className="mb-2 h-4 w-32 rounded bg-gray-300" />
                  <div className="h-3 w-24 rounded bg-gray-300" />
                </div>
              </div>
              <div className="text-right">
                <div className="mb-2 h-4 w-20 rounded bg-gray-300" />
                <div className="h-3 w-16 rounded bg-green-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

// Payment analytics (heavy charts and calculations)
export const DynamicPaymentAnalytics = dynamic(
  () => import('@/components/analytics/PaymentAnalytics'),
  {
    loading: () => (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 h-6 w-48 rounded bg-gray-300" />

        {/* Revenue chart skeleton */}
        <div className="mb-8">
          <div className="mb-4 h-4 w-32 rounded bg-gray-300" />
          <div className="h-64 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Payment method breakdown */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4 text-center">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-gray-300" />
              <div className="mx-auto mb-2 h-4 w-20 rounded bg-gray-300" />
              <div className="mx-auto h-3 w-16 rounded bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

// Refund management component
export const DynamicRefundManager = dynamic(() => import('@/components/payment/RefundManager'), {
  loading: () => (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <div className="h-6 w-36 rounded bg-gray-300" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 h-4 w-24 rounded bg-gray-300" />
              <div className="h-10 rounded bg-gray-200" />
            </div>
            <div>
              <div className="mb-2 h-4 w-20 rounded bg-gray-300" />
              <div className="h-10 rounded bg-gray-200" />
            </div>
          </div>
          <div>
            <div className="mb-2 h-4 w-28 rounded bg-gray-300" />
            <div className="h-24 rounded bg-gray-200" />
          </div>
          <div className="flex justify-end space-x-3">
            <div className="h-10 w-20 rounded bg-gray-300" />
            <div className="h-10 w-32 rounded bg-red-300" />
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
})

// Payment security verification
export const DynamicPaymentSecurity = dynamic(
  () => import('@/components/payment/PaymentSecurity'),
  {
    loading: () => (
      <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-6">
        <div className="mb-4 flex items-center space-x-3">
          <div className="h-6 w-6 animate-pulse rounded bg-green-300" />
          <div className="h-5 w-32 rounded bg-gray-300" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-green-300" />
              <div className="h-4 w-48 rounded bg-gray-300" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

// Payment method selector with advanced features
export const DynamicAdvancedPaymentSelector = dynamic(
  () => import('@/components/payment/AdvancedPaymentSelector'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="mb-6 h-6 w-48 rounded bg-gray-300" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border-2 border-gray-300 p-6">
              <div className="mx-auto mb-4 h-16 w-16 rounded bg-gray-300" />
              <div className="mx-auto mb-2 h-5 w-24 rounded bg-gray-300" />
              <div className="mx-auto mb-4 h-4 w-32 rounded bg-gray-300" />
              <div className="mx-auto h-4 w-20 rounded bg-gray-300" />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="h-12 w-48 rounded bg-blue-300" />
        </div>
      </div>
    ),
    ssr: false
  }
)
