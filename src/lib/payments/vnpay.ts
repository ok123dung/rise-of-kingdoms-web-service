import crypto, { timingSafeEqual } from 'crypto'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface VNPayRequest {
  booking_id: string
  amount: number
  orderInfo: string
  returnUrl?: string
  ipnUrl?: string
  locale?: string
}
interface VNPayReturnData {
  vnp_Amount: string
  vnp_BankCode: string
  vnp_BankTranNo?: string
  vnp_CardType?: string
  vnp_OrderInfo: string
  vnp_PayDate: string
  vnp_ResponseCode: string
  vnp_TmnCode: string
  vnp_TransactionNo: string
  vnp_TransactionStatus: string
  vnp_TxnRef: string
}
interface VNPayQueryResponse {
  vnp_ResponseCode: string
  vnp_Message: string
  vnp_TmnCode: string
  vnp_TxnRef: string
  vnp_Amount: string
  vnp_OrderInfo: string
  vnp_TransactionNo?: string
  vnp_BankCode?: string
  vnp_PayDate?: string
  vnp_TransactionStatus?: string
  vnp_SecureHash: string
}
interface VNPayRefundResponse {
  vnp_ResponseCode: string
  vnp_Message: string
  vnp_TmnCode: string
  vnp_TxnRef: string
  vnp_Amount: string
  vnp_OrderInfo: string
  vnp_TransactionNo?: string
  vnp_TransactionDate?: string
  vnp_CreateBy?: string
  vnp_CreateDate?: string
  vnp_IpAddr?: string
  vnp_SecureHash: string
}
export class VNPayPayment {
  private tmnCode: string
  private hashSecret: string
  private url: string
  private returnUrl: string
  private ipnUrl: string
  constructor() {
    const tmnCode = process.env.VNPAY_TMN_CODE
    const hashSecret = process.env.VNPAY_HASH_SECRET
    if (!tmnCode || !hashSecret) {
      throw new Error('VNPay payment configuration missing: VNPAY_TMN_CODE or VNPAY_HASH_SECRET')
    }
    this.tmnCode = tmnCode
    this.hashSecret = hashSecret
    this.url = process.env.VNPAY_URL ?? 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'
    this.returnUrl = process.env.NEXT_PUBLIC_SITE_URL + '/payment/vnpay/return'
    this.ipnUrl = process.env.NEXT_PUBLIC_SITE_URL + '/api/payments/vnpay/ipn'
  }
  // Tạo payment URL
  async createPaymentUrl(request: VNPayRequest): Promise<{
    success: boolean
    data?: { paymentUrl: string; orderId: string }
    error?: string
  }> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: request.booking_id }
      })
      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }
      const orderId = `VNPAY_${booking.booking_number}_${Date.now()}`
      const createDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
      const expireDate = new Date(Date.now() + 15 * 60 * 1000)
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\..+/, '') // 15 minutes
      // Build VNPay parameters
      const vnpParams: { [key: string]: string } = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.tmnCode,
        vnp_Amount: (request.amount * 100).toString(), // VNPay requires amount in VND cents
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: request.orderInfo,
        vnp_OrderType: 'other',
        vnp_Locale: request.locale ?? 'vn',
        vnp_ReturnUrl: request.returnUrl ?? this.returnUrl,
        vnp_IpnUrl: request.ipnUrl ?? this.ipnUrl,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate
      }
      // Sort parameters
      const sortedParams = Object.keys(vnpParams).sort()
      // Create query string for signature
      const signData = sortedParams
        .map(key => `${key}=${encodeURIComponent(vnpParams[key])}`)
        .join('&')
      // Create signature
      const signature = crypto.createHmac('sha512', this.hashSecret).update(signData).digest('hex')
      // Add signature to parameters
      vnpParams.vnp_SecureHash = signature
      // Build final URL
      const paymentUrl =
        this.url +
        '?' +
        Object.keys(vnpParams)
          .map(key => `${key}=${encodeURIComponent(vnpParams[key])}`)
          .join('&')
      // Create payment record
      await prisma.payments.create({
        data: {
          id: crypto.randomUUID(),
          booking_id: request.booking_id,
          amount: request.amount,
          payment_method: 'vnpay',
          payment_gateway: 'vnpay',
          gateway_transaction_id: orderId,
          gateway_order_id: orderId,
          payment_number: `PAY${Date.now()}`,
          updated_at: new Date()
        }
      })
      getLogger().info('VNPay payment URL created', { orderId, amount: request.amount })
      return {
        success: true,
        data: {
          paymentUrl,
          orderId
        }
      }
    } catch (error) {
      getLogger().error(
        'VNPay payment creation error',
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  // Verify return URL
  verifyReturnUrl(query: { [key: string]: string }): {
    success: boolean
    data?: VNPayReturnData
    error?: string
  } {
    try {
      const { vnp_SecureHash } = query
      delete query.vnp_SecureHash
      delete query.vnp_SecureHashType
      // Sort parameters
      const sortedParams = Object.keys(query).sort()
      // Create signature data
      const signData = sortedParams.map(key => `${key}=${query[key]}`).join('&')
      // Verify signature with timing-safe comparison
      const signature = crypto.createHmac('sha512', this.hashSecret).update(signData).digest('hex')
      try {
        if (!timingSafeEqual(Buffer.from(signature), Buffer.from(vnp_SecureHash))) {
          return { success: false, error: 'Invalid signature' }
        }
      } catch {
        // If buffers have different lengths, timingSafeEqual throws
        return { success: false, error: 'Invalid signature' }
      }
      return {
        success: true,
        data: {
          vnp_TxnRef: query.vnp_TxnRef,
          vnp_Amount: query.vnp_Amount,
          vnp_ResponseCode: query.vnp_ResponseCode,
          vnp_TransactionNo: query.vnp_TransactionNo,
          vnp_BankCode: query.vnp_BankCode,
          vnp_PayDate: query.vnp_PayDate,
          vnp_OrderInfo: query.vnp_OrderInfo ?? '',
          vnp_TransactionStatus: query.vnp_TransactionStatus ?? '',
          vnp_TmnCode: query.vnp_TmnCode ?? ''
        } as VNPayReturnData
      }
    } catch (error) {
      getLogger().error(
        'VNPay return URL verification error',
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }
    }
  }
  // Handle IPN (Instant Payment Notification)
  async handleIPN(query: { [key: string]: string }): Promise<{
    success: boolean
    message: string
    responseCode?: string
  }> {
    try {
      // Check signature exists before processing
      if (!query.vnp_SecureHash) {
        getLogger().error('VNPay IPN missing signature', new Error('Missing vnp_SecureHash'))
        return { success: false, message: 'Missing signature', responseCode: '97' }
      }

      // Verify signature first
      const verifyResult = this.verifyReturnUrl(query)
      if (!verifyResult.success) {
        return { success: false, message: 'Invalid signature', responseCode: '97' }
      }
      const orderId = verifyResult.data?.vnp_TxnRef
      const amount = verifyResult.data ? parseInt(verifyResult.data.vnp_Amount, 10) / 100 : 0
      const responseCode = verifyResult.data?.vnp_ResponseCode
      const transactionNo = verifyResult.data?.vnp_TransactionNo
      const bankCode = verifyResult.data?.vnp_BankCode
      const payDate = verifyResult.data?.vnp_PayDate

      // Idempotency check - prevent duplicate webhook processing
      const webhookEventId = `vnpay_${orderId}_${transactionNo ?? responseCode}`
      const existingEvent = await prisma.webhook_events.findUnique({
        where: { event_id: webhookEventId }
      })
      if (existingEvent) {
        getLogger().info('VNPay webhook already processed', { event_id: webhookEventId })
        return { success: true, message: 'Webhook already processed', responseCode: '00' }
      }

      // Find payment record
      const payment = await prisma.payments.findFirst({
        where: { gateway_transaction_id: orderId }
      })
      if (!payment) {
        return { success: false, message: 'Payment not found', responseCode: '01' }
      }
      // Check if payment amount matches
      if (payment.amount.toNumber() !== amount) {
        return { success: false, message: 'Amount mismatch', responseCode: '04' }
      }
      // Check if payment is already processed
      if (payment.status === 'completed') {
        return { success: true, message: 'Payment already processed', responseCode: '00' }
      }
      // Process payment based on response code
      if (responseCode === '00') {
        // Payment successful - use transaction for atomic updates
        await prisma.$transaction(async tx => {
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              gateway_response: {
                transactionNo: transactionNo ?? '',
                bankCode,
                payDate,
                responseCode,
                ...query
              }
            }
          })
          // Update booking status
          await tx.bookings.update({
            where: { id: payment.booking_id },
            data: {
              payment_status: 'completed',
              status: 'confirmed'
            }
          })
        })
        // Send confirmation email
        await this.sendConfirmationEmail(payment.booking_id)
        // Send Discord notification
        await this.sendDiscordNotification(payment.booking_id, 'completed', {
          orderId: orderId ?? '',
          transId: transactionNo,
          amount,
          payment_method: 'VNPay'
        })
        // Trigger service delivery workflow
        await this.triggerServiceDelivery(payment.booking_id)

        // Record webhook event for idempotency
        await prisma.webhook_events.create({
          data: {
            id: crypto.randomUUID(),
            provider: 'vnpay',
            event_type: 'payment_ipn',
            event_id: webhookEventId,
            payload: query,
            status: 'processed',
            processed_at: new Date(),
            updated_at: new Date()
          }
        })

        getLogger().info('VNPay payment completed', { orderId, transactionNo, amount })
        return { success: true, message: 'Payment processed successfully', responseCode: '00' }
      } else {
        // Payment failed - use transaction for atomic updates
        await prisma.$transaction(async tx => {
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: 'failed',
              failure_reason: this.getResponseMessage(responseCode ?? '99'),
              gateway_response: {
                responseCode,
                ...query
              }
            }
          })
          await tx.bookings.update({
            where: { id: payment.booking_id },
            data: { payment_status: 'failed' }
          })
        })

        // Record webhook event for idempotency
        await prisma.webhook_events.create({
          data: {
            id: crypto.randomUUID(),
            provider: 'vnpay',
            event_type: 'payment_ipn_failed',
            event_id: webhookEventId,
            payload: query,
            status: 'processed',
            processed_at: new Date(),
            updated_at: new Date()
          }
        })

        getLogger().warn('VNPay payment failed', { orderId, responseCode })
        return { success: true, message: 'Payment failure processed', responseCode: '00' }
      }
    } catch (error) {
      getLogger().error(
        'VNPay IPN processing error',
        error instanceof Error ? error : new Error(String(error))
      )
      return { success: false, message: 'IPN processing failed', responseCode: '99' }
    }
  }
  // Query payment status
  async queryPayment(
    orderId: string,
    transDate: string
  ): Promise<{
    success: boolean
    data?: VNPayQueryResponse
    error?: string
  }> {
    try {
      const requestId = Date.now().toString()
      const createDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
      const queryParams = {
        vnp_RequestId: requestId,
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: this.tmnCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Query payment ${orderId}`,
        vnp_TransactionDate: transDate,
        vnp_CreateDate: createDate,
        vnp_IpAddr: '127.0.0.1'
      }
      // Sort and create signature
      const sortedParams = Object.keys(queryParams).sort()
      const signData = sortedParams
        .map(key => `${key}=${queryParams[key as keyof typeof queryParams]}`)
        .join('&')
      const signature = crypto.createHmac('sha512', this.hashSecret).update(signData).digest('hex')
      const requestBody = {
        ...queryParams,
        vnp_SecureHash: signature
      }
      const response = await fetch('https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      const responseData = (await response.json()) as VNPayQueryResponse
      if (responseData.vnp_ResponseCode === '00') {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.vnp_Message ?? 'Query failed' }
      }
    } catch (error) {
      getLogger().error(
        'VNPay query error',
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      }
    }
  }
  // Refund payment
  async refundPayment(
    orderId: string,
    amount: number,
    transDate: string,
    reason: string
  ): Promise<{
    success: boolean
    data?: VNPayRefundResponse
    error?: string
  }> {
    try {
      const requestId = Date.now().toString()
      const createDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
      const refundParams = {
        vnp_RequestId: requestId,
        vnp_Version: '2.1.0',
        vnp_Command: 'refund',
        vnp_TmnCode: this.tmnCode,
        vnp_TransactionType: '02', // Full refund
        vnp_TxnRef: orderId,
        vnp_Amount: (amount * 100).toString(),
        vnp_OrderInfo: reason,
        vnp_TransactionNo: '', // Will be filled from original transaction
        vnp_TransactionDate: transDate,
        vnp_CreateDate: createDate,
        vnp_CreateBy: 'System',
        vnp_IpAddr: '127.0.0.1'
      }
      // Sort and create signature
      const sortedParams = Object.keys(refundParams).sort()
      const signData = sortedParams
        .map(key => `${key}=${refundParams[key as keyof typeof refundParams]}`)
        .join('&')
      const signature = crypto.createHmac('sha512', this.hashSecret).update(signData).digest('hex')
      const requestBody = {
        ...refundParams,
        vnp_SecureHash: signature
      }
      const response = await fetch('https://sandbox.vnpayment.vn/merchant_webapi/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      const responseData = (await response.json()) as VNPayRefundResponse
      if (responseData.vnp_ResponseCode === '00') {
        // Update payment record with refund info
        const payment = await prisma.payments.findFirst({
          where: { gateway_transaction_id: orderId }
        })
        if (payment) {
          await prisma.payments.update({
            where: { id: payment.id },
            data: {
              refund_amount: amount,
              refund_reason: reason,
              refunded_at: new Date(),
              status: 'refunded'
            }
          })
        }
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.vnp_Message ?? 'Refund failed' }
      }
    } catch (error) {
      getLogger().error(
        'VNPay refund error',
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }
  private getResponseMessage(responseCode: string): string {
    const messages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    }
    return messages[responseCode] ?? 'Lỗi không xác định'
  }
  // Send confirmation email
  private async sendConfirmationEmail(booking_id: string): Promise<void> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: booking_id },
        include: {
          users: true,
          service_tiers: {
            include: { services: true }
          }
        }
      })
      if (booking) {
        const { sendEmail } = await import('@/lib/email')
        await sendEmail({
          to: booking.users.email,
          subject: 'Xác nhận thanh toán thành công - RoK Services',
          html: `
            <h2>Thanh toán thành công!</h2>
            <p>Xin chào ${booking.users.full_name},</p>
            <p>Chúng tôi đã nhận được thanh toán của bạn cho dịch vụ <strong>${booking.service_tiers.services.name}</strong>.</p>
            <ul>
              <li>Mã booking: ${booking.booking_number}</li>
              <li>Số tiền: ${booking.total_amount.toLocaleString()} VNĐ</li>
              <li>Phương thức: VNPay</li>
            </ul>
            <p>Cảm ơn bạn đã sử dụng dịch vụ RoK Services!</p>
          `,
          text: `Thanh toán thành công cho dịch vụ ${booking.service_tiers.services.name}. Mã booking: ${booking.booking_number}`
        })
      }
    } catch (error) {
      getLogger().warn(
        `Failed to send confirmation email: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
  // Send Discord notification
  private async sendDiscordNotification(
    booking_id: string,
    status: string,
    paymentData: { orderId: string; transId?: string; amount: number; payment_method: string }
  ): Promise<void> {
    try {
      const { discordNotifier } = await import('@/lib/discord')
      const booking = await prisma.bookings.findUnique({
        where: { id: booking_id },
        include: {
          users: true,
          service_tiers: { include: { services: true } }
        }
      })
      if (booking) {
        await discordNotifier.sendPaymentNotification({
          booking_id: booking.id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          status: status as 'pending' | 'completed' | 'failed' | 'cancelled',
          customerEmail: booking.users.email,
          customerName: booking.users.full_name,
          transactionId: paymentData.transId
        })
      }
    } catch (error) {
      getLogger().warn(
        `Failed to send Discord notification: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
  // Trigger service delivery workflow
  private async triggerServiceDelivery(booking_id: string): Promise<void> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: booking_id },
        include: {
          service_tiers: {
            include: { services: true }
          }
        }
      })
      if (booking) {
        // Update booking to in-progress
        await prisma.bookings.update({
          where: { id: booking_id },
          data: {
            status: 'in_progress',
            start_date: new Date()
          }
        })
        // Create service delivery task
        await prisma.service_tasks.create({
          data: {
            id: crypto.randomUUID(),
            booking_id: booking_id,
            type: 'delivery',
            title: `Deliver ${booking.service_tiers.services.name}`,
            description: `Process service delivery for booking ${booking.booking_number}`,
            priority: 'high',
            status: 'pending',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            updated_at: new Date() // 7 days default
          }
        })
        getLogger().info('Service delivery workflow triggered', {
          booking_number: booking.booking_number
        })
      }
    } catch (error) {
      getLogger().warn(
        `Failed to trigger service delivery: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
