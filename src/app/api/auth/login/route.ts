import { compare } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  isAccountLocked,
  recordFailedAttempt,
  clearLockout,
  formatLockoutDuration,
} from '@/lib/account-lockout'
import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { generateToken } from '@/lib/auth/jwt'
import { prismaAdmin as prisma } from '@/lib/db'
import { AuthenticationError, ValidationError, handleApiError, ErrorMessages } from '@/lib/errors'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'
import { rateLimiters } from '@/lib/rate-limit'
import { sanitizeInput } from '@/lib/validation'

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase(),
  password: z.string().min(1, 'Mật khẩu không được để trống')
})

interface LoginBody {
  email: string
  password: string
}

const loginHandler = async function (request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting - prevent brute force attacks
    const clientId = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const rateLimit = await rateLimiters.auth.isAllowed(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau.',
          retryAfter: rateLimit.retryAfter
        },
        { status: 429 }
      )
    }

    // Get email from body for lockout check (parse early)
    const rawBody = (await request.json()) as { email?: string; password?: string }
    const emailForLockout = (rawBody.email ?? '').toLowerCase().trim()

    // Check account lockout status
    if (emailForLockout) {
      const lockoutStatus = await isAccountLocked(emailForLockout)
      if (lockoutStatus.isLocked) {
        const duration = formatLockoutDuration(lockoutStatus.lockoutDuration ?? 0)
        getLogger().warn('Login attempt on locked account', {
          email: emailForLockout,
          lockoutUntil: lockoutStatus.lockoutUntil,
        })
        return NextResponse.json(
          {
            error: `Tài khoản đã bị khóa. Vui lòng thử lại sau ${duration}.`,
            lockedUntil: lockoutStatus.lockoutUntil,
          },
          { status: 423 }
        )
      }
    }

    const body = rawBody as LoginBody

    // Validate input
    let validatedData
    try {
      validatedData = loginSchema.parse({
        email: sanitizeInput((body.email ?? '').toLowerCase()),
        password: body.password ?? ''
      })
    } catch (_error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
        full_name: true,
        email_verified: true
      }
    })

    // Check user exists and has password
    if (!user?.password) {
      // Record failed attempt for lockout
      await recordFailedAttempt(validatedData.email)
      getLogger().warn('Login failed: user not found or no password', {
        email: validatedData.email,
      })
      throw new AuthenticationError('Email hoặc mật khẩu không chính xác')
    }

    // Verify password
    const isPasswordValid = await compare(validatedData.password, user.password)
    if (!isPasswordValid) {
      // Record failed attempt for lockout
      const lockoutResult = await recordFailedAttempt(validatedData.email)
      getLogger().warn('Login failed: invalid password', {
        email: validatedData.email,
        attemptsRemaining: lockoutResult.attemptsRemaining,
        isLocked: lockoutResult.isLocked,
      })
      if (lockoutResult.isLocked) {
        const duration = formatLockoutDuration(lockoutResult.lockoutDuration ?? 0)
        return NextResponse.json(
          {
            error: `Quá nhiều lần đăng nhập thất bại. Tài khoản đã bị khóa trong ${duration}.`,
            lockedUntil: lockoutResult.lockoutUntil,
          },
          { status: 423 }
        )
      }
      throw new AuthenticationError('Email hoặc mật khẩu không chính xác')
    }

    // Generate JWT token (default role: customer)
    const token = generateToken({
      user_id: user.id,
      email: user.email,
      role: 'customer'
    })

    // Clear any lockout on successful login
    await clearLockout(validatedData.email)

    // Log successful login
    getLogger().info('User logged in', {
      user_id: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: 'customer',
        email_verified: user.email_verified
      },
      token
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const POST = trackRequest('/api/auth/login')(withDatabaseConnection(loginHandler))
