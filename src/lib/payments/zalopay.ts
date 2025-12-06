import crypto from 'crypto'

import { generateSecureRandomInt } from '@/lib/crypto-utils'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface ZaloPayRequest {
  booking_id: string
  amount: number
  description: string
  callbackUrl?: string
}
interface ZaloPayResponse {
  return_code: number
  return_message: string
  sub_return_code: number
  sub_return_message: string
  zp_trans_token?: string
  order_url?: string
  order_token?: string
}
interface ZaloPayQueryResponse {
  return_code: number
  return_message: string
  sub_return_code: number
  sub_return_message: string
  is_processing?: boolean
  amount?: number
  zp_trans_id?: string
}
interface ZaloPayRefundResponse {
  return_code: number
  return_message: string
  sub_return_code: number
  sub_return_message: string
  m_refund_id?: string
  refund_id?: string
}
interface ZaloPayRefundStatusResponse {
  return_code: number
  return_message: string
  sub_return_code: number
  sub_return_message: string
  refunds?: Array<{
    m_refund_id: string
    zp_trans_id: string
    amount: number
    status: number
  }>
}

export interface ZaloPayCallbackData {
  data: string
  mac: string
}

// Parsed callback data interface
interface ZaloPayParsedData {
  app_trans_id: string
  zp_trans_id: string
  amount: number
  embed_data: string
}

// Embed data interface
interface ZaloPayEmbedData {
  booking_id: string
}

export class ZaloPayPayment {
  private appId: string
  private key1: string
  private key2: string
  private endpoint: string
  constructor() {
    const appId = process.env.ZALOPAY_APP_ID
    const key1 = process.env.ZALOPAY_KEY1
    const key2 = process.env.ZALOPAY_KEY2
    if (!appId || !key1 || !key2) {
      throw new Error(
        'ZaloPay payment configuration missing: ZALOPAY_APP_ID, ZALOPAY_KEY1, or ZALOPAY_KEY2'
      )
    }
    this.appId = appId
    this.key1 = key1
    this.key2 = key2
    this.endpoint = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create'
  }
  // Tạo payment order
  async createOrder(request: ZaloPayRequest): Promise<{
    success: boolean
    data?: ZaloPayResponse
    error?: string
  }> {
    try {
      const booking = await prisma.bookings.findUnique({
        where: { id: request.booking_id },
        include: {
          users: true,
          service_tiers: {
            include: {
              services: true
            }
          }
        }
      })
      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }
      const transId = `${Date.now()}`
      const appTransId = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}_${booking.booking_number}_${transId}`
      const embedData = JSON.stringify({
        booking_id: request.booking_id,
        redirecturl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`
      })
      const items = JSON.stringify([
        {
          itemid: booking.service_tiers.id,
          itemname: booking.service_tiers.services.name,
          itemprice: request.amount,
          itemquantity: 1
        }
      ])
      const orderData = {
        app_id: parseInt(this.appId),
        app_user: booking.users.email,
        app_time: Date.now(),
        amount: request.amount,
        app_trans_id: appTransId,
        embed_data: embedData,
        item: items,
        description: request.description,
        bank_code: '',
        callback_url:
          request.callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/zalopay/callback`
      }
      // Tạo MAC signature
      const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`
      const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex')
      const requestBody = {
        ...orderData,
        mac
      }
      getLogger().debug('ZaloPay request', {
        appTransId,
        amount: request.amount,
        macPrefix: mac.substring(0, 10)
      })
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(
          Object.entries(requestBody).map(([k, v]) => [k, String(v)])
        ).toString()
      })
      const responseData = (await response.json()) as ZaloPayResponse
      if (responseData.return_code === 1) {
        // Tạo payment record
        await prisma.payments.create({
          data: {
            id: crypto.randomUUID(),
            booking_id: request.booking_id,
            amount: request.amount,
            payment_method: 'zalopay',
            payment_gateway: 'zalopay',
            gateway_transaction_id: appTransId,
            gateway_order_id: appTransId,
            payment_number: `PAY${Date.now()}`,
            updated_at: new Date()
          }
        })
        return {
          success: true,
          data: responseData
        }
      } else {
        getLogger().error('ZaloPay order creation failed', undefined, { returnCode: String(responseData.return_code), returnMessage: responseData.return_message })
        return {
          success: false,
          error: responseData.return_message || 'Order creation failed'
        }
      }
    } catch (error) {
      getLogger().error('ZaloPay payment error', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  // Xử lý callback từ ZaloPay
  async handleCallback(callbackData: ZaloPayCallbackData): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const { data: dataStr, mac: receivedMac } = callbackData
      // Verify MAC
      const expectedMac = crypto.createHmac('sha256', this.key2).update(dataStr).digest('hex')
      if (receivedMac !== expectedMac) {
        getLogger().error('ZaloPay callback MAC verification failed')
        return { success: false, message: 'Invalid MAC' }
      }
      const data = JSON.parse(dataStr) as ZaloPayParsedData
      const { app_trans_id, zp_trans_id, amount, embed_data } = data
      // Parse embed data
      const embedDataObj = JSON.parse(embed_data) as ZaloPayEmbedData
      const { booking_id: _booking_id } = embedDataObj
      // Tìm payment record
      // Tìm payment record
      const payment = await prisma.payments.findFirst({
        where: { gateway_transaction_id: app_trans_id }
      })
      if (!payment) {
        getLogger().error('Payment not found for app_trans_id', undefined, { app_trans_id })
        return { success: false, message: 'Payment not found' }
      }
      // Cập nhật payment status
      await prisma.payments.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          updated_at: new Date(),
          paid_at: new Date(),
          gateway_response: {
            ...data,
            zpTransId: zp_trans_id,
            callbackAmount: amount
          }
        }
      })
      // Cập nhật booking status
      await prisma.bookings.update({
        where: { id: payment.booking_id },
        data: { payment_status: 'completed', updated_at: new Date() }
      })
      await prisma.bookings.update({
        where: { id: payment.booking_id },
        data: { status: 'confirmed', updated_at: new Date() }
      })
      // Send confirmation email
      await this.sendConfirmationEmail(payment.booking_id)
      // Send Discord notification
      await this.sendDiscordNotification(payment.booking_id, 'completed', {
        orderId: app_trans_id,
        transId: zp_trans_id,
        amount,
        payment_method: 'ZaloPay'
      })
      // Trigger service delivery workflow
      await this.triggerServiceDelivery(payment.booking_id)
      getLogger().info('ZaloPay payment completed', { app_trans_id, zp_trans_id, amount })
      return { success: true, message: 'Payment processed successfully' }
    } catch (error) {
      getLogger().error('ZaloPay callback processing error', error as Error)
      return { success: false, message: 'Callback processing failed' }
    }
  }
  // Query payment status
  async queryPaymentStatus(appTransId: string): Promise<{
    success: boolean
    data?: ZaloPayQueryResponse
    error?: string
  }> {
    try {
      const data = `${this.appId}|${appTransId}|${this.key1}`
      const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex')
      const requestBody = {
        app_id: this.appId,
        app_trans_id: appTransId,
        mac
      }
      const response = await fetch('https://sb-openapi.zalopay.vn/v2/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(requestBody).toString()
      })
      const responseData = (await response.json()) as ZaloPayQueryResponse
      if (responseData.return_code === 1) {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.return_message ?? 'Query failed' }
      }
    } catch (error) {
      getLogger().error('ZaloPay query error', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      }
    }
  }
  // Refund payment
  async refundPayment(
    zpTransId: string,
    refund_amount: number,
    description: string
  ): Promise<{
    success: boolean
    data?: ZaloPayRefundResponse
    error?: string
  }> {
    try {
      const timestamp = Date.now()
      const uid = `${timestamp}${generateSecureRandomInt(111, 999)}`
      const data = `${this.appId}|${zpTransId}|${refund_amount}|${description}|${timestamp}`
      const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex')
      const requestBody = {
        app_id: this.appId,
        zp_trans_id: zpTransId,
        amount: refund_amount,
        description,
        timestamp,
        uid,
        mac
      }
      const response = await fetch('https://sb-openapi.zalopay.vn/v2/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(
          Object.entries(requestBody).map(([k, v]) => [k, String(v)])
        ).toString()
      })
      const responseData = (await response.json()) as ZaloPayRefundResponse
      if (responseData.return_code === 1) {
        // Update payment record with refund info
        const payment = await prisma.payments.findFirst({
          where: {
            gateway_response: {
              path: ['zpTransId'],
              equals: zpTransId
            }
          }
        })
        if (payment) {
          await prisma.payments.update({
            where: { id: payment.id },
            data: {
              refund_amount: refund_amount,
              refund_reason: description,
              refunded_at: new Date(),
              status: 'refunded'
            }
          })
        }
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.return_message ?? 'Refund failed' }
      }
    } catch (error) {
      getLogger().error('ZaloPay refund error', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }
  // Get refund status
  async getRefundStatus(mRefundId: string): Promise<{
    success: boolean
    data?: ZaloPayRefundStatusResponse
    error?: string
  }> {
    try {
      const timestamp = Date.now()
      const data = `${this.appId}|${mRefundId}|${timestamp}`
      const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex')
      const requestBody = {
        app_id: this.appId,
        m_refund_id: mRefundId,
        timestamp,
        mac
      }
      const response = await fetch('https://sb-openapi.zalopay.vn/v2/query_refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(
          Object.entries(requestBody).map(([k, v]) => [k, String(v)])
        ).toString()
      })
      const responseData = (await response.json()) as ZaloPayRefundStatusResponse
      if (responseData.return_code === 1) {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.return_message ?? 'Refund status query failed' }
      }
    } catch (error) {
      getLogger().error('ZaloPay refund status error', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      }
    }
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
              <li>Phương thức: ZaloPay</li>
            </ul>
            <p>Cảm ơn bạn đã sử dụng dịch vụ RoK Services!</p>
          `,
          text: `Thanh toán thành công cho dịch vụ ${booking.service_tiers.services.name}. Mã booking: ${booking.booking_number}`
        })
      }
    } catch (error) {
      getLogger().error('Failed to send confirmation email', error as Error)
    }
  }
  // Send Discord notification
  private async sendDiscordNotification(
    booking_id: string,
    status: string,
    paymentData: { orderId: string; transId: string; amount: number; payment_method: string }
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
      getLogger().error('Failed to send Discord notification', error as Error)
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
      getLogger().error('Failed to trigger service delivery', error as Error)
    }
  }
}
