'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error('Critical application error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    })

    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          component: 'GlobalErrorBoundary',
          digest: error.digest
        }
      })
    }
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Error Details */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Lỗi hệ thống nghiêm trọng
                </h1>
                <p className="text-gray-600 mb-3">
                  Ứng dụng đã gặp phải một lỗi nghiêm trọng và không thể tiếp tục hoạt động.
                </p>
                <p className="text-sm text-gray-500">
                  Chúng tôi đã tự động ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể.
                </p>
              </div>

              {/* Error ID */}
              {error.digest && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-xs text-gray-500">Mã lỗi hệ thống:</p>
                  <p className="text-sm font-mono text-gray-700">{error.digest}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Action */}
                <button
                  onClick={reset}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Khởi động lại ứng dụng
                </button>

                {/* Secondary Action */}
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  Cần hỗ trợ khẩn cấp?
                </p>
                <div className="text-sm">
                  <a 
                    href={`mailto:support@rokdbot.com?subject=Critical System Error&body=Error ID: ${error.digest || 'N/A'}%0AError Message: ${encodeURIComponent(error.message)}%0ATime: ${new Date().toISOString()}`}
                    className="text-red-600 hover:text-red-500 font-medium"
                  >
                    support@rokdbot.com
                  </a>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                RoK Services • Hệ thống phát hiện lỗi tự động • 
                <span className="ml-1">ID: {error.digest?.slice(-8) || 'UNKNOWN'}</span>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}