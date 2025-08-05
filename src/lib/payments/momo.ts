import crypto from 'crypto'
import { db, prisma } from '@/lib/db'

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

export class MoMoPayment {
  private partnerCode: string
  private accessKey: string
  private secretKey: string
  private endpoint: string

  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE!
    this.accessKey = process.env.MOMO_ACCESS_KEY!
    this.secretKey = process.env.MOMO_SECRET_KEY!
    this.endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'
  }

  // Verify webhook signature to prevent fake callbacks
  verifyWebhookSignature(data: any, receivedSignature: string): boolean {
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
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex')

    return signature === receivedSignature
  }

  // Tạo payment request
  async createPayment(request: MoMoPaymentRequest): Promise<{
    success: boolean
    data?: MoMoResponse
    error?: string
  }> {
    try {
      const booking = await db.booking.findById(request.bookingId)
      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const orderId = `MOMO_${booking.bookingNumber}_${Date.now()}`
      const requestId = `REQ_${Date.now()}`
      const orderInfo = request.orderInfo || `Thanh toán dịch vụ RoK - ${booking.serviceTier.service.name}`
      const redirectUrl = request.redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`
      const ipnUrl = request.ipnUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/momo/webhook`
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

      console.log('MoMo request:', { orderId, amount: request.amount, signature: signature.substring(0, 10) + '...' })

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData: MoMoResponse = await response.json()

      if (responseData.resultCode === 0) {
        // Tạo payment record
        await db.payment.create({
          bookingId: request.bookingId,
          amount: request.amount,
          paymentMethod: 'momo',
          paymentGateway: 'momo',
          gatewayTransactionId: orderId,
          gatewayOrderId: orderId
        })

        return {
          success: true,
          data: responseData
        }
      } else {
        console.error('MoMo payment creation failed:', responseData)
        return {
          success: false,
          error: responseData.message || 'Payment creation failed'
        }
      }
    } catch (error) {
      console.error('MoMo payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Xử lý webhook từ MoMo
  async handleWebhook(webhookData: any): Promise<{
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
        console.error('MoMo webhook signature verification failed')
        return { success: false, message: 'Invalid signature' }
      }

      // Tìm payment record
      const payment = await db.payment.findByGatewayTransactionId(orderId)
      if (!payment) {
        console.error('Payment not found for orderId:', orderId)
        return { success: false, message: 'Payment not found' }
      }

      // Cập nhật payment status
      if (resultCode === 0) {
        // Payment successful
        await db.payment.updateStatus(payment.id, 'completed', {
          transactionId: transId,
          payType,
          responseTime,
          ...webhookData
        })

        // Cập nhật booking status
        await db.booking.updatePaymentStatus(payment.bookingId, 'completed')
        await db.booking.updateStatus(payment.bookingId, 'confirmed')

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

        console.log('MoMo payment completed:', { orderId, transId, amount })
        return { success: true, message: 'Payment processed successfully' }
      } else {
        // Payment failed
        await db.payment.updateStatus(payment.id, 'failed', {
          failureReason: message,
          ...webhookData
        })

        await db.booking.updatePaymentStatus(payment.bookingId, 'failed')

        console.log('MoMo payment failed:', { orderId, resultCode, message })
        return { success: true, message: 'Payment failure processed' }
      }
    } catch (error) {
      console.error('MoMo webhook processing error:', error)
      return { success: false, message: 'Webhook processing failed' }
    }
  }

  // Query payment status
  async queryPaymentStatus(orderId: string): Promise<{
    success: boolean
    data?: any
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

      const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()

      if (responseData.resultCode === 0) {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.message }
      }
    } catch (error) {
      console.error('MoMo query error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      }
    }
  }

  // Refund payment
  async refundPayment(orderId: string, refundAmount: number, description: string): Promise<{
    success: boolean
    data?: any
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

      const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseData = await response.json()

      if (responseData.resultCode === 0) {
        // Update payment record with refund info
        const payment = await db.payment.findByGatewayTransactionId(orderId)
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
        return { success: false, error: responseData.message }
      }
    } catch (error) {
      console.error('MoMo refund error:', error)
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
      console.error('Failed to send confirmation email:', error)
    }
  }

  // Send Discord notification
  private async sendDiscordNotification(bookingId: string, status: string, paymentData: any): Promise<void> {
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
      console.error('Failed to send Discord notification:', error)
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
        // TODO: Create serviceTask table in Prisma schema if needed
        /*
        await prisma.serviceTask.create({
          data: {
            bookingId: bookingId,
            type: 'delivery',
            title: `Deliver ${booking.serviceTier.service.name}`,
            description: `Process service delivery for booking ${booking.bookingNumber}`,
            priority: 'high',
            status: 'pending',
            assignedTo: 'system',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
          }
        })
        */
        
        console.log('Service delivery workflow triggered for booking:', booking.bookingNumber)
      }
    } catch (error) {
      console.error('Failed to trigger service delivery:', error)
    }
  }
}
