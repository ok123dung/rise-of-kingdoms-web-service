import { NextRequest, NextResponse } from 'next/server'
import { ZaloPayPayment } from '@/lib/payments/zalopay'
import { getLogger } from '@/lib/monitoring/logger'

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    
    getLogger().info('ZaloPay callback received', {
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
      getLogger().error('ZaloPay callback processing failed', { message: result.message })
      return NextResponse.json({
        return_code: 0,
        return_message: result.message
      })
    }
  } catch (error) {
    getLogger().error('ZaloPay callback error', { error })
    return NextResponse.json({
      return_code: 0,
      return_message: 'Callback processing failed'
    })
  }
}
