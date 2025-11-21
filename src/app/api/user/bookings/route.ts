import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await db.booking.findByUser(session.user.id)

    return NextResponse.json({
      success: true,
      bookings: bookings || []
    })
  } catch (error) {
    getLogger().error('Error fetching user bookings', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
