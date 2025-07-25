'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

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
  const error = searchParams.get('error') as keyof typeof ERROR_MESSAGES || 'default'
  
  const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES.default
  
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Error Details */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {errorDetails.title}
            </h2>
            <p className="text-gray-600 mb-3">
              {errorDetails.description}
            </p>
            <p className="text-sm text-gray-500">
              {errorDetails.suggestion}
            </p>
          </div>

          {/* Error Code */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-500">Mã lỗi:</p>
            <p className="text-sm font-mono text-gray-700 uppercase">{error}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action */}
            {error === 'credentialssignin' ? (
              <Link
                href="/auth/signin"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Thử đăng nhập lại
              </Link>
            ) : error.startsWith('oauth') ? (
              <Link
                href="/auth/signin"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Link>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                {errorDetails.action}
              </button>
            )}

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <Link
                href="/"
                className="flex-1 flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="h-4 w-4" />
                Trang chủ
              </Link>
              
              {error !== 'credentialssignin' && (
                <Link
                  href="/auth/signin"
                  className="flex-1 flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Vẫn gặp vấn đề?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a 
                href="mailto:support@rokdbot.com" 
                className="text-blue-600 hover:text-blue-500"
              >
                Email hỗ trợ
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
            Nếu vấn đề vẫn tiếp diễn, vui lòng chụp màn hình và gửi cho team hỗ trợ
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}