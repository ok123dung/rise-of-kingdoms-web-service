import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

interface DebugDbResponse {
  timestamp: string
  environment: {
    NODE_ENV: string | undefined
    DATABASE_URL_SET: boolean
    DIRECT_URL_SET: boolean
  }
  success?: boolean
  message?: string
  error?: string
  stack?: string
  user_count?: number
}

export async function GET(): Promise<NextResponse<DebugDbResponse>> {
  const dbUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  const response: DebugDbResponse = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!dbUrl,
      DIRECT_URL_SET: !!directUrl
    }
  }

  if (!dbUrl) {
    response.error = 'DATABASE_URL is not set'
    return NextResponse.json(response, { status: 500 })
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  })

  try {
    await prisma.$connect()
    await prisma.$queryRawUnsafe('SELECT 1 as result')

    const userCount = await prisma.users.count()
    response.user_count = userCount

    await prisma.$disconnect()

    response.success = true
    response.message = 'Connection successful'

    return NextResponse.json(response)
  } catch (error: unknown) {
    const error_message = error instanceof Error ? error.message : 'Unknown error'
    const error_stack = error instanceof Error ? error.stack : undefined

    response.success = false
    response.message = 'Connection failed'
    response.error = error_message
    response.stack = error_stack

    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL is not set' }, { status: 500 })
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  })

  try {
    const body = (await request.json()) as { email?: string; full_name?: string; password?: string }
    const email = body.email ?? 'test' + Date.now() + '@example.com'
    const full_name = body.full_name ?? 'Test User Debug'
    const password = body.password ?? 'TestPass123!'

    await prisma.$connect()

    const hashedPassword = await hash(password, 14)

    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        full_name,
        email,
        password: hashedPassword,
        email_verified: null,
        updated_at: new Date()
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        created_at: true
      }
    })

    await prisma.$disconnect()

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const error_message = error instanceof Error ? error.message : 'Unknown error'
    const error_stack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        success: false,
        error: error_message,
        stack: error_stack
      },
      { status: 500 }
    )
  }
}
