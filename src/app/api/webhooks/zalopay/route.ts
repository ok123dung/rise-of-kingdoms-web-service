import crypto from 'crypto'

import { type NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/lib/monitoring/logger'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit'
import { getWebhookService } from '@/lib/webhooks/processor'
import { validateWebhookReplayProtection } from '@/lib/webhooks/replay-protection'

export async function POST(request: NextRequest) {
  // Apply rate limiting for webhook endpoint
  const rateLimitResponse = await withRateLimit(request, rateLimiters.webhookZalopay)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const formData = await request.formData()
    const data = formData.get('data') as string
    const mac = formData.get('mac') as string

    if (!data || !mac) {
      return NextResponse.json(
        { return_code: 2, return_message: 'Missing data or mac' },
        { status: 400 }
      )
    }

    // Verify MAC
    const dataStr = data.toString()
    const reqMac = crypto
      .createHmac('sha256', process.env.ZALOPAY_KEY2 ?? '')
      .update(dataStr)
      .digest('hex')

    if (mac !== reqMac) {
      getLogger().error('Invalid ZaloPay webhook MAC')
      return NextResponse.json({ return_code: -1, return_message: 'Invalid MAC' }, { status: 400 })
    }

    // Parse data
    interface ZaloPayWebhookData {
      app_trans_id: string
      zp_trans_id: string
      server_time: number
      amount: number
      discount_amount: number
      status: number
    }

    const jsonData = JSON.parse(dataStr) as ZaloPayWebhookData
    const { app_trans_id, zp_trans_id, server_time } = jsonData

    // Replay protection: validate timestamp and check for duplicates
    const eventId = `zalopay_${app_trans_id}_${zp_trans_id}`
    const replayValidation = await validateWebhookReplayProtection(
      'zalopay',
      eventId,
      server_time // ZaloPay timestamp in milliseconds
    )

    if (!replayValidation.valid) {
      getLogger().warn('ZaloPay webhook replay attack detected', {
        eventId,
        error: replayValidation.error,
        isDuplicate: replayValidation.isDuplicate
      })

      // Return success to prevent retries, but don't process
      return NextResponse.json({
        return_code: 1,
        return_message: replayValidation.isDuplicate ? 'Already processed' : 'Invalid request'
      })
    }

    const webhookService = await getWebhookService()

    // Store webhook event for processing
    await webhookService.storeWebhookEvent('zalopay', 'payment_notification', eventId, jsonData as unknown as Record<string, unknown>)

    // Process immediately
    const processed = await webhookService.processWebhookEvent(eventId)

    if (!processed) {
      getLogger().warn('ZaloPay webhook processing deferred', { eventId })
    }

    // Always return success to ZaloPay
    return NextResponse.json({
      return_code: 1,
      return_message: 'success'
    })
  } catch (error) {
    getLogger().error('ZaloPay webhook error', error as Error)

    return NextResponse.json(
      { return_code: 0, return_message: 'Internal server error' },
      { status: 500 }
    )
  }
}
