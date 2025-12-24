import bcrypt from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { checkBruteForce, recordFailedAttempt } from '@/lib/auth/brute-force-protection'
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

    // Get client IP for IP-based rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    // Check brute-force protection (email-based)
    const emailBruteForceResult = await checkBruteForce(email)
    if (!emailBruteForceResult.allowed) {
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, CONSTANT_RESPONSE_TIME - elapsed)
      await new Promise(resolve => setTimeout(resolve, delay))

      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Check IP-based brute-force protection (defense in depth)
    const ipBruteForceResult = await checkBruteForce(`ip:${clientIp}`, {
      maxAttempts: 20, // Higher limit per IP (multiple users might share)
      blockDurationMs: 30 * 60 * 1000, // 30 min block
      windowMs: 60 * 60 * 1000, // 1 hour window
      keyPrefix: 'bruteforce:ip'
    })
    if (!ipBruteForceResult.allowed) {
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, CONSTANT_RESPONSE_TIME - elapsed)
      await new Promise(resolve => setTimeout(resolve, delay))

      getLogger().logSecurityEvent('rate_limit_exceeded', { ip: clientIp, type: 'ip' })
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email }
    })

    // Always execute password comparison to prevent timing analysis
    const passwordHash =
      user?.password ?? '$2a$14$invalidhashtopreventtimingattacks000000000000000000000000000000'
    const isValidPassword = await bcrypt.compare(password, passwordHash)

    if (!user || !isValidPassword) {
      // Record failed attempts for both email and IP
      await Promise.all([
        recordFailedAttempt(email),
        recordFailedAttempt(`ip:${clientIp}`, {
          keyPrefix: 'bruteforce:ip',
          maxAttempts: 20,
          blockDurationMs: 30 * 60 * 1000,
          windowMs: 60 * 60 * 1000
        })
      ])

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
