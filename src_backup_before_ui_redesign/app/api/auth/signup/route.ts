import { hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
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
import { signupSchema, sanitizeInput } from '@/lib/validation'

export const POST = trackRequest('/api/auth/signup')(async function (request: NextRequest) {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      getLogger().error('DATABASE_URL not configured')
      return NextResponse.json(
        {
          success: false,
          message:
            'Database not configured. Please set DATABASE_URL environment variable in Vercel Dashboard.',
          error_code: 'DB_NOT_CONFIGURED',
          help_url:
            'https://github.com/ok123dung/rok-services/blob/main/docs/VERCEL_DATABASE_SETUP.md'
        },
        { status: 503 }
      )
    }

    // Test database connection
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      getLogger().error('Database connection failed', dbError as Error)

      const errorInfo: any = {
        success: false,
        error_code: 'DB_CONNECTION_FAILED',
        message:
          'Unable to connect to database. This is usually due to missing or incorrect DATABASE_URL configuration.'
      }

      // Provide helpful error messages based on error type
      if (dbError instanceof Error) {
        if (dbError.message.includes('P1001')) {
          errorInfo.message =
            'Cannot reach database server. Please check DATABASE_URL and ensure it includes connection pooling parameters.'
          errorInfo.hint = 'Add ?pgbouncer=true&connection_limit=1 to your DATABASE_URL'
        } else if (dbError.message.includes('P1002')) {
          errorInfo.message = 'Database server timeout. The server took too long to respond.'
          errorInfo.hint =
            'This often happens in serverless environments. Ensure connection pooling is enabled.'
        } else if (dbError.message.includes('ECONNREFUSED')) {
          errorInfo.message = 'Connection refused by database server.'
          errorInfo.hint = 'Verify the database host and port in your DATABASE_URL.'
        } else if (dbError.message.includes('certificate') || dbError.message.includes('SSL')) {
          errorInfo.message = 'SSL/TLS connection error.'
          errorInfo.hint = 'Try adding ?sslmode=require to your DATABASE_URL.'
        }

        // In production, log full error but return sanitized message
        if (process.env.NODE_ENV !== 'production') {
          errorInfo.debug = {
            error: dbError.message,
            hasDbUrl: !!process.env.DATABASE_URL,
            urlFormat: process.env.DATABASE_URL ? 'postgresql://...' : 'not set'
          }
        }
      }

      errorInfo.help_url =
        'https://github.com/yourusername/yourrepo/blob/main/VERCEL-DEPLOYMENT-FIX.md'

      return NextResponse.json(errorInfo, { status: 503 })
    }

    const body = await request.json()

    // Validate input
    let validatedData
    try {
      validatedData = signupSchema.parse({
        fullName: sanitizeInput(body.fullName),
        email: sanitizeInput(body.email.toLowerCase()),
        phone: body.phone ? sanitizeInput(body.phone) : null,
        password: body.password
      })
    } catch (error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      throw new ConflictError('Email đã được sử dụng')
    }

    // Check phone number if provided
    if (validatedData.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone
        }
      })

      if (existingPhone) {
        throw new ConflictError('Số điện thoại đã được sử dụng')
      }
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user
    let user
    try {
      user = await prisma.user.create({
        data: {
          fullName: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone,
          password: hashedPassword,
          emailVerified: null // Will be verified later if needed
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          createdAt: true
        }
      })
    } catch (error) {
      handleDatabaseError(error)
    }

    // Log successful registration
    getLogger().info('New user registered', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      timestamp: new Date().toISOString()
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.fullName).catch(emailError => {
      getLogger().error('Failed to send welcome email', emailError as Error, {
        userId: user.id,
        email: user.email
      })
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Tài khoản đã được tạo thành công',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: 'customer' // default role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') || undefined)
  }
})
