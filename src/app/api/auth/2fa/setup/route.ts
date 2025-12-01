import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { getLogger } from '@/lib/monitoring/logger'

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate 2FA secret and QR code
    const result = await TwoFactorAuthService.generateSecret(session.user.id, session.user.email)

    return NextResponse.json({
      success: true,
      qrCode: result.qrCode,
      secret: result.secret,
      backupCodes: result.backupCodes
    })
  } catch (error) {
    getLogger().error('2FA setup error', error as Error)

    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get 2FA status
    const status = await TwoFactorAuthService.getStatus(session.user.id)

    return NextResponse.json({
      success: true,
      status: status ?? { enabled: false, backupCodesRemaining: 0 }
    })
  } catch (error) {
    getLogger().error('2FA status error', error as Error)

    return NextResponse.json({ error: 'Failed to get 2FA status' }, { status: 500 })
  }
}
