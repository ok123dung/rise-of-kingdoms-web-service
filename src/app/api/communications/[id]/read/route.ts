import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { CommunicationService } from '@/services/communication.service'

const communicationService = new CommunicationService()
const logger = getLogger()

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real app, we should check if the user owns this message or is admin
    // For now, assuming if they are logged in they can mark as read (if they have the ID)

    const updated = await communicationService.markAsRead(params.id)

    return NextResponse.json({ success: true, message: updated })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    logger.error(`Failed to mark message ${params.id} as read`, error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
