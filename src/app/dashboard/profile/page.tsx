'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserCircleIcon, PhoneIcon, EnvelopeIcon, GlobeAsiaAustraliaIcon } from '@heroicons/react/24/outline'
import { AvatarUpload } from '@/components/AvatarUpload'
const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
  discordUsername: z.string().optional(),
  rokPlayerId: z.string().optional(),
  rokKingdom: z.string().optional()
})
type ProfileFormData = z.infer<typeof profileSchema>
export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })
  // Fetch user profile data
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setProfileData(data.data)
            reset({
              fullName: data.data.fullName || '',
              phone: data.data.phone || '',
              discordUsername: data.data.discordUsername || '',
              rokPlayerId: data.data.rokPlayerId || '',
              rokKingdom: data.data.rokKingdom || ''
            })
          }
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err)
        })
    }
  }, [session, reset])
  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
        // Update session
        await update()
      } else {
        setMessage({ type: 'error', text: result.message || 'Có lỗi xảy ra' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể cập nhật thông tin' })
    } finally {
      setLoading(false)
    }
  }
  if (!session?.user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rok-gold"></div>
      </div>
    )
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
        </p>
      </div>
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
      )}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Thông tin tài khoản</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cập nhật thông tin cá nhân và liên hệ của bạn.
              </p>
              {/* Avatar Upload */}
              <div className="mt-6">
                <AvatarUpload
                  currentAvatarUrl={session?.user?.image}
                  size="lg"
                  onUploadComplete={(url) => {
                    setMessage({ type: 'success', text: 'Ảnh đại diện đã được cập nhật' })
                  }}
                />
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={session.user.email || ''}
                      disabled
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                </div>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('fullName')}
                      type="text"
                      id="fullName"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      placeholder="0901234567"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin game</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="discordUsername" className="block text-sm font-medium text-gray-700">
                        Discord Username
                      </label>
                      <input
                        {...register('discordUsername')}
                        type="text"
                        id="discordUsername"
                        placeholder="username#1234"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="rokPlayerId" className="block text-sm font-medium text-gray-700">
                        ROK Player ID
                      </label>
                      <input
                        {...register('rokPlayerId')}
                        type="text"
                        id="rokPlayerId"
                        placeholder="12345678"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="rokKingdom" className="block text-sm font-medium text-gray-700">
                        Kingdom
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <GlobeAsiaAustraliaIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...register('rokKingdom')}
                          type="text"
                          id="rokKingdom"
                          placeholder="1234"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rok-gold focus:border-rok-gold sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rok-gold hover:bg-rok-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rok-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Account Info */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Thông tin tài khoản</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">ID Tài khoản</dt>
              <dd className="mt-1 text-sm text-gray-900">{session.user.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {session.user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Hoạt động
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}