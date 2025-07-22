import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signupSchema } from '@/lib/validation'
import { trackRequest } from '@/lib/monitoring'
import { sanitizeInput } from '@/lib/validation'

export const POST = trackRequest('/api/auth/signup')(async function(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse({
      fullName: sanitizeInput(body.fullName),
      email: sanitizeInput(body.email.toLowerCase()),
      phone: body.phone ? sanitizeInput(body.phone) : null,
      password: body.password
    })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    // Check phone number if provided
    if (validatedData.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone: validatedData.phone
        }
      })

      if (existingPhone) {
        return NextResponse.json(
          { message: 'Số điện thoại đã được sử dụng' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        // role will be set via staffProfile if needed
        emailVerified: null, // Will be verified later if needed
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        // role: true, // removed since role field doesn't exist
        createdAt: true
      }
    })

    // Log successful registration
    console.log('New user registered:', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      timestamp: new Date().toISOString()
    })

    // TODO: Send welcome email
    // await sendWelcomeEmail(user.email, user.fullName)

    return NextResponse.json(
      {
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
    console.error('Signup error:', error)

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        { message: 'Email hoặc số điện thoại đã được sử dụng' },
        { status: 400 }
      )
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Thông tin không hợp lệ' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi tạo tài khoản' },
      { status: 500 }
    )
  }
})