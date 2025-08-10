import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().regex(/^(0|\+84)[0-9]{9,10}$/).optional().nullable(),
  discordUsername: z.string().optional().nullable(),
  rokPlayerId: z.string().optional().nullable(),
  rokKingdom: z.string().optional().nullable()
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        ...(validatedData.fullName && { fullName: validatedData.fullName }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone || null }),
        ...(validatedData.discordUsername !== undefined && { discordUsername: validatedData.discordUsername || null }),
        ...(validatedData.rokPlayerId !== undefined && { rokPlayerId: validatedData.rokPlayerId || null }),
        ...(validatedData.rokKingdom !== undefined && { rokKingdom: validatedData.rokKingdom || null })
      }
    })

    getLogger().info('User profile updated', {
      userId: session.user.id,
      updatedFields: Object.keys(validatedData)
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        discordUsername: updatedUser.discordUsername,
        rokPlayerId: updatedUser.rokPlayerId,
        rokKingdom: updatedUser.rokKingdom
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }

    getLogger().error('Error updating user profile', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}