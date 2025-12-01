import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { generateWebSocketToken } from '@/lib/auth/jwt'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate WebSocket token
    const token = generateWebSocketToken(session.user.id, session.user.email, session.user.role)

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
