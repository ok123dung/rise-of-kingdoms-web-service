import { type NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { getLogger } from '@/lib/monitoring/logger'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

interface ForgotPasswordRequest {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForgotPasswordRequest
    const result = forgotPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Even if user not found, we return success to prevent email enumeration
    if (!user) {
      // Log for debugging but don't reveal to user
      getLogger().info(`Forgot password requested for non-existent email: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.'
      })
    }

    // 2. Generate token
    const token = uuidv4()

    // 3. Save token
    // First, delete any existing tokens for this user to keep it clean
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id
      }
    })

    // 4. Send email
    const emailSent = await sendPasswordResetEmail(email, token)

    if (!emailSent) {
      getLogger().error(`Failed to send password reset email to ${email}`)
      return NextResponse.json(
        { success: false, error: 'Không thể gửi email. Vui lòng thử lại sau.' },
        { status: 500 }
      )
    }

    getLogger().info(`Password reset email sent to ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.'
    })
  } catch (error) {
    getLogger().error('Forgot password error', error as Error)
    return NextResponse.json({ success: false, error: 'Đã có lỗi xảy ra' }, { status: 500 })
  }
}
