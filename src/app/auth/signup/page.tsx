'use client'

import { useState, useEffect } from 'react'

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ tên')
      return false
    }
    if (formData.fullName.trim().length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Email không hợp lệ')
      return false
    }
    // Password must match server requirements (12+ chars, uppercase, lowercase, number, special)
    if (formData.password.length < 12) {
      setError('Mật khẩu phải có ít nhất 12 ký tự')
      return false
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ in hoa')
      return false
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 chữ thường')
      return false
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 số')
      return false
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      setError('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return false
    }
    // Vietnamese phone validation
    const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMounted) return

    setIsLoading(true)
    setError('')

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Get CSRF token from cookie
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';')
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=')
          if (name === 'csrf-token') {
            return value
          }
        }
        return null
      }

      const csrfToken = getCsrfToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add CSRF token if available
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken
      }

      // Create user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }

      setSuccess(true)

      // Auto sign in after successful registration
      setTimeout(() => {
        void (async () => {
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
          })

          if (result?.ok) {
            router.push('/admin/dashboard')
          }
        })()
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const _handleDiscordSignIn = () => {
    void signIn('discord', { callbackUrl: '/admin/dashboard' })
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Đăng ký thành công!</h2>
            <p className="mb-4 text-gray-600">
              Tài khoản của bạn đã được tạo thành công. Đang chuyển hướng...
            </p>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-amber-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Tạo tài khoản RoK Services</h2>
          <p className="mt-2 text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link className="font-medium text-amber-600 hover:text-amber-500" href="/auth/signin">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Sign up form */}
        <form
          className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-lg"
          onSubmit={e => void handleSubmit(e)}
        >
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="fullName">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  required
                  autoComplete="name"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm"
                  id="fullName"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  required
                  autoComplete="email"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="phone">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  autoComplete="tel"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm"
                  id="phone"
                  name="phone"
                  placeholder="0987654321"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
                Mật khẩu *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  required
                  autoComplete="new-password"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Tối thiểu 12 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt</p>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  required
                  autoComplete="new-password"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
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
            </div>
          </div>

          <div className="flex items-center">
            <input
              required
              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
            />
            <label className="ml-2 block text-sm text-gray-900" htmlFor="agree-terms">
              Tôi đồng ý với{' '}
              <Link className="text-amber-600 hover:text-amber-500" href="/terms">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link className="text-amber-600 hover:text-amber-500" href="/privacy">
                Chính sách bảo mật
              </Link>
            </label>
          </div>

          <div>
            <button
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !isMounted}
              id="submit-signup"
              type="submit"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo tài khoản'}
            </button>
          </div>

          {/* Social login - Temporarily disabled due to missing env vars
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Hoặc đăng ký với</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                type="button"
                onClick={handleDiscordSignIn}
              >
                <svg className="h-5 w-5" fill="#5865F2" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Đăng ký với Discord
              </button>
            </div>
          </div>
          */}
        </form>
      </div>
    </div>
  )
}
