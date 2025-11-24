'use client'

import { useState } from 'react'

import { Shield, AlertCircle } from 'lucide-react'

interface TwoFactorVerifyProps {
  onVerify: (token: string) => Promise<boolean>
  onCancel?: () => void
  email?: string
}

export default function TwoFactorVerify({ onVerify, onCancel, email }: TwoFactorVerifyProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code || (useBackupCode ? code.length < 8 : code.length !== 6)) {
      setError(useBackupCode ? 'Vui lòng nhập mã backup đầy đủ' : 'Vui lòng nhập mã 6 số')
      return
    }

    setLoading(true)
    setError('')

    try {
      const success = await onVerify(code)

      if (!success) {
        setError('Mã xác thực không đúng')
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-6 text-center">
        <Shield className="mx-auto mb-4 h-16 w-16 text-blue-600" />
        <h2 className="mb-2 text-2xl font-bold">Xác Thực Hai Yếu Tố</h2>
        <p className="text-gray-600">
          {email && <span className="mb-2 block text-sm">{email}</span>}
          {useBackupCode
            ? 'Nhập một trong các mã backup của bạn'
            : 'Nhập mã 6 số từ ứng dụng authenticator'}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <input
            autoFocus
            autoComplete="off"
            className="w-full rounded-lg border px-4 py-3 text-center text-2xl tracking-widest focus:border-transparent focus:ring-2 focus:ring-blue-500"
            maxLength={useBackupCode ? 9 : 6} // XXXX-XXXX format for backup
            placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
            type="text"
            value={code}
            onChange={e => {
              const { value } = e.target
              if (useBackupCode) {
                // Allow alphanumeric and hyphens for backup codes
                setCode(value.toUpperCase())
              } else {
                // Only allow digits for TOTP
                setCode(value.replace(/\D/g, ''))
              }
            }}
          />
        </div>

        {error && (
          <div className="flex items-start rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          className="w-full rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || !code}
          type="submit"
        >
          {loading ? 'Đang xác thực...' : 'Xác Thực'}
        </button>

        <div className="space-y-2 pt-2 text-center">
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode)
              setCode('')
              setError('')
            }}
          >
            {useBackupCode ? 'Sử dụng ứng dụng authenticator' : 'Sử dụng mã backup'}
          </button>

          {onCancel && (
            <>
              <span className="mx-2 text-gray-400">•</span>
              <button
                className="text-sm text-gray-600 hover:text-gray-800"
                type="button"
                onClick={onCancel}
              >
                Hủy bỏ
              </button>
            </>
          )}
        </div>
      </form>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-medium">Gặp vấn đề?</h3>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Đảm bảo thời gian trên điện thoại chính xác</li>
          <li>• Mã thay đổi mỗi 30 giây</li>
          <li>• Mã backup có dạng XXXX-XXXX</li>
          <li>• Liên hệ support nếu mất quyền truy cập</li>
        </ul>
      </div>
    </div>
  )
}
