import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getLogger } from '@/lib/monitoring/logger'

const logger = getLogger()

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { token, password } = resetPasswordSchema.parse(body)

    // Find password reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - resetToken.createdAt.getTime()
    if (tokenAge > 24 * 60 * 60 * 1000) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: 'Token đã hết hạn' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { 
        password: hashedPassword,
        emailVerified: new Date() // Also verify email if not already
      }
    })

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })

    logger.info('Password reset successful', {
      userId: resetToken.userId,
      email: resetToken.user.email
    })

    return NextResponse.json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    logger.error('Password reset error', 
      error instanceof Error ? error : new Error('Unknown error')
    )

    return NextResponse.json(
      { error: 'Có lỗi xảy ra. Vui lòng thử lại' },
      { status: 500 }
    )
  }
}