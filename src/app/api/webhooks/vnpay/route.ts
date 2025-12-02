import crypto from 'crypto'

import { type NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/lib/monitoring/logger'
import { withRateLimit, rateLimiters } from '@/lib/rate-limit'
import { getWebhookService } from '@/lib/webhooks/processor'
import { validateWebhookReplayProtection } from '@/lib/webhooks/replay-protection'
import { parseVNPayTimestamp } from '@/lib/webhooks/timestamp-utils'
import type { VNPayWebhookParams } from '@/types/webhook-payloads'

export const dynamic = 'force-dynamic'

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {}
  const keys = Object.keys(obj).sort()
  keys.forEach(key => {
    sorted[key] = obj[key]
  })
  return sorted
}

export async function GET(request: NextRequest) {
  // Apply rate limiting for webhook endpoint
  const rateLimitResponse = await withRateLimit(request, rateLimiters.webhookVnpay)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = request.nextUrl
    const vnpParams: Partial<VNPayWebhookParams> = {}

    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        vnpParams[key as keyof VNPayWebhookParams] = value
      }
    })

    const secureHash = vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHashType']

    // Sort parameters - filter undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(vnpParams).filter(([_, v]) => v !== undefined)
    ) as Record<string, string>
    const sortedParams = sortObject(cleanParams)
    const signData = new URLSearchParams(sortedParams).toString()

    // Verify signature
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET ?? '')
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash !== signed) {
      getLogger().error('Invalid VNPay webhook signature')
      return NextResponse.json({
        RspCode: '97',
        Message: 'Invalid signature'
      })
    }

    // Replay protection: validate timestamp and check for duplicates
    const eventId = `vnpay_${vnpParams.vnp_TxnRef}_${vnpParams.vnp_TransactionNo}`
    // Parse VNPay timestamp (yyyyMMddHHmmss) to milliseconds
    const timestampMs = parseVNPayTimestamp(vnpParams.vnp_PayDate)
    const replayValidation = await validateWebhookReplayProtection('vnpay', eventId, timestampMs)

    if (!replayValidation.valid) {
      getLogger().warn('VNPay webhook replay attack detected', {
        eventId,
        error: replayValidation.error,
        isDuplicate: replayValidation.isDuplicate
      })

      // Return success to prevent retries, but don't process
      return NextResponse.json({
        RspCode: '00',
        Message: replayValidation.isDuplicate ? 'Already processed' : 'Invalid request'
      })
    }

    const webhookService = await getWebhookService()

    // Store webhook event for processing
    await webhookService.storeWebhookEvent('vnpay', 'payment_notification', eventId, vnpParams)

    // Process immediately
    const processed = await webhookService.processWebhookEvent(eventId)

    if (!processed) {
      getLogger().warn('VNPay webhook processing deferred', { eventId })
    }

    // Always return success to VNPay
    return NextResponse.json({
      RspCode: '00',
      Message: 'success'
    })
  } catch (error) {
    getLogger().error('VNPay webhook error', error as Error)

    return NextResponse.json({
      RspCode: '99',
      Message: 'Internal server error'
    })
  }
}
