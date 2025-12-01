import bcrypt from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const disableSchema = z.object({
  password: z.string().min(1)
})

interface Disable2FARequest {
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as Disable2FARequest
    const { password } = disableSchema.parse(body)

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Disable 2FA
    const success = await TwoFactorAuthService.disable(session.user.id)

    if (!success) {
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }

    getLogger().error('2FA disable error', error as Error)

    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}
