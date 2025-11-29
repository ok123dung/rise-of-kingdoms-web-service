import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  console.log('Direct URL:', process.env.DIRECT_URL ? 'Set' : 'Not set')
  console.log('NextAuth Secret:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set')
  console.log('NextAuth URL:', process.env.NEXTAUTH_URL ? 'Set' : 'Not set')

  const response: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL_SET: !!dbUrl,
      DIRECT_URL_SET: !!directUrl,
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL_SET: !!process.env.NEXTAUTH_URL,
      DATABASE_URL_FORMAT: dbUrl ? 'postgresql://...' : 'NOT_SET',
      DATABASE_URL_LENGTH: dbUrl?.length || 0,
      DATABASE_URL_MASKED: dbUrl?.replace(/:[^:]*@/, ':****@').substring(0, 100) || 'NOT_SET'
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
    },
    log: ['query', 'info', 'warn', 'error']
  })

  try {
    console.log('[DEBUG-DB] Attempting connection...')
    await prisma.$connect()
    console.log('[DEBUG-DB] Connection successful')

    const result =
      await prisma.$queryRaw`SELECT 1 as result, current_database() as db, version() as version`
    console.log('[DEBUG-DB] Query successful:', result)

    await prisma.$disconnect()

    response.success = true
    response.message = 'Connection successful'
    response.result = result

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[DEBUG-DB] Connection failed:', error)

    response.success = false
    response.message = 'Connection failed'
    response.error = {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 5)
    }

    return NextResponse.json(response, { status: 500 })
  }
}
