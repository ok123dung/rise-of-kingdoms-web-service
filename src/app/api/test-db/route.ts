import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check env vars
    const hasDbUrl = !!process.env.DATABASE_URL
    const hasDirectUrl = !!process.env.DIRECT_URL
    const nextPhase = process.env.NEXT_PHASE || 'none'
    const vercelEnv = process.env.VERCEL_ENV || 'none'
    const vercel = process.env.VERCEL || 'none'

    // Create fresh PrismaClient for testing
    const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
    if (!directUrl) {
      return NextResponse.json({
        success: false,
        hasDbUrl,
        hasDirectUrl,
        nextPhase,
        vercelEnv,
        vercel,
        error: 'No database URL configured'
      })
    }

    const testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: directUrl
        }
      }
    })

    const result = await testPrisma.$queryRawUnsafe('SELECT 1 as test')
    await testPrisma.$disconnect()

    return NextResponse.json({
      success: true,
      hasDbUrl,
      hasDirectUrl,
      nextPhase,
      vercelEnv,
      vercel,
      dbTest: result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined
    }, { status: 500 })
  }
}
