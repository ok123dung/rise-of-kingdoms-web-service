import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

import { prismaAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check env vars
    const hasDbUrl = !!process.env.DATABASE_URL
    const hasDirectUrl = !!process.env.DIRECT_URL
    const vercelEnv = process.env.VERCEL_ENV || 'none'

    // Test prismaAdmin connection
    let connectionTest = null
    let connectionError = null
    try {
      connectionTest = await prismaAdmin.$queryRaw`SELECT 1 as test`
    } catch (e) {
      connectionError = e instanceof Error ? e.message : String(e)
    }

    // Try to read users (to see if RLS blocks reads)
    let userCount = null
    let readError = null
    try {
      userCount = await prismaAdmin.users.count()
    } catch (e) {
      readError = e instanceof Error ? e.message : String(e)
    }

    // Try a test write
    let writeTest = null
    let writeError = null
    const testEmail = `test_debug_${Date.now()}@example.com`
    try {
      const hashedPassword = await hash('TestPass123!', 10)
      writeTest = await prismaAdmin.users.create({
        data: {
          id: crypto.randomUUID(),
          full_name: 'Debug Test User',
          email: testEmail,
          password: hashedPassword,
          updated_at: new Date()
        },
        select: {
          id: true,
          email: true
        }
      })

      // Clean up - delete the test user
      await prismaAdmin.users.delete({
        where: { id: writeTest.id }
      })
    } catch (e) {
      writeError = e instanceof Error ? { message: e.message, stack: e.stack?.slice(0, 500) } : String(e)
    }

    return NextResponse.json({
      env: { hasDbUrl, hasDirectUrl, vercelEnv },
      connectionTest: connectionError ? { error: connectionError } : connectionTest,
      readTest: readError ? { error: readError } : { userCount },
      writeTest: writeError ? { error: writeError } : { success: true, user: writeTest }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined
    }, { status: 500 })
  }
}
