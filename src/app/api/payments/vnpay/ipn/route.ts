import { type NextRequest, NextResponse } from 'next/server'

import { getLogger } from '@/lib/monitoring/logger'
import { VNPayPayment } from '@/lib/payments/vnpay'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query: { [key: string]: string } = {}

    // Convert URLSearchParams to object safely (prevent prototype pollution)
    const allowedKeys = new Set([
      'vnp_TmnCode', 'vnp_Amount', 'vnp_BankCode', 'vnp_BankTranNo',
      'vnp_CardType', 'vnp_PayDate', 'vnp_OrderInfo', 'vnp_TransactionNo',
      'vnp_ResponseCode', 'vnp_TransactionStatus', 'vnp_TxnRef',
      'vnp_SecureHashType', 'vnp_SecureHash'
    ])
    searchParams.forEach((value, key) => {
      // Only allow known VNPay parameter keys to prevent prototype pollution
      if (allowedKeys.has(key) && !key.startsWith('__') && key !== 'constructor' && key !== 'prototype') {
        query[key] = value
      }
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
        RspCode: result.responseCode ?? '00',
        Message: result.message
      })
    } else {
      getLogger().error('VNPay IPN processing failed', undefined, { message: result.message })
      return NextResponse.json({
        RspCode: result.responseCode ?? '99',
        Message: result.message
      })
    }
  } catch (error) {
    getLogger().error('VNPay IPN error', error instanceof Error ? error : new Error(String(error)))
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
