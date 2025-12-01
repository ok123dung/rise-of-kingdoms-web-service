'use client'

import { useState, useEffect } from 'react'

import { ShieldCheck, ShieldOff, Key, RefreshCw, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ChangePasswordForm from '@/components/security/ChangePasswordForm'
import TwoFactorSetup from '@/components/TwoFactorSetup'

interface TwoFactorStatus {
  enabled: boolean
  backupCodesRemaining: number
}

interface TwoFactorStatusResponse {
  success: boolean
  status?: TwoFactorStatus
  error?: string
}

interface DisableResponse {
  success: boolean
  error?: string
}

interface BackupCodesResponse {
  success: boolean
  backupCodes?: string[]
  error?: string
}

export default function SecurityPage() {
  const { status } = useSession()
  const router = useRouter()
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/security')
    }
  }, [status, router])

  useEffect(() => {
    void fetchTwoFactorStatus()
  }, [])

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/setup')
      const data = (await response.json()) as TwoFactorStatusResponse
      if (data.success && data.status) {
        setTwoFactorStatus(data.status)
      }
    } catch (_err) {
      setError('Failed to fetch 2FA status')
    }
  }

  const handleDisable2FA = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = (await response.json()) as DisableResponse

      if (data.success) {
        setSuccess('2FA has been disabled successfully')
        setShowDisable(false)
        setPassword('')
        void fetchTwoFactorStatus()
      } else {
        setError(data.error ?? 'Failed to disable 2FA')
      }
    } catch (_err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    // eslint-disable-next-line no-alert
    if (
      !confirm(
        'Are you sure you want to regenerate backup codes? Your old codes will no longer work.'
      )
    ) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    // eslint-disable-next-line no-alert
    const passwordInput = prompt('Please enter your password to regenerate backup codes:')
    if (!passwordInput) return

    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      })

      const data = (await response.json()) as BackupCodesResponse

      if (data.success && data.backupCodes) {
        // Show backup codes to user
        // eslint-disable-next-line no-alert
        alert(
          `New backup codes:\n\n${data.backupCodes.join('\n')}\n\nPlease save these codes in a secure location!`
        )
        setSuccess('Backup codes regenerated successfully')
        void fetchTwoFactorStatus()
      } else {
        setError(data.error ?? 'Failed to regenerate backup codes')
      }
    } catch (_err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !twoFactorStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-600" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Bảo mật tài khoản</h1>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-600">{success}</div>
          )}

          {/* Change Password Form */}
          <div className="mb-6">
            <ChangePasswordForm />
          </div>

          {/* 2FA Status Card */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {twoFactorStatus.enabled ? (
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                ) : (
                  <ShieldOff className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Xác thực hai yếu tố (2FA)</h2>
                  <p className="text-sm text-gray-600">
                    {twoFactorStatus.enabled
                      ? 'Đã bật - Tài khoản của bạn được bảo vệ'
                      : 'Chưa bật - Bật để tăng cường bảo mật'}
                  </p>
                </div>
              </div>

              {twoFactorStatus.enabled ? (
                <button
                  className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                  onClick={() => setShowDisable(true)}
                >
                  Tắt 2FA
                </button>
              ) : (
                <button
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
                  onClick={() => setShowSetup(true)}
                >
                  Bật 2FA
                </button>
              )}
            </div>

            {twoFactorStatus.enabled && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Mã dự phòng còn lại: {twoFactorStatus.backupCodesRemaining}
                    </span>
                  </div>
                  <button
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => void handleRegenerateBackupCodes()}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tạo mã mới
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2FA Setup Modal */}
          {showSetup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6">
                <h3 className="mb-4 text-xl font-semibold">Thiết lập xác thực hai yếu tố</h3>
                <TwoFactorSetup
                  onCancel={() => setShowSetup(false)}
                  onComplete={() => {
                    setShowSetup(false)
                    void fetchTwoFactorStatus()
                    setSuccess('2FA has been enabled successfully!')
                  }}
                />
              </div>
            </div>
          )}

          {/* Disable 2FA Modal */}
          {showDisable && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6">
                <h3 className="mb-4 text-xl font-semibold">Tắt xác thực hai yếu tố</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Nhập mật khẩu của bạn để tắt 2FA. Điều này sẽ làm giảm bảo mật tài khoản.
                </p>

                <input
                  className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Mật khẩu"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />

                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setShowDisable(false)
                      setPassword('')
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={!password || loading}
                    onClick={() => void handleDisable2FA()}
                  >
                    {loading ? 'Đang xử lý...' : 'Tắt 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
