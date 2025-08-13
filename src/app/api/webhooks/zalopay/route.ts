import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { webhookService } from '@/lib/webhooks/processor'
import { getLogger } from '@/lib/monitoring/logger'

export async function POST(request: NextRequest) {
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
      .createHmac('sha256', process.env.ZALOPAY_KEY2 || '')
      .update(dataStr)
      .digest('hex')

    if (mac !== reqMac) {
      getLogger().error('Invalid ZaloPay webhook MAC')
      return NextResponse.json(
        { return_code: -1, return_message: 'Invalid MAC' },
        { status: 400 }
      )
    }

    // Parse data
    const jsonData = JSON.parse(dataStr)
    const {
      app_trans_id,
      zp_trans_id,
      server_time,
      amount,
      discount_amount,
      status
    } = jsonData

    // Store webhook event for processing
    const eventId = `zalopay_${app_trans_id}_${zp_trans_id}`
    await webhookService.storeWebhookEvent(
      'zalopay',
      'payment_notification',
      eventId,
      jsonData
    )

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