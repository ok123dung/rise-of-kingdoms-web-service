import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface RetryWebhookRequest {
  event_id: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permission
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: { staff: true }
    })

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') ?? undefined
    const provider = searchParams.get('provider') ?? undefined
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const where = {
      ...(status && { status }),
      ...(provider && { provider })
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook_events.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.webhook_events.count({ where })
    ])

    // Get stats
    const stats = await prisma.webhook_events.groupBy({
      by: ['status'],
      _count: true
    })

    const statusCounts = stats.reduce(
      (acc: Record<string, number>, curr) => {
        acc[curr.status] = curr._count
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      webhooks,
      total,
      stats: {
        total,
        pending: statusCounts.pending || 0,
        processing: statusCounts.processing || 0,
        completed: statusCounts.completed || 0,
        failed: statusCounts.failed || 0
      }
    })
  } catch (error) {
    getLogger().error('List webhooks error', error as Error)

    return NextResponse.json({ error: 'Failed to list webhooks' }, { status: 500 })
  }
}

// Retry webhook manually
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permission
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: { staff: true }
    })

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await request.json()) as RetryWebhookRequest
    const { event_id } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Reset webhook for retry
    await prisma.webhook_events.update({
      where: { event_id },
      data: {
        status: 'pending',
        next_retry_at: new Date(),
        error_message: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Webhook scheduled for retry'
    })
  } catch (error) {
    getLogger().error('Retry webhook error', error as Error)

    return NextResponse.json({ error: 'Failed to retry webhook' }, { status: 500 })
  }
}
