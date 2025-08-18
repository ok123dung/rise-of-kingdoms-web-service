import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { webhookService } from '@/lib/webhooks/processor'
import { getLogger } from '@/lib/monitoring/logger'

export const dynamic = 'force-dynamic'

function sortObject(obj: any) {
  const sorted: any = {}
  const keys = Object.keys(obj).sort()
  keys.forEach(key => {
    sorted[key] = obj[key]
  })
  return sorted
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vnpParams: any = {}
    
    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        vnpParams[key] = value
      }
    })

    const secureHash = vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHashType']

    // Sort parameters
    const sortedParams = sortObject(vnpParams)
    const signData = new URLSearchParams(sortedParams).toString()
    
    // Verify signature
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET || '')
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash !== signed) {
      getLogger().error('Invalid VNPay webhook signature')
      return NextResponse.json({
        RspCode: '97',
        Message: 'Invalid signature'
      })
    }

    // Store webhook event for processing
    const eventId = `vnpay_${vnpParams.vnp_TxnRef}_${vnpParams.vnp_TransactionNo}`
    await webhookService.storeWebhookEvent(
      'vnpay',
      'payment_notification',
      eventId,
      vnpParams
    )

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