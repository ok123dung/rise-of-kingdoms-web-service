import { db, prisma } from '@/lib/db'
import { getEmailService } from '@/lib/email/service'
import { getLogger } from '@/lib/monitoring/logger'
import type { Booking, Payment, PaymentWithBooking } from '@/types/database'

interface BankingTransferRequest {
  bookingId: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone?: string
}

interface BankAccount {
  bankName: string
  accountNumber: string
  accountName: string
  branch?: string
}

export class BankingTransfer {
  private bankAccounts: BankAccount[]

  constructor() {
    this.bankAccounts = [
      {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CONG TY TNHH ROK SERVICES',
        branch: 'Chi nhánh Quận 1, TP.HCM'
      },
      {
        bankName: 'Techcombank',
        accountNumber: '0987654321',
        accountName: 'CONG TY TNHH ROK SERVICES',
        branch: 'Chi nhánh Tân Bình, TP.HCM'
      },
      {
        bankName: 'BIDV',
        accountNumber: '5555666677',
        accountName: 'CONG TY TNHH ROK SERVICES',
        branch: 'Chi nhánh Thủ Đức, TP.HCM'
      }
    ]
  }

  // Tạo banking transfer order
  async createTransferOrder(request: BankingTransferRequest): Promise<{
    success: boolean
    data?: {
      transferCode: string
      bankAccounts: BankAccount[]
      amount: number
      transferContent: string
      expireTime: Date
    }
    error?: string
  }> {
    try {
      const booking = await db.booking.findById(request.bookingId)
      if (!booking) {
        return { success: false, error: 'Booking not found' }
      }

      const transferCode = `BANK_${booking.bookingNumber}_${Date.now()}`
      const transferContent = `ROK ${booking.bookingNumber} ${request.customerName}`
      const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create payment record
      await db.payment.create({
        bookingId: request.bookingId,
        amount: request.amount,
        paymentMethod: 'banking',
        paymentGateway: 'manual_banking',
        gatewayTransactionId: transferCode,
        gatewayOrderId: transferCode
      })

      // Send banking instructions email
      await this.sendBankingInstructions({
        email: request.customerEmail,
        customerName: request.customerName,
        transferCode,
        amount: request.amount,
        transferContent,
        expireTime,
        bankAccounts: this.bankAccounts,
        booking
      })

      getLogger().info('Banking transfer order created', { transferCode, amount: request.amount })

      return {
        success: true,
        data: {
          transferCode,
          bankAccounts: this.bankAccounts,
          amount: request.amount,
          transferContent,
          expireTime
        }
      }
    } catch (error) {
      getLogger().error('Banking transfer creation error', error instanceof Error ? error : new Error(String(error)))
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Confirm manual transfer (Admin only)
  async confirmTransfer(
    transferCode: string,
    adminNotes?: string
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      // Find payment record
      const payment = await db.payment.findByGatewayTransactionId(transferCode)
      if (!payment) {
        return { success: false, message: 'Transfer not found' }
      }

      if (payment.status === 'completed') {
        return { success: false, message: 'Transfer already confirmed' }
      }

      // Update payment status
      await db.payment.updateStatus(payment.id, 'completed', {
        confirmedAt: new Date(),
        adminNotes,
        confirmationMethod: 'manual_verification'
      })

      // Update booking status
      await db.booking.updatePaymentStatus(payment.bookingId, 'completed')
      await db.booking.updateStatus(payment.bookingId, 'confirmed')

      // Send confirmation email
      const paymentWithRelations = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          booking: {
            include: {
              user: true,
              serviceTier: {
                include: {
                  service: true
                }
              }
            }
          }
        }
      })
      if (paymentWithRelations?.booking) {
        const emailService = getEmailService()
        await emailService.sendPaymentConfirmation(paymentWithRelations)
      }

      // Send Discord notification
      try {
        if (paymentWithRelations?.booking) {
          const { discordNotifier } = await import('@/lib/discord')
          await discordNotifier.sendPaymentNotification({
            bookingId: paymentWithRelations.booking.id,
            amount: payment.amount.toNumber(),
            paymentMethod: 'banking',
            status: 'completed',
            customerEmail: paymentWithRelations.booking.user.email,
            customerName: paymentWithRelations.booking.user.fullName,
            transactionId: transferCode
          })
        }
      } catch (error) {
        getLogger().warn(`Failed to send Discord notification: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Trigger service delivery workflow
      try {
        await prisma.serviceTask.create({
          data: {
            bookingId: payment.bookingId,
            type: 'delivery',
            title: `Deliver ${paymentWithRelations?.booking?.serviceTier.service.name || 'Service'}`,
            description: `Process service delivery for booking ${paymentWithRelations?.booking?.bookingNumber || payment.bookingId}`,
            priority: 'high',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
          }
        })

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: 'in_progress',
            startDate: new Date()
          }
        })
      } catch (error) {
        getLogger().warn(`Failed to trigger service delivery: ${error instanceof Error ? error.message : String(error)}`)
      }

      getLogger().info('Banking transfer confirmed', { transferCode, adminNotes })
      return { success: true, message: 'Transfer confirmed successfully' }
    } catch (error) {
      getLogger().error('Banking transfer confirmation error', error instanceof Error ? error : new Error(String(error)))
      return { success: false, message: 'Confirmation failed' }
    }
  }

  // Reject transfer (Admin only)
  async rejectTransfer(
    transferCode: string,
    reason: string
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      // Find payment record
      const payment = await db.payment.findByGatewayTransactionId(transferCode)
      if (!payment) {
        return { success: false, message: 'Transfer not found' }
      }

      // Update payment status
      await db.payment.updateStatus(payment.id, 'failed', {
        failureReason: reason,
        rejectedAt: new Date(),
        rejectionReason: reason
      })

      // Update booking status
      await db.booking.updatePaymentStatus(payment.bookingId, 'failed')

      // Send rejection email
      const booking = await db.booking.findById(payment.bookingId)
      if (booking) {
        await this.sendRejectionEmail({
          email: booking.user.email,
          customerName: booking.user.fullName,
          transferCode,
          reason,
          booking
        })
      }

      getLogger().info('Banking transfer rejected', { transferCode, reason })
      return { success: true, message: 'Transfer rejected' }
    } catch (error) {
      getLogger().error('Banking transfer rejection error', error instanceof Error ? error : new Error(String(error)))
      return { success: false, message: 'Rejection failed' }
    }
  }

  // Get pending transfers (Admin only)
  async getPendingTransfers(): Promise<{
    success: boolean
    data?: PaymentWithBooking[]
    error?: string
  }> {
    try {
      const pendingPayments = await prisma.payment.findMany({
        where: {
          paymentMethod: 'banking',
          status: 'pending'
        },
        include: {
          booking: {
            include: {
              user: true,
              serviceTier: {
                include: {
                  service: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return { success: true, data: pendingPayments }
    } catch (error) {
      getLogger().error('Get pending transfers error', error instanceof Error ? error : new Error(String(error)))
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get pending transfers'
      }
    }
  }

  // Send banking instructions email
  private async sendBankingInstructions(params: {
    email: string
    customerName: string
    transferCode: string
    amount: number
    transferContent: string
    expireTime: Date
    bankAccounts: BankAccount[]
    booking: Booking
  }) {
    const emailService = getEmailService()

    const bankAccountsHtml = params.bankAccounts
      .map(
        account => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${account.bankName}</h4>
        <p style="margin: 4px 0; color: #374151;"><strong>Số tài khoản:</strong> ${account.accountNumber}</p>
        <p style="margin: 4px 0; color: #374151;"><strong>Chủ tài khoản:</strong> ${account.accountName}</p>
        ${account.branch ? `<p style="margin: 4px 0; color: #6b7280;"><strong>Chi nhánh:</strong> ${account.branch}</p>` : ''}
      </div>
    `
      )
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hướng dẫn chuyển khoản</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">🎮 RoK Services</h1>
            <h2 style="color: #059669;">Hướng dẫn chuyển khoản</h2>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #d97706; margin-top: 0;">⚠️ Thông tin quan trọng</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Số tiền:</strong> ${params.amount.toLocaleString()} VNĐ</li>
              <li><strong>Nội dung chuyển khoản:</strong> <code style="background: #fff; padding: 2px 4px; border-radius: 4px;">${params.transferContent}</code></li>
              <li><strong>Mã giao dịch:</strong> ${params.transferCode}</li>
              <li><strong>Hạn chuyển khoản:</strong> ${params.expireTime.toLocaleString('vi-VN')}</li>
            </ul>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3>Thông tin tài khoản nhận:</h3>
            ${bankAccountsHtml}
          </div>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #059669;">Hướng dẫn chuyển khoản:</h3>
            <ol>
              <li>Chọn một trong các tài khoản ngân hàng ở trên</li>
              <li>Chuyển khoản đúng số tiền: <strong>${params.amount.toLocaleString()} VNĐ</strong></li>
              <li>Nhập đúng nội dung: <strong>${params.transferContent}</strong></li>
              <li>Chụp ảnh biên lai và gửi cho chúng tôi qua Discord</li>
              <li>Chờ xác nhận trong vòng 2-4 giờ</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_DISCORD_INVITE}" 
               style="background: #5865f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
              Gửi biên lai qua Discord
            </a>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Xem trạng thái
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
            <p><strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng số tiền và nội dung để được xử lý nhanh chóng.</p>
            <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
          </div>
        </div>
      </body>
      </html>
    `

    await emailService.sendEmail({
      to: params.email,
      subject: `Hướng dẫn chuyển khoản - ${params.transferCode}`,
      html
    })
  }

  // Send rejection email
  private async sendRejectionEmail(params: {
    email: string
    customerName: string
    transferCode: string
    reason: string
    booking: Booking
  }) {
    const emailService = getEmailService()

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thông báo từ chối chuyển khoản</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb;">🎮 RoK Services</h1>
            <h2 style="color: #dc2626;">Thông báo về giao dịch</h2>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #dc2626;">Giao dịch không được xác nhận</h3>
            <p>Xin chào ${params.customerName},</p>
            <p>Chúng tôi rất tiếc phải thông báo rằng giao dịch chuyển khoản của bạn không được xác nhận.</p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Mã giao dịch:</strong> ${params.transferCode}</p>
              <p><strong>Lý do:</strong> ${params.reason}</p>
            </div>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #0369a1;">Bước tiếp theo:</h3>
            <ol>
              <li>Kiểm tra lại thông tin chuyển khoản</li>
              <li>Thực hiện chuyển khoản lại với thông tin chính xác</li>
              <li>Hoặc chọn phương thức thanh toán khác (MoMo, ZaloPay)</li>
              <li>Liên hệ support nếu cần hỗ trợ</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/payments" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
               Thanh toán lại
            </a>
            <a href="${process.env.NEXT_PUBLIC_DISCORD_INVITE}" 
               style="background: #5865f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               Liên hệ support
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
            <p>Cảm ơn bạn đã hiểu và hợp tác!</p>
            <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
          </div>
        </div>
      </body>
      </html>
    `

    await emailService.sendEmail({
      to: params.email,
      subject: `Thông báo giao dịch - ${params.transferCode}`,
      html
    })
  }
}
