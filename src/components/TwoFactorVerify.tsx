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
      setError(useBackupCode 
        ? 'Vui lòng nhập mã backup đầy đủ' 
        : 'Vui lòng nhập mã 6 số'
      )
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
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Xác Thực Hai Yếu Tố</h2>
        <p className="text-gray-600">
          {email && <span className="block text-sm mb-2">{email}</span>}
          {useBackupCode 
            ? 'Nhập một trong các mã backup của bạn'
            : 'Nhập mã 6 số từ ứng dụng authenticator'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value
              if (useBackupCode) {
                // Allow alphanumeric and hyphens for backup codes
                setCode(value.toUpperCase())
              } else {
                // Only allow digits for TOTP
                setCode(value.replace(/\D/g, ''))
              }
            }}
            maxLength={useBackupCode ? 9 : 6} // XXXX-XXXX format for backup
            placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
            className="w-full text-center text-2xl tracking-widest px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Đang xác thực...' : 'Xác Thực'}
        </button>

        <div className="text-center space-y-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode)
              setCode('')
              setError('')
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {useBackupCode 
              ? 'Sử dụng ứng dụng authenticator' 
              : 'Sử dụng mã backup'
            }
          </button>

          {onCancel && (
            <>
              <span className="text-gray-400 mx-2">•</span>
              <button
                type="button"
                onClick={onCancel}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Hủy bỏ
              </button>
            </>
          )}
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium mb-2">Gặp vấn đề?</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Đảm bảo thời gian trên điện thoại chính xác</li>
          <li>• Mã thay đổi mỗi 30 giây</li>
          <li>• Mã backup có dạng XXXX-XXXX</li>
          <li>• Liên hệ support nếu mất quyền truy cập</li>
        </ul>
      </div>
    </div>
  )
}