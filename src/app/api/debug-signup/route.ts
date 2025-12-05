import { hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'

import { prismaAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Test database operations
export async function GET() {
  try {
    const hasDbUrl = !!process.env.DATABASE_URL
    const hasDirectUrl = !!process.env.DIRECT_URL
    const vercelEnv = process.env.VERCEL_ENV || 'none'

    let connectionTest = null
    let connectionError = null
    try {
      connectionTest = await prismaAdmin.$queryRaw`SELECT 1 as test`
    } catch (e) {
      connectionError = e instanceof Error ? e.message : String(e)
    }

    let userCount = null
    let readError = null
    try {
      userCount = await prismaAdmin.users.count()
    } catch (e) {
      readError = e instanceof Error ? e.message : String(e)
    }

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
        select: { id: true, email: true }
      })
      await prismaAdmin.users.delete({ where: { id: writeTest.id } })
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

// POST - Direct signup test (no middlewares)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { fullName?: string; email?: string; password?: string }

    // Basic validation
    if (!body.fullName || !body.email || !body.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prismaAdmin.users.findUnique({
      where: { email: body.email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(body.password, 14)

    // Create user
    const user = await prismaAdmin.users.create({
      data: {
        id: crypto.randomUUID(),
        full_name: body.fullName,
        email: body.email.toLowerCase(),
        password: hashedPassword,
        updated_at: new Date()
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        created_at: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined
    }, { status: 500 })
  }
}
