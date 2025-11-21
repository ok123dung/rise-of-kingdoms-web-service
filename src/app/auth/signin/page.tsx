'use client'

import { useState, useEffect, Suspense } from 'react'

import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [totpCode, setTotpCode] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'

  useEffect(() => {
    // Check if already signed in
    getSession().then(session => {
      if (session) {
        router.push(callbackUrl)
      }
    })
  }, [router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // If not yet checked for 2FA, check first
      if (!requires2FA && !totpCode) {
        const checkResponse = await fetch('/api/auth/check-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const checkData = await checkResponse.json()

        if (checkData.error) {
          setError('Email hoặc mật khẩu không đúng')
          setIsLoading(false)
          return
        }

        if (checkData.requires2FA) {
          setRequires2FA(true)
          setError('')
          setIsLoading(false)
          return
        }
      }

      // Proceed with signin
      const result = await signIn('credentials', {
        email,
        password,
        totpCode: totpCode || undefined,
        redirect: false
      })

      if (result?.error) {
        setError('Email, mật khẩu hoặc mã xác thực không đúng')
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiscordSignIn = () => {
    signIn('discord', { callbackUrl })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Đăng nhập vào RoK Services</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hoặc{' '}
            <Link className="font-medium text-amber-600 hover:text-amber-500" href="/auth/signup">
              tạo tài khoản mới
            </Link>
          </p>
        </div>

        {/* Sign in form */}
        <form className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  required
                  autoComplete="email"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  required
                  autoComplete="current-password"
                  className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* 2FA Code Input */}
            {requires2FA && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="totpCode">
                  Mã xác thực 2FA
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    autoComplete="one-time-code"
                    className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    id="totpCode"
                    maxLength={9}
                    name="totpCode"
                    placeholder="123456"
                    required={requires2FA}
                    type="text"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Nhập mã 6 chữ số từ ứng dụng xác thực hoặc mã dự phòng
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label className="ml-2 block text-sm text-gray-900" htmlFor="remember-me">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link
                className="font-medium text-blue-600 hover:text-blue-500"
                href="/auth/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              className="group relative flex w-full transform justify-center rounded-lg border border-transparent bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đăng nhập'}
            </button>
          </div>

          {/* Social login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Hoặc đăng nhập với</span>
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
                Đăng nhập với Discord
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <Link className="text-blue-600 hover:text-blue-500" href="/terms">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link className="text-blue-600 hover:text-blue-500" href="/privacy">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
