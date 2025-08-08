import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signupSchema } from '@/lib/validation'
import { trackRequest } from '@/lib/monitoring'
import { sanitizeInput } from '@/lib/validation'
import { sendWelcomeEmail } from '@/lib/email'
import { getLogger } from '@/lib/monitoring/logger'
import { 
  ConflictError, 
  ValidationError, 
  handleDatabaseError, 
  handleApiError,
  ErrorMessages 
} from '@/lib/errors'

export const POST = trackRequest('/api/auth/signup')(async function(request: NextRequest) {
  try {
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
          emailVerified: null, // Will be verified later if needed
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
      getLogger().error('Failed to send welcome email', { 
        error: emailError as Error,
        userId: user!.id,
        email: user!.email
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