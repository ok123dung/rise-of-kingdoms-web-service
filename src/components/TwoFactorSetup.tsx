'use client'

import { useState } from 'react'
import { Shield, Smartphone, Copy, AlertCircle, CheckCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup'>('intro')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Start 2FA setup
  const handleStartSetup = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setBackupCodes(data.backupCodes)
        setStep('setup')
      } else {
        setError(data.error || 'Failed to start 2FA setup')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Verify and enable 2FA
  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode })
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        setStep('backup')
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Copy backup code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Copy all backup codes
  const handleCopyAllCodes = () => {
    const allCodes = backupCodes.join('\n')
    navigator.clipboard.writeText(allCodes)
    setCopiedCode('all')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Download backup codes
  const handleDownloadCodes = () => {
    const content = `RoK Services - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}
User: ${session?.user?.email}

IMPORTANT: Keep these codes safe! Each code can only be used once.

${backupCodes.join('\n')}

If you lose access to your authenticator app, you can use one of these codes to sign in.
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rok-services-2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Intro Step */}
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bảo Vệ Tài Khoản Với 2FA</h2>
            <p className="text-gray-600">
              Xác thực hai yếu tố (2FA) thêm một lớp bảo mật cho tài khoản của bạn
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Cách hoạt động:</h3>
            <ol className="space-y-2 text-sm">
              <li>1. Cài đặt ứng dụng authenticator trên điện thoại</li>
              <li>2. Quét mã QR hoặc nhập mã bí mật</li>
              <li>3. Nhập mã xác thực 6 số để kích hoạt</li>
              <li>4. Lưu mã backup phòng khi mất điện thoại</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
            <span className="text-sm">
              Đề xuất: Google Authenticator, Microsoft Authenticator, hoặc Authy
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Bắt Đầu Cài Đặt'}
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
              >
                Để Sau
              </button>
            )}
          </div>
        </div>
      )}

      {/* Setup Step */}
      {step === 'setup' && (
        <div className="space-y-6">
          <div className="text-center">
            <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quét Mã QR</h2>
            <p className="text-gray-600">
              Sử dụng ứng dụng authenticator để quét mã QR bên dưới
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <img src={qrCode} alt="2FA QR Code" className="mx-auto" />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Không thể quét mã?</p>
            <p className="text-xs text-gray-600 mb-2">Nhập mã này vào ứng dụng:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white px-3 py-2 rounded border text-xs break-all">
                {secret}
              </code>
              <button
                onClick={() => handleCopyCode(secret)}
                className="p-2 hover:bg-gray-200 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nhập mã xác thực 6 số từ ứng dụng
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-widest px-4 py-3 border rounded-lg"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Xác Thực & Kích Hoạt'}
          </button>
        </div>
      )}

      {/* Backup Codes Step */}
      {step === 'backup' && (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">2FA Đã Được Kích Hoạt!</h2>
            <p className="text-gray-600">
              Lưu các mã backup này ở nơi an toàn
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 inline mr-2" />
            <span className="text-sm font-medium">Quan trọng:</span>
            <p className="text-sm mt-1">
              Mỗi mã chỉ dùng được một lần. Dùng khi mất điện thoại hoặc không thể truy cập authenticator.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Mã Backup</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAllCodes}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {copiedCode === 'all' ? 'Đã copy!' : 'Copy tất cả'}
                </button>
                <button
                  onClick={handleDownloadCodes}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tải xuống
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded text-sm font-mono">
                    {code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copiedCode === code ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
          >
            Hoàn Thành
          </button>
        </div>
      )}
    </div>
  )
}