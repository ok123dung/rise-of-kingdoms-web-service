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
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    })

    // Send to error tracking service
    if (
      typeof window !== 'undefined' &&
      (
        window as unknown as {
          Sentry?: { captureException: (error: Error, options: unknown) => void }
        }
      ).Sentry
    ) {
      ;(
        window as unknown as {
          Sentry: { captureException: (error: Error, options: unknown) => void }
        }
      ).Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          component: 'GlobalErrorBoundary',
          digest: error.digest
        }
      })
    }
  }, [error])

  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="rounded-xl bg-white p-8 text-center shadow-lg">
              {/* Error Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Error Details */}
              <div className="mb-6">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Lỗi hệ thống nghiêm trọng</h1>
                <p className="mb-3 text-gray-600">
                  Ứng dụng đã gặp phải một lỗi nghiêm trọng và không thể tiếp tục hoạt động.
                </p>
                <p className="text-sm text-gray-500">
                  Chúng tôi đã tự động ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể.
                </p>
              </div>

              {/* Error ID */}
              {error.digest && (
                <div className="mb-6 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Mã lỗi hệ thống:</p>
                  <p className="font-mono text-sm text-gray-700">{error.digest}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Primary Action */}
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={reset}
                >
                  <RefreshCw className="h-4 w-4" />
                  Khởi động lại ứng dụng
                </button>

                {/* Secondary Action */}
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => (window.location.href = '/')}
                >
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="mb-2 text-sm text-gray-500">Cần hỗ trợ khẩn cấp?</p>
                <div className="text-sm">
                  <a
                    className="font-medium text-red-600 hover:text-red-500"
                    href={`mailto:support@rokdbot.com?subject=Critical System Error&body=Error ID: ${error.digest || 'N/A'}%0AError Message: ${encodeURIComponent(error.message)}%0ATime: ${new Date().toISOString()}`}
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
