import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const diagnostics: {
    timestamp: string
    environment: string | undefined
    database: {
      configured: boolean
      urlPrefix: string
      status?: string
      message?: string
    }
    nextAuth: {
      urlConfigured: boolean
      secretConfigured: boolean
    }
  } = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      configured: !!process.env.DATABASE_URL,
      urlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET',
    },
    nextAuth: {
      urlConfigured: !!process.env.NEXTAUTH_URL,
      secretConfigured: !!process.env.NEXTAUTH_SECRET,
    }
  }

  try {
    // Try to connect to database
    await prisma.$connect()
    
    // Try a simple query
    await prisma.$queryRaw`SELECT 1`
    
    diagnostics.database.status = 'connected'
    diagnostics.database.message = 'Database connection successful'
    
    return NextResponse.json({
      status: 'healthy',
      ...diagnostics
    })
  } catch (error) {
    diagnostics.database.status = 'error'
    diagnostics.database.message = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      status: 'unhealthy',
      ...diagnostics
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}