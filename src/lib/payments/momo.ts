import crypto from 'crypto'

import { type Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface MoMoPaymentRequest {
  bookingId: string
  amount: number
  orderInfo: string
  redirectUrl?: string
  ipnUrl?: string
  extraData?: string
}

interface MoMoResponse {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  responseTime: number
  message: string
  resultCode: number
  payUrl?: string
  deeplink?: string
  qrCodeUrl?: string
}

export interface MoMoWebhookData {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: string
  resultCode: number
  message: string
  payType: string
  responseTime: number
  extraData: string
  signature: string
}

interface MoMoQueryResponse {
  partnerCode: string
  orderId: string
  requestId: string
  extraData: string
  amount: number
  transId: string
  payType: string
  resultCode: number
  refundTrans?: Array<{
    orderId: string
    amount: number
    resultCode: number
    transId: string
    createdTime: number
  }>
  message: string
  localMessage: string
  responseTime: number
  errorCode: string
  payTime?: number
  orderInfo: string
  orderType: string
}

interface MoMoRefundResponse {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  transId: string
  resultCode: number
  message: string
  responseTime: number
}

export class MoMoPayment {
  private partnerCode: string
  private accessKey: string
  private secretKey: string
  private endpoint: string

  constructor() {
    const partnerCode = process.env.MOMO_PARTNER_CODE
    const accessKey = process.env.MOMO_ACCESS_KEY
    const secretKey = process.env.MOMO_SECRET_KEY

    if (!partnerCode || !accessKey || !secretKey) {
      throw new Error(
        'MoMo payment configuration missing: MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, or MOMO_SECRET_KEY'
      )
    }

    this.partnerCode = partnerCode
    this.accessKey = accessKey
    this.secretKey = secretKey
    this.endpoint =
      process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'
  }

  // Verify webhook signature to prevent fake callbacks
  verifyWebhookSignature(data: MoMoWebhookData, receivedSignature: string): boolean {
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
      extraData
    } = data

    // Construct signature string according to MoMo documentation
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`

    // Generate HMAC SHA256 signature
    const signature = crypto.createHmac('sha256', this.secretKey).update(rawSignature).digest('hex')

    return signature === receivedSignature
  }

  // Tạo payment request
  async createPayment(request: MoMoPaymentRequest): Promise<{
    success: boolean
    data?: MoMoResponse
    error?: string
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingId },
        include: {
          serviceTier: {
            include: {
              service: true
            }
          }
        }
      })
      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const orderId = `MOMO_${booking.bookingNumber}_${Date.now()}`
      const requestId = `REQ_${Date.now()}`
      const orderInfo =
        request.orderInfo || `Thanh toán dịch vụ RoK - ${booking.serviceTier.service.name}`
      const redirectUrl =
        request.redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`
      const ipnUrl =
        request.ipnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/webhook`
      const extraData = request.extraData || ''

      // Tạo raw signature
      const rawSignature = `accessKey=${this.accessKey}&amount=${request.amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithATM`

      // Tạo signature
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex')

      const requestBody = {
        partnerCode: this.partnerCode,
        partnerName: 'RoK Services',
        storeId: 'RoKServices',
        requestId,
        amount: request.amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        extraData,
        requestType: 'payWithATM',
        signature,
        autoCapture: true
      }

      getLogger().debug('MoMo request', {
        orderId,
        amount: request.amount,
        signaturePrefix: signature.substring(0, 10)
      })

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = (await response.json()) as MoMoResponse

      if (responseData.resultCode === 0) {
        await prisma.payment.create({
          data: {
            bookingId: request.bookingId,
            amount: request.amount,
            paymentMethod: 'momo',
            paymentGateway: 'momo',
            gatewayTransactionId: orderId,
            gatewayOrderId: orderId,
            paymentNumber: `PAY${Date.now()}`,
            status: 'pending'
          }
        })

        return {
          success: true,
          data: responseData
        }
      } else {
        getLogger().error(
          'MoMo payment creation failed',
          new Error(responseData.message || 'Payment creation failed')
        )
        return {
          success: false,
          error: responseData.message || 'Payment creation failed'
        }
      }
    } catch (error) {
      getLogger().error(
        'MoMo payment error',
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Xử lý webhook từ MoMo
  async handleWebhook(webhookData: MoMoWebhookData): Promise<{
    success: boolean
    message: string
  }> {
    try {
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
      } = webhookData

      // Verify signature
      const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`

      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex')

      if (signature !== expectedSignature) {
        getLogger().error(
          'MoMo webhook signature verification failed',
          new Error('Invalid signature')
        )
        return { success: false, message: 'Invalid signature' }
      }

      // Idempotency check - prevent duplicate webhook processing
      const webhookEventId = `momo_${orderId}_${transId}`
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId: webhookEventId }
      })
      if (existingEvent) {
        getLogger().info('MoMo webhook already processed', { eventId: webhookEventId })
        return { success: true, message: 'Webhook already processed' }
      }

      // Tìm payment record
      const payment = await prisma.payment.findFirst({
        where: { gatewayTransactionId: orderId }
      })
      if (!payment) {
        getLogger().error('Payment not found for orderId', new Error('Payment not found'))
        return { success: false, message: 'Payment not found' }
      }

      // Cập nhật payment status
      if (resultCode === 0) {
        // Payment successful - use transaction for atomic updates
        await prisma.$transaction(async tx => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              updatedAt: new Date(),
              paidAt: new Date(),
              gatewayResponse: {
                transactionId: transId,
                ...webhookData
              }
            }
          })

          // Cập nhật booking status (merged into single update)
          await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
              paymentStatus: 'completed',
              status: 'confirmed',
              updatedAt: new Date()
            }
          })
        })

        // Send confirmation email
        await this.sendConfirmationEmail(payment.bookingId)

        // Send Discord notification
        await this.sendDiscordNotification(payment.bookingId, 'completed', {
          orderId,
          transId,
          amount,
          paymentMethod: 'MoMo'
        })

        // Trigger service delivery workflow
        await this.triggerServiceDelivery(payment.bookingId)

        // Record webhook event for idempotency
        await prisma.webhookEvent.create({
          data: {
            provider: 'momo',
            eventType: 'payment_callback',
            eventId: webhookEventId,
            payload: webhookData as unknown as Prisma.InputJsonValue,
            status: 'processed',
            processedAt: new Date()
          }
        })

        getLogger().info('MoMo payment completed', { orderId, transId, amount })
        return { success: true, message: 'Payment processed successfully' }
      } else {
        // Payment failed - use transaction for atomic updates
        await prisma.$transaction(async tx => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'failed',
              updatedAt: new Date(),
              gatewayResponse: {
                failureReason: message,
                ...webhookData
              }
            }
          })

          await tx.booking.update({
            where: { id: payment.bookingId },
            data: { paymentStatus: 'failed', updatedAt: new Date() }
          })
        })

        // Record webhook event for idempotency
        await prisma.webhookEvent.create({
          data: {
            provider: 'momo',
            eventType: 'payment_callback_failed',
            eventId: webhookEventId,
            payload: webhookData as unknown as Prisma.InputJsonValue,
            status: 'processed',
            processedAt: new Date()
          }
        })

        getLogger().warn('MoMo payment failed', { orderId, resultCode, message })
        return { success: true, message: 'Payment failure processed' }
      }
    } catch (error) {
      getLogger().error(
        'MoMo webhook processing error',
        error instanceof Error ? error : new Error(String(error))
      )
      return { success: false, message: 'Webhook processing failed' }
    }
  }

  // Query payment status
  async queryPaymentStatus(orderId: string): Promise<{
    success: boolean
    data?: MoMoQueryResponse
    error?: string
  }> {
    try {
      const requestId = `QUERY_${Date.now()}`
      const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`

      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex')

      const requestBody = {
        partnerCode: this.partnerCode,
        requestId,
        orderId,
        signature,
        lang: 'vi'
      }

      const queryEndpoint =
        process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query'
      const response = await fetch(queryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = (await response.json()) as MoMoQueryResponse

      if (responseData.resultCode === 0) {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.message ?? 'Query failed' }
      }
    } catch (error) {
      getLogger().error(
        'MoMo query error',
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
    refundAmount: number,
    description: string
  ): Promise<{
    success: boolean
    data?: MoMoRefundResponse
    error?: string
  }> {
    try {
      const requestId = `REFUND_${Date.now()}`
      const rawSignature = `accessKey=${this.accessKey}&amount=${refundAmount}&description=${description}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`

      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(rawSignature)
        .digest('hex')

      const requestBody = {
        partnerCode: this.partnerCode,
        requestId,
        orderId,
        amount: refundAmount,
        description,
        signature,
        lang: 'vi'
      }

      const refundEndpoint =
        process.env.MOMO_REFUND_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/refund'
      const response = await fetch(refundEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = (await response.json()) as MoMoRefundResponse

      if (responseData.resultCode === 0) {
        // Update payment record with refund info
        const payment = await prisma.payment.findFirst({
          where: { gatewayTransactionId: orderId }
        })
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              refundAmount: refundAmount,
              refundReason: description,
              refundedAt: new Date(),
              status: 'refunded'
            }
          })
        }

        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.message ?? 'Refund failed' }
      }
    } catch (error) {
      getLogger().error(
        'MoMo refund error',
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  // Send confirmation email
  private async sendConfirmationEmail(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          serviceTier: {
            include: { service: true }
          }
        }
      })

      if (booking) {
        const { sendEmail } = await import('@/lib/email')
        await sendEmail({
          to: booking.user.email,
          subject: 'Xác nhận thanh toán thành công - RoK Services',
          html: `
            <h2>Thanh toán thành công!</h2>
            <p>Xin chào ${booking.user.fullName},</p>
            <p>Chúng tôi đã nhận được thanh toán của bạn cho dịch vụ <strong>${booking.serviceTier.service.name}</strong>.</p>
            <ul>
              <li>Mã booking: ${booking.bookingNumber}</li>
              <li>Số tiền: ${booking.totalAmount.toLocaleString()} VNĐ</li>
              <li>Phương thức: MoMo</li>
            </ul>
            <p>Cảm ơn bạn đã sử dụng dịch vụ RoK Services!</p>
          `,
          text: `Thanh toán thành công cho dịch vụ ${booking.serviceTier.service.name}. Mã booking: ${booking.bookingNumber}`
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
    bookingId: string,
    status: string,
    paymentData: { orderId: string; transId?: string; amount: number; paymentMethod: string }
  ): Promise<void> {
    try {
      const { discordNotifier } = await import('@/lib/discord')
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          serviceTier: { include: { service: true } }
        }
      })

      if (booking) {
        await discordNotifier.sendPaymentNotification({
          bookingId: booking.id,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          status: status as 'pending' | 'completed' | 'failed' | 'cancelled',
          customerEmail: booking.user.email,
          customerName: booking.user.fullName,
          transactionId: paymentData.orderId
        })
      }
    } catch (error) {
      getLogger().warn(
        `Failed to send Discord notification: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // Trigger service delivery workflow
  private async triggerServiceDelivery(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          serviceTier: {
            include: { service: true }
          }
        }
      })

      if (booking) {
        // Update booking to in-progress
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'in_progress',
            startDate: new Date()
          }
        })

        // Create service delivery task
        await prisma.serviceTask.create({
          data: {
            bookingId: bookingId,
            type: 'delivery',
            title: `Deliver ${booking.serviceTier.service.name}`,
            description: `Process service delivery for booking ${booking.bookingNumber}`,
            priority: 'high',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
          }
        })

        getLogger().info('Service delivery workflow triggered', {
          bookingNumber: booking.bookingNumber
        })
      }
    } catch (error) {
      getLogger().warn(
        `Failed to trigger service delivery: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
}
