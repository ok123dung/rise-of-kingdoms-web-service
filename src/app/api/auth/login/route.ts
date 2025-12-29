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
import { rateLimiters } from '@/lib/rate-limit'
import { securityAudit, getClientInfo } from '@/lib/security-audit'
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
  const clientInfo = getClientInfo(request.headers)

  try {
    // Rate limiting - prevent brute force attacks
    const clientId = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const rateLimit = await rateLimiters.auth.isAllowed(clientId)
    if (!rateLimit.allowed) {
      void securityAudit.rateLimited({
        ...clientInfo,
        endpoint: '/api/auth/login',
        method: 'POST',
        reason: 'Too many login attempts',
      })
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
        void securityAudit.loginBlocked({
          ...clientInfo,
          email: emailForLockout,
          endpoint: '/api/auth/login',
          reason: 'Account locked',
          lockout_duration: lockoutStatus.lockoutDuration,
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
      void securityAudit.loginFailed({
        ...clientInfo,
        email: validatedData.email,
        endpoint: '/api/auth/login',
        reason: 'User not found or no password',
      })
      throw new AuthenticationError('Email hoặc mật khẩu không chính xác')
    }

    // Verify password
    const isPasswordValid = await compare(validatedData.password, user.password)
    if (!isPasswordValid) {
      // Record failed attempt for lockout
      const lockoutResult = await recordFailedAttempt(validatedData.email)
      void securityAudit.loginFailed({
        ...clientInfo,
        user_id: user.id,
        email: validatedData.email,
        endpoint: '/api/auth/login',
        reason: 'Invalid password',
        attempts_remaining: lockoutResult.attemptsRemaining,
      })
      if (lockoutResult.isLocked) {
        const duration = formatLockoutDuration(lockoutResult.lockoutDuration ?? 0)
        void securityAudit.accountLocked({
          ...clientInfo,
          user_id: user.id,
          email: validatedData.email,
          endpoint: '/api/auth/login',
          lockout_duration: lockoutResult.lockoutDuration,
        })
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
    void securityAudit.loginSuccess({
      ...clientInfo,
      user_id: user.id,
      email: user.email,
      endpoint: '/api/auth/login',
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
