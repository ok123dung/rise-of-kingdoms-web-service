import { NextRequest, NextResponse } from 'next/server'
import { VNPayPayment } from '@/lib/payments/vnpay'
import { getLogger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query: { [key: string]: string } = {}
    
    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      query[key] = value
    })

    getLogger().info('VNPay IPN received', {
      orderId: query.vnp_TxnRef,
      responseCode: query.vnp_ResponseCode,
      amount: query.vnp_Amount
    })

    const vnpayPayment = new VNPayPayment()
    const result = await vnpayPayment.handleIPN(query)

    if (result.success) {
      return NextResponse.json({
        RspCode: result.responseCode || '00',
        Message: result.message
      })
    } else {
      getLogger().error('VNPay IPN processing failed', { message: result.message })
      return NextResponse.json({
        RspCode: result.responseCode || '99',
        Message: result.message
      })
    }
  } catch (error) {
    getLogger().error('VNPay IPN error', { error })
    return NextResponse.json({
      RspCode: '99',
      Message: 'IPN processing failed'
    })
  }
}

export async function POST(request: NextRequest) {
  // VNPay also supports POST for IPN
  return GET(request)
}
