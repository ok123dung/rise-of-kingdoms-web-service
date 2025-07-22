import { NextRequest, NextResponse } from 'next/server'
import { MoMoPayment } from '@/lib/payments/momo'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    const signature = request.headers.get('momo-signature') || webhookData.signature
    
    console.log('MoMo webhook received:', {
      orderId: webhookData.orderId,
      resultCode: webhookData.resultCode,
      amount: webhookData.amount
    })

    const momoPayment = new MoMoPayment()
    
    // CRITICAL: Verify webhook signature to prevent fake callbacks
    if (!signature || !momoPayment.verifyWebhookSignature(webhookData, signature)) {
      console.error('MoMo webhook signature verification failed')
      return NextResponse.json({
        success: false,
        message: 'Invalid signature'
      }, { status: 403 })
    }
    
    const result = await momoPayment.handleWebhook(webhookData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      console.error('MoMo webhook processing failed:', result.message)
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 })
    }
  } catch (error) {
    console.error('MoMo webhook error:', error)
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed'
    }, { status: 500 })
  }
}
