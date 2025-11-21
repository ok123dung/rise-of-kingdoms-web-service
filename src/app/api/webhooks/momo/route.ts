import crypto from 'crypto'

import { type NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/lib/monitoring/logger'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit'
import { webhookService } from '@/lib/webhooks/processor'
import { validateWebhookReplayProtection } from '@/lib/webhooks/replay-protection'

export async function POST(request: NextRequest) {
  // Apply rate limiting for webhook endpoint
  const rateLimitResponse = await withRateLimit(request, rateLimiters.webhookMomo)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()

    // Verify webhook signature
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = body

    // Verify signature
    const rawSignature =
      `accessKey=${process.env.MOMO_ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`

    const expectedSignature = crypto
      .createHmac('sha256', process.env.MOMO_SECRET_KEY || '')
      .update(rawSignature)
      .digest('hex')

    if (signature !== expectedSignature) {
      getLogger().error('Invalid MoMo webhook signature', new Error('Invalid signature'), {
        orderId
      })
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    }

    // Replay protection: validate timestamp and check for duplicates
    const eventId = `momo_${orderId}_${transId}`
    const replayValidation = await validateWebhookReplayProtection(
      'momo',
      eventId,
      responseTime // MoMo timestamp in milliseconds
    )

    if (!replayValidation.valid) {
      getLogger().warn('MoMo webhook replay attack detected', {
        eventId,
        error: replayValidation.error,
        isDuplicate: replayValidation.isDuplicate
      })

      // Return success to prevent retries, but don't process
      return NextResponse.json({
        message: replayValidation.isDuplicate ? 'Already processed' : 'Invalid request',
        resultCode: 0
      })
    }

    // Store webhook event for processing
    await webhookService.storeWebhookEvent('momo', 'payment_notification', eventId, body)

    // Process immediately
    const processed = await webhookService.processWebhookEvent(eventId)

    if (!processed) {
      getLogger().warn('MoMo webhook processing deferred', { eventId })
    }

    // Always return success to MoMo
    return NextResponse.json({
      message: 'Webhook received',
      resultCode: 0
    })
  } catch (error) {
    getLogger().error('MoMo webhook error', error as Error)

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
