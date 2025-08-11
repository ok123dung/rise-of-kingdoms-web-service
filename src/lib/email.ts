// Email utility functions for Rise of Kingdoms Services

import { getLogger } from '@/lib/monitoring/logger'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Simple email sender (in production, you'd use services like SendGrid, Resend, etc.)
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      getLogger().debug('📧 Email would be sent', {
        to: options.to,
        subject: options.subject,
        preview: options.text?.substring(0, 100) || options.html.substring(0, 100)
      })
      return true
    }

    // In production, you would integrate with an email service
    // Example with fetch to an email service API:
    /*
    const response = await fetch(process.env.EMAIL_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`
      },
      body: JSON.stringify(options)
    })
    
    return response.ok
    */

    // For now, return true to avoid blocking signup
    return true
  } catch (error) {
    getLogger().error('Email sending failed', error instanceof Error ? error : new Error(String(error)), { 
      to: options.to,
      subject: options.subject 
    })
    return false
  }
}

// Welcome email template
export async function sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Chào mừng đến với RoK Services</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8fafc;
          padding: 30px 20px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          background: #f59e0b;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .features {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin: 10px 0;
        }
        .feature-icon {
          margin-right: 10px;
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏰 Chào mừng đến với RoK Services!</h1>
        <p>Xin chào ${fullName}, cảm ơn bạn đã tham gia cộng đồng Rise of Kingdoms chuyên nghiệp!</p>
      </div>
      
      <div class="content">
        <h2>🎉 Tài khoản của bạn đã được tạo thành công!</h2>
        
        <p>Chúc mừng bạn đã trở thành thành viên của RoK Services - nền tảng dịch vụ Rise of Kingdoms hàng đầu Việt Nam.</p>
        
        <div class="features">
          <h3>💎 Những gì bạn có thể làm ngay bây giờ:</h3>
          
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <span>Truy cập thư viện hướng dẫn miễn phí</span>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">🏆</span>
            <span>Đặt dịch vụ tư vấn chiến thuật chuyên nghiệp</span>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">👥</span>
            <span>Tham gia cộng đồng Discord VIP</span>
          </div>
          
          <div class="feature-item">
            <span class="feature-icon">⚔️</span>
            <span>Sử dụng công cụ quản lý alliance</span>
          </div>
        </div>
        
        <p style="text-align: center;">
          <a href="${process.env.NEXTAUTH_URL || 'https://rokdbot.com'}/dashboard" class="button">
            🚀 Khám phá Dashboard
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <h3>🔥 Ưu đãi đặc biệt cho thành viên mới:</h3>
        <ul>
          <li><strong>Giảm 20%</strong> dịch vụ tư vấn đầu tiên</li>
          <li><strong>Miễn phí</strong> phân tích kingdom và alliance</li>
          <li><strong>Truy cập VIP</strong> group Discord trong 7 ngày</li>
        </ul>
        
        <p><strong>Mã giảm giá:</strong> <code style="background: #fef3c7; padding: 4px 8px; border-radius: 4px;">WELCOME20</code></p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p><strong>Cần hỗ trợ?</strong></p>
        <ul>
          <li>📧 Email: <a href="mailto:support@rokdbot.com">support@rokdbot.com</a></li>
          <li>💬 Discord: <a href="https://discord.gg/rokservices">discord.gg/rokservices</a></li>
          <li>📱 Website: <a href="${process.env.NEXTAUTH_URL || 'https://rokdbot.com'}">${process.env.NEXTAUTH_URL || 'rokdbot.com'}</a></li>
        </ul>
        
        <p style="margin-top: 40px; font-size: 14px; color: #64748b;">
          Trân trọng,<br>
          <strong>Đội ngũ RoK Services</strong><br>
          <em>"Your Rise of Kingdoms Success Partner"</em>
        </p>
      </div>
    </body>
    </html>
  `

  const textContent = `
Chào mừng đến với RoK Services!

Xin chào ${fullName},

Cảm ơn bạn đã tham gia cộng đồng Rise of Kingdoms chuyên nghiệp!

Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể:

• Truy cập thư viện hướng dẫn miễn phí
• Đặt dịch vụ tư vấn chiến thuật chuyên nghiệp  
• Tham gia cộng đồng Discord VIP
• Sử dụng công cụ quản lý alliance

Ưu đãi đặc biệt cho thành viên mới:
- Giảm 20% dịch vụ tư vấn đầu tiên
- Miễn phí phân tích kingdom và alliance
- Truy cập VIP group Discord trong 7 ngày

Mã giảm giá: WELCOME20

Khám phá Dashboard: ${process.env.NEXTAUTH_URL || 'https://rokdbot.com'}/dashboard

Cần hỗ trợ?
- Email: support@rokdbot.com
- Discord: discord.gg/rokservices
- Website: ${process.env.NEXTAUTH_URL || 'rokdbot.com'}

Trân trọng,
Đội ngũ RoK Services
"Your Rise of Kingdoms Success Partner"
  `

  return await sendEmail({
    to: email,
    subject: '🏰 Chào mừng đến với RoK Services - Tài khoản đã được tạo thành công!',
    html: htmlContent,
    text: textContent
  })
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://rokdbot.com'}/auth/reset-password?token=${resetToken}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Đặt lại mật khẩu - RoK Services</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f8fafc;
          padding: 30px 20px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔒 Đặt lại mật khẩu</h1>
        <p>Yêu cầu thay đổi mật khẩu cho tài khoản RoK Services</p>
      </div>
      
      <div class="content">
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản có email <strong>${email}</strong>.</p>
        
        <p>Nếu bạn đã yêu cầu điều này, hãy click vào nút bên dưới để đặt mật khẩu mới:</p>
        
        <p style="text-align: center;">
          <a href="${resetUrl}" class="button">
            🔑 Đặt lại mật khẩu
          </a>
        </p>
        
        <div class="warning">
          <strong>⚠️ Lưu ý quan trọng:</strong>
          <ul>
            <li>Link này sẽ hết hạn sau <strong>1 giờ</strong></li>
            <li>Chỉ có thể sử dụng <strong>một lần</strong></li>  
            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">
          Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="font-size: 14px; color: #64748b;">
          Cần hỗ trợ? Liên hệ chúng tôi:<br>
          📧 <a href="mailto:support@rokdbot.com">support@rokdbot.com</a><br>
          💬 <a href="https://discord.gg/rokservices">Discord Support</a>
        </p>
      </div>
    </body>
    </html>
  `

  const textContent = `
Đặt lại mật khẩu - RoK Services

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ${email}.

Nếu bạn đã yêu cầu điều này, truy cập link sau để đặt mật khẩu mới:
${resetUrl}

⚠️ Lưu ý quan trọng:
- Link này sẽ hết hạn sau 1 giờ
- Chỉ có thể sử dụng một lần
- Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này

Cần hỗ trợ?
Email: support@rokdbot.com
Discord: discord.gg/rokservices

Trân trọng,
Đội ngũ RoK Services
  `

  return await sendEmail({
    to: email,
    subject: '🔒 Đặt lại mật khẩu - RoK Services',
    html: htmlContent,
    text: textContent
  })
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  email: string,
  fullName: string,
  orderDetails: {
    orderNumber: string;
    serviceName: string;
    amount: number;
    currency: string;
    paymentMethod?: string;
  }
): Promise<boolean> {
  // Implementation for order confirmation email
  // This would be used when users book services

  return await sendEmail({
    to: email,
    subject: '✅ Xác nhận đơn hàng - RoK Services',
    html: `<h1>Đơn hàng đã được xác nhận</h1><p>Xin chào ${fullName}, đơn hàng của bạn đã được xác nhận.</p>`,
    text: `Đơn hàng đã được xác nhận\nXin chào ${fullName}, đơn hàng của bạn đã được xác nhận.`
  })
}
