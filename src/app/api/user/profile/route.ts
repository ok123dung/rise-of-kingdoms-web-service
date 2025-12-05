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
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100).optional(),
  phone: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .nullable(),
  discordUsername: z.string().optional().nullable(),
  rokPlayerId: z.string().optional().nullable(),
  rokKingdom: z.string().optional().nullable()
})

interface UpdateProfileBody {
  fullName?: string
  phone?: string | null
  discordUsername?: string | null
  rokPlayerId?: string | null
  rokKingdom?: string | null
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
        fullName: user.full_name,
        phone: user.phone,
        discordUsername: user.discord_username,
        rokPlayerId: user.rok_player_id,
        rokKingdom: user.rok_kingdom,
        emailVerified: user.email_verified,
        image: user.image,
        role: authUser.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
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
        fullName: body.fullName ? sanitizeInput(body.fullName) : undefined,
        phone: body.phone ? sanitizeInput(body.phone) : body.phone,
        discordUsername: body.discordUsername ? sanitizeInput(body.discordUsername) : body.discordUsername,
        rokPlayerId: body.rokPlayerId ? sanitizeInput(body.rokPlayerId) : body.rokPlayerId,
        rokKingdom: body.rokKingdom ? sanitizeInput(body.rokKingdom) : body.rokKingdom
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
    if (validatedData.fullName !== undefined) updateData.full_name = validatedData.fullName
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.discordUsername !== undefined) updateData.discord_username = validatedData.discordUsername
    if (validatedData.rokPlayerId !== undefined) updateData.rok_player_id = validatedData.rokPlayerId
    if (validatedData.rokKingdom !== undefined) updateData.rok_kingdom = validatedData.rokKingdom

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
      userId: authUser.id,
      updatedFields: Object.keys(validatedData).join(', ')
    })

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        phone: updatedUser.phone,
        discordUsername: updatedUser.discord_username,
        rokPlayerId: updatedUser.rok_player_id,
        rokKingdom: updatedUser.rok_kingdom,
        emailVerified: updatedUser.email_verified,
        role: authUser.role,
        updatedAt: updatedUser.updated_at
      }
    })
  } catch (error) {
    return handleApiError(error, request.headers.get('x-request-id') ?? undefined)
  }
}

export const GET = trackRequest('/api/user/profile')(withDatabaseConnection(getProfileHandler))
export const PUT = trackRequest('/api/user/profile')(withDatabaseConnection(updateProfileHandler))
