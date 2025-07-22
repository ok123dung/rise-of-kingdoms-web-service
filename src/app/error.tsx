'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, MessageCircle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Application error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })

    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          component: 'ErrorBoundary',
          digest: error.digest
        }
      })
    }
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          {/* Error Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-3">
              Một lỗi không mong muốn đã xảy ra. Chúng tôi đã ghi nhận vấn đề này.
            </p>
            
            {/* Development Error Details */}
            {isDevelopment && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-xs text-gray-500 mb-1">Thông tin lỗi (development):</p>
                <p className="text-sm font-mono text-gray-700 break-words">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error ID for Production */}
          {!isDevelopment && error.digest && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500">Mã lỗi:</p>
              <p className="text-sm font-mono text-gray-700">{error.digest}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action - Try Again */}
            <button
              onClick={reset}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </button>

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Tải lại trang
              </button>
              
              <Link
                href="/"
                className="flex-1 flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Vấn đề vẫn tiếp diễn?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a 
                href={`mailto:support@rokdbot.com?subject=Error Report&body=Error ID: ${error.digest || 'N/A'}%0AError Message: ${encodeURIComponent(error.message)}%0ATime: ${new Date().toISOString()}`}
                className="text-blue-600 hover:text-blue-500 flex items-center gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                Báo lỗi
              </a>
              <span className="text-gray-300">|</span>
              <Link 
                href="/help" 
                className="text-blue-600 hover:text-blue-500"
              >
                Trung tâm hỗ trợ
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Chúng tôi đã tự động ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể
          </p>
        </div>
      </div>
    </div>
  )
}