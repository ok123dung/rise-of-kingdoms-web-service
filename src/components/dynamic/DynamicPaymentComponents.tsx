'use client'

import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Payment gateway components - heavy because they include external scripts
export const DynamicMoMoPayment = dynamic(
  () => import('@/components/payment/MoMoPayment'),
  {
    loading: () => (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-pink-200 rounded"></div>
          <div>
            <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicVNPayPayment = dynamic(
  () => import('@/components/payment/VNPayPayment'),
  {
    loading: () => (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-200 rounded"></div>
          <div>
            <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-36"></div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="h-4 bg-gray-300 rounded w-52 mx-auto"></div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const DynamicZaloPayPayment = dynamic(
  () => import('@/components/payment/ZaloPayPayment'),
  {
    loading: () => (
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-200 rounded"></div>
          <div>
            <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-40"></div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="h-4 bg-gray-300 rounded w-44 mx-auto"></div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// QR Code component (can be heavy due to QR generation)
export const DynamicQRCodeGenerator = dynamic(
  () => import('@/components/payment/QRCodeGenerator'),
  {
    loading: () => (
      <div className="flex flex-col items-center space-y-4">
        <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center animate-pulse">
          <LoadingSpinner />
        </div>
        <div className="h-4 bg-gray-300 rounded w-36"></div>
      </div>
    ),
    ssr: false
  }
)

// Payment history component (potentially large data)
export const DynamicPaymentHistory = dynamic(
  () => import('@/components/payment/PaymentHistory'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-40"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-300 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-green-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Payment analytics (heavy charts and calculations)
export const DynamicPaymentAnalytics = dynamic(
  () => import('@/components/analytics/PaymentAnalytics'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-300 rounded mb-6 w-48"></div>
        
        {/* Revenue chart skeleton */}
        <div className="mb-8">
          <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Payment method breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center p-4 border rounded-lg animate-pulse">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

// Refund management component
export const DynamicRefundManager = dynamic(
  () => import('@/components/payment/RefundManager'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-300 rounded w-36"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-28 mb-2"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-end space-x-3">
              <div className="h-10 bg-gray-300 rounded w-20"></div>
              <div className="h-10 bg-red-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Payment security verification
export const DynamicPaymentSecurity = dynamic(
  () => import('@/components/payment/PaymentSecurity'),
  {
    loading: () => (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-green-300 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 rounded-full"></div>
              <div className="h-4 bg-gray-300 rounded w-48"></div>
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
        <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-2 border-gray-300 rounded-lg p-6 animate-pulse">
              <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
              <div className="h-5 bg-gray-300 rounded w-24 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="h-12 bg-blue-300 rounded w-48"></div>
        </div>
      </div>
    ),
    ssr: false
  }
)