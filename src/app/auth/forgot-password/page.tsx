'use client'

import { useState, Suspense } from 'react'

import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

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
      setMessage(
        'Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được link reset password trong vài phút.'
      )
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Back Button */}
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
            href={returnUrl}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mb-6 inline-flex rounded-full bg-blue-100 p-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-900">Quên mật khẩu?</h2>
          <p className="text-gray-600">Nhập email của bạn để nhận link reset password</p>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          {status === 'success' ? (
            /* Success State */
            <div className="space-y-6 text-center">
              <div className="inline-flex rounded-full bg-green-100 p-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Email đã được gửi!</h3>
                <p className="text-sm leading-relaxed text-gray-600">{message}</p>
              </div>

              <div className="space-y-4">
                <button
                  className="w-full text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                  disabled={isLoading}
                  onClick={handleResendEmail}
                >
                  Gửi lại email
                </button>

                <Link className="btn-secondary block w-full py-3 text-center" href={returnUrl}>
                  Quay lại đăng nhập
                </Link>
              </div>

              {/* Help */}
              <div className="border-t border-gray-200 pt-6">
                <p className="mb-2 text-xs text-gray-500">Không nhận được email?</p>
                <div className="space-y-2 text-xs">
                  <p className="text-gray-500">• Kiểm tra thư mục spam/junk</p>
                  <p className="text-gray-500">• Đảm bảo email chính xác</p>
                  <p className="text-gray-500">
                    • Liên hệ{' '}
                    <a
                      className="text-amber-600 hover:text-amber-700"
                      href="mailto:support@rokdbot.com"
                    >
                      support@rokdbot.com
                    </a>{' '}
                    nếu vẫn có vấn đề
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Form State */
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status === 'error' && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{message}</span>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
                  Email đã đăng ký
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    required
                    autoComplete="email"
                    className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    disabled={isLoading}
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Chúng tôi sẽ gửi link reset password đến email này nếu tài khoản tồn tại
                </p>
              </div>

              <button
                className="btn-primary flex w-full items-center justify-center py-3 text-lg disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading || !email.trim()}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi email...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Gửi link reset password
                  </>
                )}
              </button>

              {/* Alternative Actions */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="text-center text-sm text-gray-600">
                  Nhớ lại mật khẩu?{' '}
                  <Link
                    className="font-medium text-amber-600 hover:text-amber-500"
                    href={returnUrl}
                  >
                    Đăng nhập ngay
                  </Link>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <Link
                    className="font-medium text-amber-600 hover:text-amber-500"
                    href="/auth/signup"
                  >
                    Đăng ký miễn phí
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm">
              <p className="mb-1 font-medium text-blue-900">Bảo mật thông tin</p>
              <p className="text-blue-700">
                Chúng tôi không bao giờ gửi mật khẩu qua email. Link reset sẽ hết hạn sau 1 giờ và
                chỉ có thể sử dụng một lần.
              </p>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Cần hỗ trợ?{' '}
            <a
              className="font-medium text-amber-600 hover:text-amber-500"
              href="mailto:support@rokdbot.com"
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
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </RSCErrorBoundary>
  )
}
