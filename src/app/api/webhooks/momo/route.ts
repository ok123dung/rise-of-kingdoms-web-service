import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { webhookService } from '@/lib/webhooks/processor'
import { getLogger } from '@/lib/monitoring/logger'

export async function POST(request: NextRequest) {
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
      getLogger().error('Invalid MoMo webhook signature', new Error('Invalid signature'), { orderId })
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Store webhook event for processing
    const eventId = `momo_${orderId}_${transId}`
    await webhookService.storeWebhookEvent(
      'momo',
      'payment_notification',
      eventId,
      body
    )

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
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}