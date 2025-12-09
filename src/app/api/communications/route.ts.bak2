import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { getLogger } from '@/lib/monitoring/logger'
import { CommunicationService } from '@/services/communication.service'
import { CommunicationType } from '@/types/enums'

const communicationService = new CommunicationService()
const logger = getLogger()

const sendMessageSchema = z.object({
  user_id: z.string().optional(), // Optional if sending to self (current user)
  booking_id: z.string().optional(),
  type: z.nativeEnum(CommunicationType),
  content: z.string().min(1, 'Content is required'),
  subject: z.string().optional()
})

interface SendMessageRequest {
  user_id?: string
  booking_id?: string
  type: CommunicationType
  content: string
  subject?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as SendMessageRequest
    const data = sendMessageSchema.parse(body)

    // Determine target user
    let targetUserId = session.user.id

    // If admin/staff is sending to another user
    if (['admin', 'manager', 'staff'].includes(session.user.role) && data.user_id) {
      targetUserId = data.user_id
    }

    const message = await communicationService.sendMessage({
      user_id: targetUserId,
      booking_id: data.booking_id,
      type: data.type,
      content: data.content,
      subject: data.subject
    })

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    logger.error('Failed to send message', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const booking_id = searchParams.get('booking_id') ?? undefined
    const user_idParam = searchParams.get('user_id')

    // Determine whose history to fetch
    let targetUserId = session.user.id

    // Admin can view anyone's history
    if (['admin', 'manager', 'staff'].includes(session.user.role) && user_idParam) {
      targetUserId = user_idParam
    }

    const history = await communicationService.getHistory(targetUserId, booking_id)

    return NextResponse.json({ success: true, history })
  } catch (error) {
    logger.error('Failed to fetch communication history', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
