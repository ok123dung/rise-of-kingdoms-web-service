import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { getLogger } from '@/lib/monitoring/logger'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const regenerateSchema = z.object({
  password: z.string().min(1)
})

// Regenerate backup codes
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
    const { password } = regenerateSchema.parse(body)

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Check if 2FA is enabled
    const isEnabled = await TwoFactorAuthService.isEnabled(session.user.id)
    
    if (!isEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      )
    }

    // Generate new backup codes
    const backupCodes = await TwoFactorAuthService.regenerateBackupCodes(
      session.user.id
    )

    return NextResponse.json({
      success: true,
      backupCodes,
      message: 'Backup codes regenerated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    getLogger().error('Backup codes regeneration error', error as Error)
    
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    )
  }
}