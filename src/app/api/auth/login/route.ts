import { compare } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
    const clientId = request.headers.get('x-forwarded-for') ?? request.ip ?? 'anonymous'
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

    const body = (await request.json()) as LoginBody

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
      throw new AuthenticationError('Email hoặc mật khẩu không chính xác')
    }

    // Verify password
    const isPasswordValid = await compare(validatedData.password, user.password)
    if (!isPasswordValid) {
      throw new AuthenticationError('Email hoặc mật khẩu không chính xác')
    }

    // Generate JWT token (default role: customer)
    const token = generateToken({
      user_id: user.id,
      email: user.email,
      role: 'customer'
    })

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
