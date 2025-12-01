'use client'

import { Suspense } from 'react'

import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ERROR_MESSAGES = {
  configuration: 'Có lỗi cấu hình server. Vui lòng thử lại sau.',
  accessdenied: 'Bạn không có quyền truy cập. Vui lòng liên hệ admin.',
  verification: 'Token xác thực không hợp lệ hoặc đã hết hạn.',
  default: 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.',
  signin: 'Không thể đăng nhập. Vui lòng kiểm tra thông tin và thử lại.',
  oauthsignin: 'Có lỗi khi đăng nhập với tài khoản mạng xã hội.',
  oauthcallback: 'Có lỗi xảy ra khi xử lý callback từ nhà cung cấp.',
  oauthcreateaccount: 'Không thể tạo tài khoản từ thông tin OAuth.',
  emailcreateaccount: 'Không thể tạo tài khoản bằng email.',
  callback: 'Có lỗi xảy ra trong quá trình callback.',
  oauthaccountnotlinked: 'Tài khoản đã được liên kết với nhà cung cấp khác.',
  emailsignin: 'Không thể gửi email đăng nhập.',
  credentialssignin: 'Email hoặc mật khẩu không đúng.',
  sessionrequired: 'Vui lòng đăng nhập để tiếp tục.'
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = (searchParams.get('error') as keyof typeof ERROR_MESSAGES) ?? 'default'

  const _errorMessage = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default

  const getErrorDetails = (errorType: string) => {
    switch (errorType) {
      case 'credentialssignin':
        return {
          title: 'Đăng nhập thất bại',
          description: 'Thông tin đăng nhập không chính xác',
          suggestion: 'Vui lòng kiểm tra lại email và mật khẩu của bạn.',
          action: 'Thử đăng nhập lại'
        }
      case 'oauthsignin':
      case 'oauthcallback':
        return {
          title: 'Lỗi xác thực mạng xã hội',
          description: 'Không thể đăng nhập với Discord',
          suggestion: 'Vui lòng thử lại hoặc sử dụng phương thức đăng nhập khác.',
          action: 'Thử lại với Discord'
        }
      case 'accessdenied':
        return {
          title: 'Truy cập bị từ chối',
          description: 'Bạn không có quyền truy cập vào trang này',
          suggestion: 'Vui lòng liên hệ admin nếu bạn tin rằng đây là lỗi.',
          action: 'Liên hệ hỗ trợ'
        }
      case 'verification':
        return {
          title: 'Xác thực thất bại',
          description: 'Token xác thực không hợp lệ',
          suggestion: 'Link có thể đã hết hạn. Vui lòng yêu cầu link mới.',
          action: 'Yêu cầu link mới'
        }
      default:
        return {
          title: 'Có lỗi xảy ra',
          description: 'Một lỗi không mong muốn đã xảy ra',
          suggestion: 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.',
          action: 'Thử lại'
        }
    }
  }

  const errorDetails = getErrorDetails(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          {/* Error Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Error Details */}
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{errorDetails.title}</h2>
            <p className="mb-3 text-gray-600">{errorDetails.description}</p>
            <p className="text-sm text-gray-500">{errorDetails.suggestion}</p>
          </div>

          {/* Error Code */}
          <div className="mb-6 rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Mã lỗi:</p>
            <p className="font-mono text-sm uppercase text-gray-700">{error}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action */}
            {error === 'credentialssignin' ? (
              <Link
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href="/auth/signin"
              >
                <ArrowLeft className="h-4 w-4" />
                Thử đăng nhập lại
              </Link>
            ) : error.startsWith('oauth') ? (
              <Link
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href="/auth/signin"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Link>
            ) : (
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                {errorDetails.action}
              </button>
            )}

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <Link
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href="/"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>

              {error !== 'credentialssignin' && (
                <Link
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  href="/auth/signin"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="mb-2 text-sm text-gray-500">Vẫn gặp vấn đề?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <a className="text-blue-600 hover:text-blue-500" href="mailto:support@rokdbot.com">
                Email hỗ trợ
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
            Nếu vấn đề vẫn tiếp diễn, vui lòng chụp màn hình và gửi cho team hỗ trợ
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
