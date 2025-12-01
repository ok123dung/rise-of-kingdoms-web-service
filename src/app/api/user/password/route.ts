import bcrypt from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const validatedData = changePasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Verify current password
    // Note: If user signed up via social login and has no password, this might need special handling
    // But for now assuming password auth users
    if (user.password) {
      const isValid = await bcrypt.compare(validatedData.currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Mật khẩu hiện tại không đúng' },
          { status: 400 }
        )
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 14)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    getLogger().info('User changed password', { userId: session.user.id })

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }

    getLogger().error('Error changing password', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    )
  }
}
