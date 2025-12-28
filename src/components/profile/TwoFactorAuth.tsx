'use client'

import { useState, useEffect, useCallback } from 'react'

import { ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface TwoFactorStatus {
  enabled: boolean
  backup_codesRemaining: number
}

export default function TwoFactorAuth() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<{
    qrCode: string
    secret: string
    backup_codes: string[]
  } | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'backup' | 'disable'>('initial')

  interface TwoFactorStatusResponse {
    success: boolean
    status?: TwoFactorStatus
    error?: string
  }

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/2fa/setup')
      const data = (await res.json()) as TwoFactorStatusResponse
      if (data.success && data.status) {
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to fetch 2FA status', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStatus()
  }, [fetchStatus])

  interface SetupResponse {
    success: boolean
    qrCode?: string
    secret?: string
    backup_codes?: string[]
    message?: string
  }

  const startSetup = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' })
      const data = (await res.json()) as SetupResponse
      if (data.success && data.qrCode && data.secret && data.backup_codes) {
        setSetupData({
          qrCode: data.qrCode,
          secret: data.secret,
          backup_codes: data.backup_codes
        })
        setStep('setup')
      } else {
        setMessage({ type: 'error', text: data.message ?? 'Failed to start setup' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error starting setup' })
    } finally {
      setLoading(false)
    }
  }

  interface VerifyResponse {
    success: boolean
    message?: string
  }

  const verifyAndEnable = async () => {
    if (!otpCode) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otpCode })
      })
      const data = (await res.json()) as VerifyResponse
      if (data.success) {
        setStatus({ enabled: true, backup_codesRemaining: 10 })
        setStep('backup')
        setMessage({ type: 'success', text: '2FA enabled successfully' })
      } else {
        setMessage({ type: 'error', text: data.message ?? 'Invalid code' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Verification failed' })
    } finally {
      setLoading(false)
    }
  }

  interface DisableResponse {
    success: boolean
    error?: string
  }

  const disable2FA = async () => {
    if (!password) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = (await res.json()) as DisableResponse
      if (data.success) {
        setStatus({ enabled: false, backup_codesRemaining: 0 })
        setStep('initial')
        setPassword('')
        setMessage({ type: 'success', text: '2FA disabled successfully' })
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Failed to disable 2FA' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error disabling 2FA' })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !status) {
    return <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Bảo mật 2 lớp (2FA)</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tăng cường bảo mật cho tài khoản của bạn bằng cách yêu cầu mã xác thực khi đăng nhập.
            </p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            {message && (
              <div
                className={`mb-4 rounded-md p-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                {message.text}
              </div>
            )}

            {!status?.enabled ? (
              // 2FA is Disabled
              <div>
                {step === 'initial' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="mr-3 h-8 w-8 text-gray-400" />
                      <span className="text-gray-700">Chưa kích hoạt</span>
                    </div>
                    <button
                      className="bg-rok-gold hover:bg-rok-gold-dark focus:ring-rok-gold inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                      disabled={loading}
                      onClick={() => void startSetup()}
                    >
                      Kích hoạt ngay
                    </button>
                  </div>
                )}

                {step === 'setup' && setupData && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center rounded-lg border bg-gray-50 p-4">
                      <p className="mb-4 text-center text-sm text-gray-600">
                        Quét mã QR này bằng ứng dụng Authenticator (Google Authenticator, Authy,
                        v.v.)
                      </p>
                      <div className="rounded bg-white p-2 shadow-sm">
                        <Image alt="2FA QR Code" height={192} src={setupData.qrCode} width={192} />
                      </div>
                      <p className="mt-4 text-xs text-gray-500">
                        Hoặc nhập mã thủ công:{' '}
                        <span className="select-all font-mono font-bold">{setupData.secret}</span>
                      </p>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="tfa-otp-code"
                      >
                        Nhập mã xác thực (6 số)
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          className="focus:border-rok-gold focus:ring-rok-gold block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                          id="tfa-otp-code"
                          placeholder="123456"
                          type="text"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                        <button
                          className="bg-rok-gold hover:bg-rok-gold-dark focus:ring-rok-gold inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                          disabled={loading || otpCode.length !== 6}
                          onClick={() => void verifyAndEnable()}
                        >
                          Xác nhận
                        </button>
                      </div>
                    </div>
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => setStep('initial')}
                    >
                      Hủy bỏ
                    </button>
                  </div>
                )}

                {step === 'backup' && setupData && (
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="shrink-0">
                          <KeyIcon aria-hidden="true" className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Lưu lại các mã dự phòng này ở nơi an toàn. Bạn có thể dùng chúng để đăng
                            nhập nếu mất điện thoại.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-4 font-mono text-sm">
                      {setupData.backup_codes.map((code, index) => (
                        <div key={index} className="text-gray-700">
                          {code}
                        </div>
                      ))}
                    </div>
                    <button
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      onClick={() => setStep('initial')}
                    >
                      Đã lưu, hoàn tất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 2FA is Enabled
              <div>
                {step === 'initial' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="mr-3 h-8 w-8 text-green-500" />
                      <div>
                        <span className="block font-medium text-gray-900">Đã kích hoạt</span>
                        <span className="text-sm text-gray-500">
                          Tài khoản của bạn đang được bảo vệ
                        </span>
                      </div>
                    </div>
                    <button
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={() => setStep('disable')}
                    >
                      Tắt 2FA
                    </button>
                  </div>
                )}

                {step === 'disable' && (
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-400 bg-red-50 p-4">
                      <p className="text-sm text-red-700">
                        Bạn có chắc chắn muốn tắt bảo mật 2 lớp? Tài khoản của bạn sẽ kém an toàn
                        hơn.
                      </p>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="tfa-disable-password"
                      >
                        Nhập mật khẩu để xác nhận
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                          id="tfa-disable-password"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                        <button
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                          disabled={loading || !password}
                          onClick={() => void disable2FA()}
                        >
                          Tắt 2FA
                        </button>
                      </div>
                    </div>
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => setStep('initial')}
                    >
                      Hủy bỏ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
