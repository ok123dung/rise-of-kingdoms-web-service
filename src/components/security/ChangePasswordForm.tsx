'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ChangePasswordForm() {
    const [serverError, setServerError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema)
    })

    const onSubmit = async (data: ChangePasswordFormData) => {
        setIsLoading(true)
        setServerError('')
        setSuccessMessage('')

        try {
            const response = await fetch('/api/auth/password/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (result.success) {
                setSuccessMessage('Đổi mật khẩu thành công!')
                reset()
            } else {
                setServerError(result.error || 'Đã có lỗi xảy ra')
            }
        } catch (error) {
            setServerError('Lỗi kết nối đến máy chủ')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
                <Lock className="h-8 w-8 text-blue-600" />
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Đổi mật khẩu</h2>
                    <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
                </div>
            </div>

            {serverError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{serverError}</span>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{successMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        {...register('currentPassword')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    {errors.currentPassword && (
                        <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <input
                        type="password"
                        {...register('newPassword')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    {errors.newPassword && (
                        <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                    </button>
                </div>
            </form>
        </div>
    )
}
