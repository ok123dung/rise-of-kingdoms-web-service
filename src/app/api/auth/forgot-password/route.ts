import { type NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { prismaAdmin as prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { ValidationError, handleApiError, ErrorMessages } from '@/lib/errors'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'
import { rateLimiters } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase()
})

interface ForgotPasswordRequest {
  email: string
}

async function forgotPasswordHandler(request: NextRequest): Promise<NextResponse> {
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

    const body = (await request.json()) as ForgotPasswordRequest

    let validatedData
    try {
      validatedData = forgotPasswordSchema.parse({
        email: sanitizeInput((body.email ?? '').toLowerCase())
      })
    } catch (_error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    const { email } = validatedData

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, full_name: true }
    })

    // Even if user not found, return success to prevent email enumeration
    if (!user) {
      getLogger().info(`Forgot password requested for non-existent email: ${email}`)
      return NextResponse.json({
        success: true,
        message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.'
      })
    }

    // Generate token
    const token = uuidv4()

    // Delete any existing tokens for this user
    await prisma.password_reset_tokens.deleteMany({
      where: { user_id: user.id }
    })

    // Create new token
    await prisma.password_reset_tokens.create({
      data: {
        id: uuidv4(),
        token,
        user_id: user.id
      }
    })

    // Send email
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
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const POST = trackRequest('/api/auth/forgot-password')(withDatabaseConnection(forgotPasswordHandler))
