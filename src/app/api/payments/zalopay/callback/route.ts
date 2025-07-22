import { NextRequest, NextResponse } from 'next/server'
import { ZaloPayPayment } from '@/lib/payments/zalopay'

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    
    console.log('ZaloPay callback received:', {
      data: callbackData.data ? 'present' : 'missing',
      mac: callbackData.mac ? callbackData.mac.substring(0, 10) + '...' : 'missing'
    })

    const zaloPayment = new ZaloPayPayment()
    const result = await zaloPayment.handleCallback(callbackData)

    if (result.success) {
      return NextResponse.json({
        return_code: 1,
        return_message: result.message
      })
    } else {
      console.error('ZaloPay callback processing failed:', result.message)
      return NextResponse.json({
        return_code: 0,
        return_message: result.message
      })
    }
  } catch (error) {
    console.error('ZaloPay callback error:', error)
    return NextResponse.json({
      return_code: 0,
      return_message: 'Callback processing failed'
    })
  }
}
