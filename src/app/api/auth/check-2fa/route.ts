import bcrypt from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const checkSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

interface Check2FARequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const CONSTANT_RESPONSE_TIME = 500 // ms - prevent timing attacks

  try {
    const body = (await request.json()) as Check2FARequest
    const { email, password } = checkSchema.parse(body)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email }
    })

    // Always execute password comparison to prevent timing analysis
    const passwordHash =
      user?.password ?? '$2a$14$invalidhashtopreventtimingattacks000000000000000000000000000000'
    const isValidPassword = await bcrypt.compare(password, passwordHash)

    if (!user || !isValidPassword) {
      // Add constant-time delay before responding
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, CONSTANT_RESPONSE_TIME - elapsed)
      await new Promise(resolve => setTimeout(resolve, delay))

      return NextResponse.json({
        requires2FA: false,
        error: 'Invalid credentials'
      })
    }

    // Check if 2FA is enabled
    const is2FAEnabled = await TwoFactorAuthService.isEnabled(user.id)

    // Add constant-time delay before responding
    const elapsed = Date.now() - startTime
    const delay = Math.max(0, CONSTANT_RESPONSE_TIME - elapsed)
    await new Promise(resolve => setTimeout(resolve, delay))

    // Do NOT leak user_id before authentication is complete
    return NextResponse.json({
      requires2FA: is2FAEnabled
    })
  } catch (error) {
    // Add constant-time delay before error response
    const elapsed = Date.now() - startTime
    const delay = Math.max(0, CONSTANT_RESPONSE_TIME - elapsed)
    await new Promise(resolve => setTimeout(resolve, delay))

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    getLogger().error('2FA check error', error as Error)

    return NextResponse.json({ error: 'Failed to check 2FA status' }, { status: 500 })
  }
}
