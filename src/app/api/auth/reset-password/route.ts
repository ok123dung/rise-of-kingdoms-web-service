import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { hashPassword, savePasswordToHistory, checkPasswordHistory } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1)
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, password } = result.data

    // 1. Find token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      )
    }

    // 2. Check expiration (1 hour)
    const now = new Date()
    const tokenCreated = new Date(resetToken.createdAt)
    const diffMs = now.getTime() - tokenCreated.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours > 1) {
      // Delete expired token
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
      return NextResponse.json(
        { success: false, error: 'Link đặt lại mật khẩu đã hết hạn' },
        { status: 400 }
      )
    }

    // 3. Check password history
    const isNew = await checkPasswordHistory(resetToken.userId, password)
    if (!isNew) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể sử dụng lại 5 mật khẩu gần nhất' },
        { status: 400 }
      )
    }

    // 4. Update password
    const hashedPassword = await hashPassword(password)

    await prisma.$transaction(async tx => {
      // Update user password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      // Delete used token
      await tx.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    })

    // Save to history (outside transaction for simplicity with helper)
    await savePasswordToHistory(resetToken.userId, hashedPassword)

    getLogger().info(`Password reset successfully for user ${resetToken.userId}`)

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.'
    })
  } catch (error) {
    getLogger().error('Reset password error', error as Error)
    return NextResponse.json({ success: false, error: 'Đã có lỗi xảy ra' }, { status: 500 })
  }
}
