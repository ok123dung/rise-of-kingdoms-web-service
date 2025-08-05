'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import { RSCErrorBoundary } from '@/components/ErrorBoundary'

function ForgotPasswordContent() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('callbackUrl') || '/auth/signin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      // Simulate API call - In real implementation, this would call your password reset API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For now, we'll show success message
      setStatus('success')
      setMessage('Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được link reset password trong vài phút.')
      
    } catch (error) {
      setStatus('error')
      setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = () => {
    setStatus('idle')
    setMessage('')
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Back Button */}
        <div>
          <Link 
            href={returnUrl}
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="bg-blue-100 p-4 rounded-full inline-flex mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Quên mật khẩu?
          </h2>
          <p className="text-gray-600">
            Nhập email của bạn để nhận link reset password
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          
          {status === 'success' ? (
            /* Success State */
            <div className="text-center space-y-6">
              <div className="bg-green-100 p-4 rounded-full inline-flex">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email đã được gửi!
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
                >
                  Gửi lại email
                </button>
                
                <Link
                  href={returnUrl}
                  className="block w-full btn-secondary text-center py-3"
                >
                  Quay lại đăng nhập
                </Link>
              </div>

              {/* Help */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Không nhận được email?
                </p>
                <div className="space-y-2 text-xs">
                  <p className="text-gray-500">• Kiểm tra thư mục spam/junk</p>
                  <p className="text-gray-500">• Đảm bảo email chính xác</p>
                  <p className="text-gray-500">• Liên hệ{' '}
                    <a href="mailto:support@rokdbot.com" className="text-amber-600 hover:text-amber-700">
                      support@rokdbot.com
                    </a> nếu vẫn có vấn đề
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{message}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Chúng tôi sẽ gửi link reset password đến email này nếu tài khoản tồn tại
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full btn-primary flex items-center justify-center py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang gửi email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Gửi link reset password
                  </>
                )}
              </button>

              {/* Alternative Actions */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  Nhớ lại mật khẩu?{' '}
                  <Link 
                    href={returnUrl}
                    className="font-medium text-amber-600 hover:text-amber-500"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <Link 
                    href="/auth/signup"
                    className="font-medium text-amber-600 hover:text-amber-500"
                  >
                    Đăng ký miễn phí
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Bảo mật thông tin</p>
              <p className="text-blue-700">
                Chúng tôi không bao giờ gửi mật khẩu qua email. Link reset sẽ hết hạn sau 1 giờ 
                và chỉ có thể sử dụng một lần.
              </p>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{' '}
            <a 
              href="mailto:support@rokdbot.com" 
              className="text-amber-600 hover:text-amber-500 font-medium"
            >
              Liên hệ support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <RSCErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <ForgotPasswordContent />
      </Suspense>
    </RSCErrorBoundary>
  )
}