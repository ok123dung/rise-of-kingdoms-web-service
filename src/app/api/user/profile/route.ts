import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { prismaAdmin as prisma } from '@/lib/db'
import { AuthenticationError, ValidationError, handleApiError, ErrorMessages } from '@/lib/errors'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'
import { sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100).optional(),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .nullable(),
  discord_username: z.string().optional().nullable(),
  rok_player_id: z.string().optional().nullable(),
  rok_kingdom: z.string().optional().nullable()
})

interface UpdateProfileBody {
  full_name?: string
  phone?: string | null
  discord_username?: string | null
  rok_player_id?: string | null
  rok_kingdom?: string | null
}

// GET /api/user/profile - Get current user profile
async function getProfileHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      throw new AuthenticationError('Bạn cần đăng nhập để thực hiện thao tác này')
    }

    const user = await prisma.users.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        discord_username: true,
        rok_player_id: true,
        rok_kingdom: true,
        email_verified: true,
        image: true,
        created_at: true,
        updated_at: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy người dùng' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        discord_username: user.discord_username,
        rok_player_id: user.rok_player_id,
        rok_kingdom: user.rok_kingdom,
        email_verified: user.email_verified,
        image: user.image,
        role: authUser.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

// PUT /api/user/profile - Update current user profile
async function updateProfileHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const authUser = await getAuthenticatedUser(request)
    if (!authUser) {
      throw new AuthenticationError('Bạn cần đăng nhập để thực hiện thao tác này')
    }

    const body = (await request.json()) as UpdateProfileBody

    // Validate input
    let validatedData
    try {
      validatedData = updateProfileSchema.parse({
        full_name: body.full_name ? sanitizeInput(body.full_name) : undefined,
        phone: body.phone ? sanitizeInput(body.phone) : body.phone,
        discord_username: body.discord_username ? sanitizeInput(body.discord_username) : body.discord_username,
        rok_player_id: body.rok_player_id ? sanitizeInput(body.rok_player_id) : body.rok_player_id,
        rok_kingdom: body.rok_kingdom ? sanitizeInput(body.rok_kingdom) : body.rok_kingdom
      })
    } catch (_error) {
      throw new ValidationError(ErrorMessages.INVALID_INPUT)
    }

    // Check if phone is already taken (if updating phone)
    if (validatedData.phone) {
      const existingPhone = await prisma.users.findFirst({
        where: {
          phone: validatedData.phone,
          NOT: { id: authUser.id }
        }
      })

      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: 'Số điện thoại đã được sử dụng' },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = { updated_at: new Date() }
    if (validatedData.full_name !== undefined) updateData.full_name = validatedData.full_name
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.discord_username !== undefined) updateData.discord_username = validatedData.discord_username
    if (validatedData.rok_player_id !== undefined) updateData.rok_player_id = validatedData.rok_player_id
    if (validatedData.rok_kingdom !== undefined) updateData.rok_kingdom = validatedData.rok_kingdom

    const updatedUser = await prisma.users.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        discord_username: true,
        rok_player_id: true,
        rok_kingdom: true,
        email_verified: true,
        updated_at: true
      }
    })

    getLogger().info('User profile updated', {
      user_id: authUser.id,
      updatedFields: Object.keys(validatedData).join(', ')
    })

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        discord_username: updatedUser.discord_username,
        rok_player_id: updatedUser.rok_player_id,
        rok_kingdom: updatedUser.rok_kingdom,
        email_verified: updatedUser.email_verified,
        role: authUser.role,
        updated_at: updatedUser.updated_at
      }
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const GET = trackRequest('/api/user/profile')(withDatabaseConnection(getProfileHandler))
export const PUT = trackRequest('/api/user/profile')(withDatabaseConnection(updateProfileHandler))
