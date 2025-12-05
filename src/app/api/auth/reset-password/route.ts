import { hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { prismaAdmin as prisma } from '@/lib/db'
import { ValidationError, handleApiError, ErrorMessages } from '@/lib/errors'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'
import { rateLimiters } from '@/lib/rate-limit'

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

interface ResetPasswordRequest {
  token: string
  password: string
  confirmPassword: string
}

async function resetPasswordHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') ?? request.ip ?? 'anonymous'
    const rateLimit = await rateLimiters.auth.isAllowed(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', retryAfter: rateLimit.retryAfter },
        { status: 429 }
      )
    }

    const body = (await request.json()) as ResetPasswordRequest

    let validatedData
    try {
      validatedData = resetPasswordSchema.parse(body)
    } catch (_error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    const { token, password } = validatedData

    // Find token
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { token },
      include: { users: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      )
    }

    // Check expiration (1 hour)
    const now = new Date()
    const tokenCreated = new Date(resetToken.created_at)
    const diffMs = now.getTime() - tokenCreated.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours > 1) {
      // Delete expired token
      await prisma.password_reset_tokens.delete({ where: { id: resetToken.id } })
      return NextResponse.json(
        { success: false, error: 'Link đặt lại mật khẩu đã hết hạn' },
        { status: 400 }
      )
    }

    // Hash new password (14 rounds - OWASP recommendation)
    const hashedPassword = await hash(password, 14)

    // Update password and delete token in transaction
    await prisma.$transaction([
      prisma.users.update({
        where: { id: resetToken.user_id },
        data: {
          password: hashedPassword,
          updated_at: new Date()
        }
      }),
      prisma.password_reset_tokens.delete({
        where: { id: resetToken.id }
      })
    ])

    getLogger().info(`Password reset successfully for user ${resetToken.user_id}`)

    return NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.'
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const POST = trackRequest('/api/auth/reset-password')(withDatabaseConnection(resetPasswordHandler))
