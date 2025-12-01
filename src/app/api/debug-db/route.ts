import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

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
}

export async function GET(): Promise<NextResponse<DebugDbResponse>> {
  // Block access in production
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL_SET: false,
          DIRECT_URL_SET: false
        },
        error: 'Debug endpoint disabled in production'
      },
      { status: 404 }
    )
  }

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
    await prisma.$queryRaw`SELECT 1 as result`
    await prisma.$disconnect()

    response.success = true
    response.message = 'Connection successful'

    return NextResponse.json(response)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    response.success = false
    response.message = 'Connection failed'
    response.error = errorMessage

    return NextResponse.json(response, { status: 500 })
  }
}
