import crypto from 'crypto'
import { db, prisma } from '@/lib/db'

interface ZaloPayRequest {
  bookingId: string
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

export class ZaloPayPayment {
  private appId: string
  private key1: string
  private key2: string
  private endpoint: string

  constructor() {
    this.appId = process.env.ZALOPAY_APP_ID!
    this.key1 = process.env.ZALOPAY_KEY1!
    this.key2 = process.env.ZALOPAY_KEY2!
    this.endpoint = process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create'
  }

  // Tạo payment order
  async createOrder(request: ZaloPayRequest): Promise<{
    success: boolean
    data?: ZaloPayResponse
    error?: string
  }> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingId },
        include: {
          user: true,
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

      const transId = `${Date.now()}`
      const appTransId = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}_${booking.bookingNumber}_${transId}`
      
      const embedData = JSON.stringify({
        bookingId: request.bookingId,
        redirecturl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`
      })

      const items = JSON.stringify([{
        itemid: booking.serviceTier.id,
        itemname: booking.serviceTier.service.name,
        itemprice: request.amount,
        itemquantity: 1
      }])

      const orderData = {
        app_id: parseInt(this.appId),
        app_user: booking.user.email,
        app_time: Date.now(),
        amount: request.amount,
        app_trans_id: appTransId,
        embed_data: embedData,
        item: items,
        description: request.description,
        bank_code: '',
        callback_url: request.callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/zalopay/callback`
      }

      // Tạo MAC signature
      const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`
      const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex')

      const requestBody = {
        ...orderData,
        mac
      }

      console.log('ZaloPay request:', { appTransId, amount: request.amount, mac: mac.substring(0, 10) + '...' })

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(requestBody as any).toString()
      })

      const responseData: ZaloPayResponse = await response.json()

      if (responseData.return_code === 1) {
        // Tạo payment record
        await db.payment.create({
          bookingId: request.bookingId,
          amount: request.amount,
          paymentMethod: 'zalopay',
          paymentGateway: 'zalopay',
          gatewayTransactionId: appTransId,
          gatewayOrderId: appTransId
        })

        return {
          success: true,
          data: responseData
        }
      } else {
        console.error('ZaloPay order creation failed:', responseData)
        return {
          success: false,
          error: responseData.return_message || 'Order creation failed'
        }
      }
    } catch (error) {
      console.error('ZaloPay payment error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Xử lý callback từ ZaloPay
  async handleCallback(callbackData: any): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const { data: dataStr, mac: receivedMac } = callbackData

      // Verify MAC
      const expectedMac = crypto.createHmac('sha256', this.key2).update(dataStr).digest('hex')
      
      if (receivedMac !== expectedMac) {
        console.error('ZaloPay callback MAC verification failed')
        return { success: false, message: 'Invalid MAC' }
      }

      const data = JSON.parse(dataStr)
      const { app_trans_id, zp_trans_id, amount, embed_data } = data

      // Parse embed data
      const embedDataObj = JSON.parse(embed_data)
      const bookingId = embedDataObj.bookingId

      // Tìm payment record
      const payment = await db.payment.findByGatewayTransactionId(app_trans_id)
      if (!payment) {
        console.error('Payment not found for app_trans_id:', app_trans_id)
        return { success: false, message: 'Payment not found' }
      }

      // Cập nhật payment status
      await db.payment.updateStatus(payment.id, 'completed', {
        zpTransId: zp_trans_id,
        amount,
        ...data
      })

      // Cập nhật booking status
      await db.booking.updatePaymentStatus(payment.bookingId, 'completed')
      await db.booking.updateStatus(payment.bookingId, 'confirmed')

      // Send confirmation email
      await this.sendConfirmationEmail(payment.bookingId)
      
      // Send Discord notification
      await this.sendDiscordNotification(payment.bookingId, 'completed', {
        orderId: app_trans_id,
        transId: zp_trans_id,
        amount,
        paymentMethod: 'ZaloPay'
      })
      
      // Trigger service delivery workflow
      await this.triggerServiceDelivery(payment.bookingId)

      console.log('ZaloPay payment completed:', { app_trans_id, zp_trans_id, amount })
      return { success: true, message: 'Payment processed successfully' }
    } catch (error) {
      console.error('ZaloPay callback processing error:', error)
      return { success: false, message: 'Callback processing failed' }
    }
  }

  // Query payment status
  async queryPaymentStatus(appTransId: string): Promise<{
    success: boolean
    data?: any
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

      const responseData = await response.json()

      if (responseData.return_code === 1) {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.return_message }
      }
    } catch (error) {
      console.error('ZaloPay query error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
      }
    }
  }

  // Refund payment
  async refundPayment(zpTransId: string, refundAmount: number, description: string): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      const timestamp = Date.now()
      const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`
      
      const data = `${this.appId}|${zpTransId}|${refundAmount}|${description}|${timestamp}`
      const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex')

      const requestBody = {
        app_id: this.appId,
        zp_trans_id: zpTransId,
        amount: refundAmount,
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
        body: new URLSearchParams(requestBody as any).toString()
      })

      const responseData = await response.json()

      if (responseData.return_code === 1) {
        // Update payment record with refund info
        const payment = await prisma.payment.findFirst({
          where: {
            gatewayResponse: {
              path: ['zpTransId'],
              equals: zpTransId
            }
          }
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
        return { success: false, error: responseData.return_message }
      }
    } catch (error) {
      console.error('ZaloPay refund error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed'
      }
    }
  }

  // Get refund status
  async getRefundStatus(mRefundId: string): Promise<{
    success: boolean
    data?: any
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
        body: new URLSearchParams(requestBody as any).toString()
      })

      const responseData = await response.json()

      if (responseData.return_code === 1) {
        return { success: true, data: responseData }
      } else {
        return { success: false, error: responseData.return_message }
      }
    } catch (error) {
      console.error('ZaloPay refund status error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Query failed'
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
              <li>Phương thức: ZaloPay</li>
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
          transactionId: paymentData.transId
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
