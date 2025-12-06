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
  try {
    const body = (await request.json()) as Check2FARequest
    const { email, password } = checkSchema.parse(body)

    // Find user
    const user = await prisma.users.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({
        requires2FA: false,
        error: 'Invalid credentials'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password || '')

    if (!isValidPassword) {
      return NextResponse.json({
        requires2FA: false,
        error: 'Invalid credentials'
      })
    }

    // Check if 2FA is enabled
    const is2FAEnabled = await TwoFactorAuthService.isEnabled(user.id)

    return NextResponse.json({
      requires2FA: is2FAEnabled,
      user_id: user.id
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    getLogger().error('2FA check error', error as Error)

    return NextResponse.json({ error: 'Failed to check 2FA status' }, { status: 500 })
  }
}
