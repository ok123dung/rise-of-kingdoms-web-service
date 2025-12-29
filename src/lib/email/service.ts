import { Resend } from 'resend'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import type { User, Lead, BookingWithRelations, PaymentWithRelations } from '@/types/prisma'

// Lead already has all the properties we need

// Lazy initialize Resend only when needed
let resend: Resend | null = null

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }
    resend = new Resend(apiKey)
  }
  return resend
}

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export class EmailService {
  private fromEmail: string

  constructor() {
    this.fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@rokdbot.com'
  }

  async sendEmail(options: SendEmailOptions): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // Check if email service is configured
      if (!process.env.RESEND_API_KEY) {
        getLogger().warn('RESEND_API_KEY not configured, skipping email send')
        return { success: false, error: 'Email service not configured' }
      }

      const resendClient = getResend()
      const result = await resendClient.emails.send({
        from: options.from ?? this.fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments
      })

      if (result.error) {
        getLogger().error('Email send error', result.error)
        return { success: false, error: result.error.message }
      }

      return { success: true, messageId: result.data?.id }
    } catch (error) {
      getLogger().error('Email service error', error as Error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Booking confirmation email
  async sendBookingConfirmation(booking: BookingWithRelations): Promise<boolean> {
    try {
      const template = this.getBookingConfirmationTemplate(booking)

      const result = await this.sendEmail({
        to: booking.users.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      // Log communication
      await prisma.communications.create({
        data: {
          id: crypto.randomUUID(),
          user_id: booking.users.id,
          booking_id: booking.id,
          type: 'email',
          channel: booking.users.email,
          subject: template.subject,
          content: template.html,
          template_id: 'booking_confirmation',
          template_data: {
            success: result.success,
            error: result.error
          }
        }
      })

      return result.success
    } catch (error) {
      getLogger().error('Booking confirmation email error', error as Error)
      return false
    }
  }

  // Payment confirmation email
  async sendPaymentConfirmation(payment: PaymentWithRelations): Promise<boolean> {
    try {
      const template = this.getPaymentConfirmationTemplate(payment)

      const result = await this.sendEmail({
        to: payment.bookings.users.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      // Log communication
      await prisma.communications.create({
        data: {
          id: crypto.randomUUID(),
          user_id: payment.bookings.users.id,
          booking_id: payment.bookings.id,
          type: 'email',
          channel: payment.bookings.users.email,
          subject: template.subject,
          content: template.html,
          template_id: 'payment_confirmation',
          template_data: {
            success: result.success,
            error: result.error
          }
        }
      })

      return result.success
    } catch (error) {
      getLogger().error('Payment confirmation email error', error as Error)
      return false
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      const template = this.getWelcomeTemplate(user)

      const result = await this.sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      // Log communication
      await prisma.communications.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          type: 'email',
          channel: user.email,
          subject: template.subject,
          content: template.html,
          template_id: 'welcome',
          template_data: {
            success: result.success,
            error: result.error
          }
        }
      })

      return result.success
    } catch (error) {
      getLogger().error('Welcome email error', error as Error)
      return false
    }
  }

  // Service reminder email
  async sendServiceReminder(booking: BookingWithRelations): Promise<boolean> {
    try {
      const template = this.getServiceReminderTemplate(booking)

      const result = await this.sendEmail({
        to: booking.users.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      // Log communication
      await prisma.communications.create({
        data: {
          id: crypto.randomUUID(),
          user_id: booking.users.id,
          booking_id: booking.id,
          type: 'email',
          channel: booking.users.email,
          subject: template.subject,
          content: template.html,
          template_id: 'service_reminder',
          template_data: {
            success: result.success,
            error: result.error
          }
        }
      })

      return result.success
    } catch (error) {
      getLogger().error('Service reminder email error', error as Error)
      return false
    }
  }

  // Lead follow-up email
  async sendLeadFollowUp(lead: Lead): Promise<boolean> {
    try {
      const template = this.getLeadFollowUpTemplate(lead)

      if (!lead.email) {
        return false
      }

      const result = await this.sendEmail({
        to: lead.email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      // Log communication if lead is assigned
      if (lead.assigned_to) {
        await prisma.communications.create({
          data: {
            id: crypto.randomUUID(),
            user_id: lead.assigned_to,
            type: 'email',
            channel: lead.email,
            subject: template.subject,
            content: template.html,
            template_id: 'lead_followup',
            template_data: {
              success: result.success,
              error: result.error
            }
          }
        })
      }

      return result.success
    } catch (error) {
      getLogger().error('Lead follow-up email error', error as Error)
      return false
    }
  }

  // Email templates
  private getBookingConfirmationTemplate(booking: BookingWithRelations): EmailTemplate {
    const serviceName = `${booking.service_tiers.services.name} - ${booking.service_tiers.name}`
    const amount = booking.final_amount.toLocaleString()

    return {
      subject: `Xác nhận đặt dịch vụ ${booking.service_tiers.services.name} - ${booking.booking_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Xác nhận đặt dịch vụ</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">🎮 RoK Services</h1>
              <h2 style="color: #059669;">Xác nhận đặt dịch vụ thành công!</h2>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3>Thông tin đặt dịch vụ:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Mã booking:</strong> ${booking.booking_number}</li>
                <li><strong>Dịch vụ:</strong> ${serviceName}</li>
                <li><strong>Số tiền:</strong> ${amount} VNĐ</li>
                <li><strong>Trạng thái:</strong> ${booking.status}</li>
                <li><strong>Ngày đặt:</strong> ${new Date(booking.created_at).toLocaleDateString('vi-VN')}</li>
              </ul>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #059669;">Bước tiếp theo:</h3>
              <ol>
                <li>Thanh toán để kích hoạt dịch vụ</li>
                <li>Team sẽ liên hệ trong vòng 24 giờ</li>
                <li>Bắt đầu nhận dịch vụ</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Xem chi tiết đơn hàng
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
              <p>Cần hỗ trợ? Liên hệ:</p>
              <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
              <p>💬 Discord: ${process.env.NEXT_PUBLIC_DISCORD_INVITE}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Xác nhận đặt dịch vụ ${serviceName}
        
        Mã booking: ${booking.booking_number}
        Dịch vụ: ${serviceName}
        Số tiền: ${amount} VNĐ
        Trạng thái: ${booking.status}
        
        Bước tiếp theo:
        1. Thanh toán để kích hoạt dịch vụ
        2. Team sẽ liên hệ trong vòng 24 giờ
        3. Bắt đầu nhận dịch vụ
        
        Xem chi tiết: ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard
        
        Hỗ trợ: ${process.env.NEXT_PUBLIC_CONTACT_EMAIL}
      `
    }
  }

  private getPaymentConfirmationTemplate(payment: PaymentWithRelations): EmailTemplate {
    const serviceName = `${payment.bookings.service_tiers.services.name} - ${payment.bookings.service_tiers.name}`
    const amount = payment.amount.toLocaleString()

    return {
      subject: `Thanh toán thành công - ${payment.payment_number}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Thanh toán thành công</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">🎮 RoK Services</h1>
              <h2 style="color: #059669;">💰 Thanh toán thành công!</h2>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3>Thông tin thanh toán:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Mã thanh toán:</strong> ${payment.payment_number}</li>
                <li><strong>Mã booking:</strong> ${payment.bookings.booking_number}</li>
                <li><strong>Dịch vụ:</strong> ${serviceName}</li>
                <li><strong>Số tiền:</strong> ${amount} VNĐ</li>
                <li><strong>Phương thức:</strong> ${payment.payment_method.toUpperCase()}</li>
                <li><strong>Thời gian:</strong> ${payment.paid_at ? new Date(payment.paid_at).toLocaleString('vi-VN') : 'N/A'}</li>
              </ul>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #d97706;">Tiếp theo sẽ diễn ra:</h3>
              <ol>
                <li>Team sẽ liên hệ trong vòng 2-4 giờ</li>
                <li>Tạo kênh Discord riêng cho bạn</li>
                <li>Bắt đầu cung cấp dịch vụ</li>
                <li>Báo cáo tiến độ định kỳ</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_DISCORD_INVITE}" 
                 style="background: #5865f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Tham gia Discord
              </a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Xem Dashboard
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
              <p>Cảm ơn bạn đã tin tưởng RoK Services! 🎉</p>
              <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Thanh toán thành công!
        
        Mã thanh toán: ${payment.payment_number}
        Mã booking: ${payment.bookings.booking_number}
        Dịch vụ: ${serviceName}
        Số tiền: ${amount} VNĐ
        Phương thức: ${payment.payment_method.toUpperCase()}
        
        Tiếp theo:
        1. Team sẽ liên hệ trong vòng 2-4 giờ
        2. Tạo kênh Discord riêng cho bạn
        3. Bắt đầu cung cấp dịch vụ
        
        Discord: ${process.env.NEXT_PUBLIC_DISCORD_INVITE}
        Dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard
      `
    }
  }

  private getWelcomeTemplate(user: User): EmailTemplate {
    return {
      subject: 'Chào mừng đến với RoK Services! 🎮',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Chào mừng đến với RoK Services</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">🎮 RoK Services</h1>
              <h2 style="color: #059669;">Chào mừng ${user.full_name}!</h2>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>Cảm ơn bạn đã đăng ký tài khoản tại RoK Services - nền tảng dịch vụ Rise of Kingdoms hàng đầu Việt Nam!</p>
              
              <h3>Với RoK Services, bạn có thể:</h3>
              <ul>
                <li>🎯 Tư vấn chiến thuật từ top 1% players</li>
                <li>💎 Farm gem an toàn 4-20k/ngày</li>
                <li>⚔️ Hỗ trợ KvK chuyên nghiệp</li>
                <li>👥 Quản lý liên minh hiệu quả</li>
                <li>📈 Tăng power 100-200% an toàn</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/services" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Xem dịch vụ
              </a>
              <a href="${process.env.NEXT_PUBLIC_DISCORD_INVITE}" 
                 style="background: #5865f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Tham gia Discord
              </a>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #d97706;">🎁 Ưu đãi đặc biệt cho thành viên mới:</h3>
              <p><strong>Giảm 10%</strong> cho đơn hàng đầu tiên khi đặt dịch vụ trong 7 ngày!</p>
              <p>Mã giảm giá: <strong>WELCOME10</strong></p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
              <p>Cần hỗ trợ? Chúng tôi luôn sẵn sàng!</p>
              <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Chào mừng ${user.full_name} đến với RoK Services!
        
        Cảm ơn bạn đã đăng ký tài khoản. Với RoK Services, bạn có thể:
        - Tư vấn chiến thuật từ top 1% players
        - Farm gem an toàn 4-20k/ngày
        - Hỗ trợ KvK chuyên nghiệp
        - Quản lý liên minh hiệu quả
        - Tăng power 100-200% an toàn
        
        Ưu đãi đặc biệt: Giảm 10% đơn hàng đầu tiên với mã WELCOME10
        
        Xem dịch vụ: ${process.env.NEXT_PUBLIC_SITE_URL}/services
        Discord: ${process.env.NEXT_PUBLIC_DISCORD_INVITE}
      `
    }
  }

  private getServiceReminderTemplate(booking: BookingWithRelations): EmailTemplate {
    const serviceName = `${booking.service_tiers.services.name} - ${booking.service_tiers.name}`
    const daysLeft = booking.end_date
      ? Math.ceil(
          (new Date(booking.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0

    return {
      subject: `Nhắc nhở: Dịch vụ ${booking.service_tiers.services.name} sắp hết hạn`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nhắc nhở dịch vụ</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">🎮 RoK Services</h1>
              <h2 style="color: #f59e0b;">⏰ Nhắc nhở dịch vụ</h2>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3>Dịch vụ của bạn sắp hết hạn:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Dịch vụ:</strong> ${serviceName}</li>
                <li><strong>Mã booking:</strong> ${booking.booking_number}</li>
                <li><strong>Ngày hết hạn:</strong> ${booking.end_date ? new Date(booking.end_date).toLocaleDateString('vi-VN') : 'N/A'}</li>
                <li><strong>Còn lại:</strong> ${daysLeft} ngày</li>
              </ul>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #059669;">Bạn có muốn gia hạn không?</h3>
              <p>Để tiếp tục nhận dịch vụ chất lượng, hãy gia hạn ngay hôm nay!</p>
              <ul>
                <li>✅ Giữ nguyên chất lượng dịch vụ</li>
                <li>✅ Không bị gián đoạn</li>
                <li>✅ Ưu đãi cho khách hàng thân thiết</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/renew/${booking.id}" 
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Gia hạn ngay
              </a>
              <a href="${process.env.NEXT_PUBLIC_CONTACT_EMAIL}" 
                 style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Liên hệ tư vấn
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
              <p>Cảm ơn bạn đã tin tưởng RoK Services!</p>
              <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Nhắc nhở: Dịch vụ sắp hết hạn
        
        Dịch vụ: ${serviceName}
        Mã booking: ${booking.booking_number}
        Ngày hết hạn: ${booking.end_date ? new Date(booking.end_date).toLocaleDateString('vi-VN') : 'N/A'}
        Còn lại: ${daysLeft} ngày
        
        Gia hạn ngay: ${process.env.NEXT_PUBLIC_SITE_URL}/renew/${booking.id}
        Liên hệ: ${process.env.NEXT_PUBLIC_CONTACT_EMAIL}
      `
    }
  }

  private getLeadFollowUpTemplate(lead: Lead): EmailTemplate {
    return {
      subject: 'Bạn có cần hỗ trợ thêm về dịch vụ Rise of Kingdoms?',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Follow-up dịch vụ RoK</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">🎮 RoK Services</h1>
              <h2 style="color: #059669;">Xin chào ${lead.full_name ?? 'bạn'}!</h2>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>Chúng tôi nhận thấy bạn quan tâm đến dịch vụ <strong>${lead.service_interest ?? 'Rise of Kingdoms'}</strong> của chúng tôi.</p>
              <p>Có điều gì chúng tôi có thể hỗ trợ bạn không?</p>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #059669;">Tại sao chọn RoK Services?</h3>
              <ul>
                <li>🏆 Top 1% players Việt Nam</li>
                <li>✅ 500+ khách hàng thành công</li>
                <li>💯 Đảm bảo hoàn tiền 100%</li>
                <li>⚡ Hỗ trợ 24/7 qua Discord</li>
                <li>🔒 Phương pháp an toàn 100%</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                Tư vấn miễn phí
              </a>
              <a href="${process.env.NEXT_PUBLIC_DISCORD_INVITE}" 
                 style="background: #5865f2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Chat Discord
              </a>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #d97706;">🎁 Ưu đãi đặc biệt:</h3>
              <p>Tư vấn miễn phí 30 phút đầu tiên + Giảm 10% cho đơn hàng đầu tiên!</p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280;">
              <p>Phản hồi trong 5 phút!</p>
              <p>📧 ${process.env.NEXT_PUBLIC_CONTACT_EMAIL} | 📞 ${process.env.NEXT_PUBLIC_SUPPORT_PHONE}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Xin chào ${lead.full_name ?? 'bạn'}!
        
        Chúng tôi nhận thấy bạn quan tâm đến dịch vụ ${lead.service_interest ?? 'Rise of Kingdoms'}.
        
        Tại sao chọn RoK Services?
        - Top 1% players Việt Nam
        - 500+ khách hàng thành công
        - Đảm bảo hoàn tiền 100%
        - Hỗ trợ 24/7 qua Discord
        - Phương pháp an toàn 100%
        
        Ưu đãi đặc biệt: Tư vấn miễn phí 30 phút + Giảm 10% đơn đầu tiên!
        
        Tư vấn: ${process.env.NEXT_PUBLIC_SITE_URL}/contact
        Discord: ${process.env.NEXT_PUBLIC_DISCORD_INVITE}
      `
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  emailServiceInstance ??= new EmailService()
  return emailServiceInstance
}

export default EmailService
