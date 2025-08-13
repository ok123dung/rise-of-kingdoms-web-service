import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { getLogger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const verifySchema = z.object({
  token: z.string().min(6).max(9) // 6 digits for TOTP, 9 chars for backup code (XXXX-XXXX)
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token } = verifySchema.parse(body)

    // Verify and enable 2FA
    const result = await TwoFactorAuthService.verifyAndEnable(
      session.user.id,
      token
    )

    if (!result.verified) {
      return NextResponse.json(
        { 
          verified: false,
          message: result.message || 'Invalid verification code'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: '2FA has been enabled successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    getLogger().error('2FA verification error', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    )
  }
}