import { compare, hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { prismaAdmin as prisma } from '@/lib/db'
import { AuthenticationError, ValidationError, handleApiError, ErrorMessages } from '@/lib/errors'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

async function changePasswordHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      throw new AuthenticationError('Bạn cần đăng nhập để thực hiện thao tác này')
    }

    const body = (await request.json()) as ChangePasswordBody

    let validatedData
    try {
      validatedData = changePasswordSchema.parse(body)
    } catch (_error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { id: authUser.id },
      select: { id: true, password: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản này không sử dụng đăng nhập bằng mật khẩu' },
        { status: 400 }
      )
    }

    const isValid = await compare(validatedData.currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu hiện tại không đúng' },
        { status: 400 }
      )
    }

    // Hash new password (14 rounds - OWASP recommendation)
    const hashedPassword = await hash(validatedData.newPassword, 14)

    // Update password
    await prisma.users.update({
      where: { id: authUser.id },
      data: {
        password: hashedPassword,
        updated_at: new Date()
      }
    })

    getLogger().info('User changed password', { userId: authUser.id })

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const PUT = trackRequest('/api/user/password')(withDatabaseConnection(changePasswordHandler))
