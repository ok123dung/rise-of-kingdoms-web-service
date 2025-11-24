'use client'

import { useState, useEffect, Suspense } from 'react'

import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn')
    }
  }, [token])

  useEffect(() => {
    // Check password strength
    setPasswordStrength({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    })
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!token) {
      setError('Token không hợp lệ')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      } else {
        setError(data.error || 'Có lỗi xảy ra')
      }
    } catch (err) {
      setError('Không thể kết nối đến server')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg bg-white p-8 shadow-xl">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Đặt lại mật khẩu thành công!</h2>
            <p className="mt-2 text-gray-600">
              Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
            </p>
            <Link
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
              href="/auth/signin"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">🎮 RoK Services</h1>
            <p className="mt-2 text-gray-600">Đặt lại mật khẩu của bạn</p>
          </div>

          {/* Error message */}
          {error && !token && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-2 text-sm text-red-800">{error}</p>
              <Link
                className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                href="/auth/forgot-password"
              >
                Yêu cầu link mới
              </Link>
            </div>
          )}

          {token && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    required
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Nhập mật khẩu mới"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password strength indicators */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center space-x-2">
                    {passwordStrength.length ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    <span
                      className={`text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      Ít nhất 8 ký tự
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordStrength.lowercase && passwordStrength.uppercase ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    <span
                      className={`text-xs ${passwordStrength.lowercase && passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      Chữ hoa và chữ thường
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordStrength.number ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300" />
                    )}
                    <span
                      className={`text-xs ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      Ít nhất một số
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    required
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Nhập lại mật khẩu mới"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Mật khẩu không khớp</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={isSubmitting || !password || password !== confirmPassword}
                type="submit"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              {/* Back to Sign In */}
              <div className="text-center">
                <Link className="text-sm text-blue-600 hover:text-blue-800" href="/auth/signin">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
          <div className="w-full max-w-md text-center">
            <div className="rounded-lg bg-white p-8 shadow-xl">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
