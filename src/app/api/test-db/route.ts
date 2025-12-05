import { NextResponse } from 'next/server'
import { prismaAdmin } from '@/lib/db'

export async function GET() {
  try {
    // Check env vars
    const hasDbUrl = !!process.env.DATABASE_URL
    const hasDirectUrl = !!process.env.DIRECT_URL
    
    // Test database connection
    if (prismaAdmin) {
      const result = await prismaAdmin.$queryRaw`SELECT 1 as test`
      return NextResponse.json({
        success: true,
        hasDbUrl,
        hasDirectUrl,
        dbTest: result
      })
    } else {
      return NextResponse.json({
        success: false,
        hasDbUrl,
        hasDirectUrl,
        error: 'prismaAdmin is null (build phase?)'
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
