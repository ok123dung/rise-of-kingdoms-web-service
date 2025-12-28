'use client'

import { useEffect } from 'react'

import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'

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
      user_agent: navigator.userAgent
    })

    // Send to Sentry with enhanced context
    Sentry.captureException(error, {
      tags: {
        component: 'app-error-boundary',
        digest: error.digest ?? 'no-digest',
        type: 'unhandled_error'
      },
      contexts: {
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      },
      level: 'error'
    })
  }, [error])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-red-50 to-orange-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          {/* Error Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>

          {/* Error Details */}
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Có lỗi xảy ra</h2>
            <p className="mb-3 text-gray-600">
              Một lỗi không mong muốn đã xảy ra. Chúng tôi đã ghi nhận vấn đề này.
            </p>

            {/* Development Error Details */}
            {isDevelopment && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left">
                <p className="mb-1 text-xs text-gray-500">Thông tin lỗi (development):</p>
                <p className="wrap-break-word font-mono text-sm text-gray-700">{error.message}</p>
                {error.digest && (
                  <p className="mt-2 text-xs text-gray-500">Error ID: {error.digest}</p>
                )}
              </div>
            )}
          </div>

          {/* Error ID for Production */}
          {!isDevelopment && error.digest && (
            <div className="mb-6 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Mã lỗi:</p>
              <p className="font-mono text-sm text-gray-700">{error.digest}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action - Try Again */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </button>

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                Tải lại trang
              </button>

              <Link
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href="/"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="mb-2 text-sm text-gray-500">Vấn đề vẫn tiếp diễn?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <a
                className="flex items-center gap-1 text-blue-600 hover:text-blue-500"
                href={`mailto:support@rokdbot.com?subject=Error Report&body=Error ID: ${error.digest ?? 'N/A'}%0AError Message: ${encodeURIComponent(error.message)}%0ATime: ${new Date().toISOString()}`}
              >
                <MessageCircle className="h-3 w-3" />
                Báo lỗi
              </a>
              <span className="text-gray-300">|</span>
              <Link className="text-blue-600 hover:text-blue-500" href="/help">
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
