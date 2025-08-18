import { NextRequest, NextResponse } from 'next/server'
import { webhookService } from '@/lib/webhooks/processor'
import { getLogger } from '@/lib/monitoring/logger'

// This endpoint should be called by a cron job service
// Example: Vercel Cron, GitHub Actions, or external cron service

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    getLogger().info('Running webhook cron job')

    // Process pending webhooks
    await webhookService.processPendingWebhooks()

    // Cleanup old webhooks (run less frequently)
    const shouldCleanup = Math.random() < 0.1 // 10% chance
    if (shouldCleanup) {
      await webhookService.cleanupOldWebhooks(30)
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook cron job completed'
    })
  } catch (error) {
    getLogger().error('Webhook cron job error', error as Error)
    
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}