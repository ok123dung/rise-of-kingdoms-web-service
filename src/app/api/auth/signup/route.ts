import { hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'

import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { validateCSRF } from '@/lib/csrf-protection'
import { prismaAdmin as prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import {
  ConflictError,
  ValidationError,
  handleDatabaseError,
  handleApiError,
  ErrorMessages
} from '@/lib/errors'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'
import { rateLimiters } from '@/lib/rate-limit'
import { signupSchema, sanitizeInput } from '@/lib/validation'

interface SignupBody {
  full_name: string
  email: string
  phone?: string
  password: string
}

const signupHandler = async function (request: NextRequest): Promise<NextResponse> {
  try {
    // CSRF protection - prevent cross-site request forgery
    const csrfValidation = validateCSRF(request)
    if (!csrfValidation.valid) {
      getLogger().warn('CSRF validation failed on signup', {
        reason: csrfValidation.reason,
        ip: request.headers.get('x-forwarded-for') ?? request.ip
      })
      return NextResponse.json(
        { error: 'Invalid request. Please refresh and try again.' },
        { status: 403 }
      )
    }

    // Rate limiting - prevent registration spam
    const clientId = request.headers.get('x-forwarded-for') ?? request.ip ?? 'anonymous'
    const rateLimit = await rateLimiters.auth.isAllowed(clientId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', retryAfter: rateLimit.retryAfter },
        { status: 429 }
      )
    }

    const body = (await request.json()) as SignupBody

    // Validate input
    let validatedData
    try {
      validatedData = signupSchema.parse({
        full_name: sanitizeInput(body.full_name ?? ''),
        email: sanitizeInput((body.email ?? '').toLowerCase()),
        phone: body.phone ? sanitizeInput(body.phone) : null,
        password: body.password ?? ''
      })
    } catch (_error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      throw new ConflictError('Email đã được sử dụng')
    }

    // Check phone number if provided
    if (validatedData.phone) {
      const existingPhone = await prisma.users.findFirst({
        where: {
          phone: validatedData.phone
        }
      })

      if (existingPhone) {
        throw new ConflictError('Số điện thoại đã được sử dụng')
      }
    }

    // Hash password (14 rounds for better security - OWASP recommendation)
    const hashedPassword = await hash(validatedData.password, 14)

    // Create user
    let user
    try {
      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          full_name: validatedData.full_name,
          email: validatedData.email,
          phone: validatedData.phone,
          password: hashedPassword,
          email_verified: null, // Will be verified later if needed
          updated_at: new Date()
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          created_at: true
        }
      })
    } catch (dbError) {
      handleDatabaseError(dbError)
      // handleDatabaseError always throws, but TypeScript doesn't know that
      throw dbError
    }

    // Log successful registration
    getLogger().info('New user registered', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      timestamp: new Date().toISOString()
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.full_name).catch((emailError: unknown) => {
      getLogger().error(
        'Failed to send welcome email',
        emailError instanceof Error ? emailError : new Error(String(emailError)),
        {
          user_id: user.id,
          email: user.email
        }
      )
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Tài khoản đã được tạo thành công',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: 'customer' // default role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const POST = trackRequest('/api/auth/signup')(withDatabaseConnection(signupHandler))
