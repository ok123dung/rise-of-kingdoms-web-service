'use client'

import { useState, useEffect } from 'react'

import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAsiaAustraliaIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { AvatarUpload } from '@/components/AvatarUpload'
import TwoFactorAuth from '@/components/profile/TwoFactorAuth'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  discord_username: z.string().optional(),
  rok_player_id: z.string().optional(),
  rok_kingdom: z.string().optional()
})
type ProfileFormData = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu mới')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  interface ProfileData {
    full_name: string
    phone: string
    discord_username: string
    rok_player_id: string
    rok_kingdom: string
  }

  interface ProfileResponse {
    success: boolean
    data?: ProfileData
  }

  // Fetch user profile data
  useEffect(() => {
    if (session?.user) {
      void fetch('/api/user/profile')
        .then(res => res.json() as Promise<ProfileResponse>)
        .then(data => {
          if (data.success && data.data) {
            reset({
              full_name: data.data.full_name ?? '',
              phone: data.data.phone ?? '',
              discord_username: data.data.discord_username ?? '',
              rok_player_id: data.data.rok_player_id ?? '',
              rok_kingdom: data.data.rok_kingdom ?? ''
            })
          }
        })
        .catch(err => {
          console.error('Failed to fetch profile:', err)
        })
    }
  }, [session, reset])

  interface ApiResponse {
    success?: boolean
    message?: string
    error?: string
  }

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = (await response.json()) as ApiResponse
      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
        // Update session
        await update()
      } else {
        setMessage({ type: 'error', text: result.message ?? 'Có lỗi xảy ra' })
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Không thể cập nhật thông tin' })
    } finally {
      setLoading(false)
    }
  }

  const onChangePassword = async (data: PasswordFormData) => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = (await response.json()) as ApiResponse
      if (response.ok) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
        resetPassword()
      } else {
        setMessage({ type: 'error', text: result.message ?? 'Có lỗi xảy ra' })
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'Không thể đổi mật khẩu' })
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-rok-gold h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="rounded-lg bg-white shadow">
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
                  onUploadComplete={(_url: string) => {
                    setMessage({ type: 'success', text: 'Ảnh đại diện đã được cập nhật' })
                  }}
                />
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form className="space-y-6" onSubmit={e => void handleSubmit(onSubmit)(e)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                    Email
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      disabled
                      className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-gray-500 sm:text-sm"
                      id="email"
                      type="email"
                      value={session.user.email || ''}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="full_name">
                    Họ và tên
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('full_name')}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                      id="full_name"
                      type="text"
                    />
                  </div>
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="phone">
                    Số điện thoại
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('phone')}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                      id="phone"
                      placeholder="0901234567"
                      type="tel"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="mb-4 text-sm font-medium text-gray-900">Thông tin game</h4>
                  <div className="space-y-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="discord_username"
                      >
                        Discord Username
                      </label>
                      <input
                        {...register('discord_username')}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                        id="discord_username"
                        placeholder="username#1234"
                        type="text"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="rok_player_id"
                      >
                        ROK Player ID
                      </label>
                      <input
                        {...register('rok_player_id')}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                        id="rok_player_id"
                        placeholder="12345678"
                        type="text"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700"
                        htmlFor="rok_kingdom"
                      >
                        Kingdom
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <GlobeAsiaAustraliaIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...register('rok_kingdom')}
                          className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                          id="rok_kingdom"
                          placeholder="1234"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                    type="submit"
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
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Thông tin tài khoản</h3>
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
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Hoạt động
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Đổi mật khẩu</h3>
              <p className="mt-1 text-sm text-gray-500">
                Đảm bảo sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.
              </p>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form
                className="space-y-6"
                onSubmit={e => void handleSubmitPassword(onChangePassword)(e)}
              >
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="currentPassword"
                  >
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerPassword('currentPassword')}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                      id="currentPassword"
                      type="password"
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
                    Mật khẩu mới
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerPassword('newPassword')}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                      id="newPassword"
                      type="password"
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="confirmPassword"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerPassword('confirmPassword')}
                      className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                      id="confirmPassword"
                      type="password"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    className="inline-flex justify-center rounded-md border border-transparent bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Two Factor Auth */}
      <TwoFactorAuth />
    </div>
  )
}
