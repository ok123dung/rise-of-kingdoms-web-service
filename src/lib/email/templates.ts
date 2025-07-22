// Email template system for Rise of Kingdoms Services

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Welcome email template
export function getWelcomeEmailTemplate(userFullName: string, userEmail: string): EmailTemplate {
  const subject = 'Chào mừng bạn đến với RoK Services! 🎮'
  
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng đến với RoK Services</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .services { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .service-item { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
        .highlight { color: #DC2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎮 Chào mừng ${userFullName}!</h1>
        <p>Cảm ơn bạn đã tham gia cộng đồng RoK Services</p>
      </div>
      
      <div class="content">
        <p>Xin chào <strong>${userFullName}</strong>,</p>
        
        <p>Chúng tôi rất vui mừng chào đón bạn đến với <strong>RoK Services</strong> - nền tảng dịch vụ chuyên nghiệp dành cho người chơi Rise of Kingdoms tại Việt Nam!</p>
        
        <div class="services">
          <h3>🔥 Dịch vụ nổi bật dành cho bạn:</h3>
          
          <div class="service-item">
            <strong>🎯 Tư vấn chiến thuật</strong><br>
            Phân tích và tối ưu chiến lược cho từng tình huống cụ thể
          </div>
          
          <div class="service-item">
            <strong>🌾 Farm Gem chuyên nghiệp</strong><br>
            Tự động hóa quá trình farming để tối đa hóa tài nguyên
          </div>
          
          <div class="service-item">
            <strong>⚔️ KvK Support</strong><br>
            Hỗ trợ chuyên sâu trong các trận Kingdom vs Kingdom
          </div>
        </div>
        
        <p><span class="highlight">Ưu đãi đặc biệt</span> cho thành viên mới:</p>
        <ul>
          <li>🎁 Miễn phí 1 buổi tư vấn chiến thuật (trị giá 200k VNĐ)</li>
          <li>💰 Giảm 20% cho dịch vụ đầu tiên</li>
          <li>⚡ Hỗ trợ ưu tiên trong 30 ngày</li>
        </ul>
        
        <p style="text-align: center;">
          <a href="https://rokdbot.com/services" class="button">Khám phá dịch vụ ngay</a>
        </p>
        
        <p><strong>Thông tin tài khoản của bạn:</strong></p>
        <ul>
          <li>Email: ${userEmail}</li>
          <li>Trạng thái: Đã kích hoạt ✅</li>
          <li>Cấp độ: Thành viên mới</li>
        </ul>
        
        <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua:</p>
        <ul>
          <li>📧 Email: support@rokdbot.com</li>
          <li>💬 Discord: Tham gia server RoK Services</li>
          <li>📱 Website: rokdbot.com</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Cảm ơn bạn đã tin tưởng RoK Services!</p>
        <p><strong>RoK Services Team</strong></p>
        <p style="font-size: 12px; color: #9ca3af;">
          Email này được gửi tự động. Vui lòng không reply trực tiếp.<br>
          Nếu bạn không tạo tài khoản này, vui lòng liên hệ support@rokdbot.com
        </p>
      </div>
    </body>
    </html>
  `
  
  const text = `
Chào mừng ${userFullName} đến với RoK Services!

Cảm ơn bạn đã tham gia cộng đồng dịch vụ chuyên nghiệp dành cho người chơi Rise of Kingdoms tại Việt Nam.

Dịch vụ nổi bật:
- Tư vấn chiến thuật chuyên sâu
- Farm Gem tự động
- Hỗ trợ KvK chuyên nghiệp

Ưu đãi thành viên mới:
- Miễn phí 1 buổi tư vấn (200k VNĐ)
- Giảm 20% dịch vụ đầu tiên
- Hỗ trợ ưu tiên 30 ngày

Khám phá ngay: https://rokdbot.com/services

Thông tin tài khoản:
Email: ${userEmail}
Trạng thái: Đã kích hoạt

Liên hệ hỗ trợ: support@rokdbot.com

Trân trọng,
RoK Services Team
  `
  
  return { subject, html, text }
}

// Booking confirmation email template
export function getBookingConfirmationTemplate(
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  amount: number,
  bookingDate: Date
): EmailTemplate {
  const subject = `Xác nhận đặt dịch vụ #${bookingNumber} - RoK Services`
  
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
  
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(bookingDate)
  
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác nhận đặt dịch vụ</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }
        .status-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
        .next-steps { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Đặt dịch vụ thành công!</h1>
        <p>Mã đơn hàng: <strong>#${bookingNumber}</strong></p>
      </div>
      
      <div class="content">
        <p>Xin chào <strong>${customerName}</strong>,</p>
        
        <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của RoK Services! Đơn hàng của bạn đã được xác nhận thành công.</p>
        
        <div class="booking-details">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="status-badge">ĐÃ XÁC NHẬN</span>
          </div>
          
          <h3>📋 Chi tiết đơn hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Mã đơn hàng:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">#${bookingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Dịch vụ:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Thời gian đặt:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Tổng tiền:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;" class="amount">${formattedAmount}</td>
            </tr>
          </table>
        </div>
        
        <div class="next-steps">
          <h3>📌 Các bước tiếp theo:</h3>
          <ol>
            <li><strong>Thanh toán:</strong> Vui lòng hoàn tất thanh toán trong vòng 24 giờ</li>
            <li><strong>Xác nhận:</strong> Chúng tôi sẽ xác nhận thanh toán và liên hệ với bạn</li>
            <li><strong>Bắt đầu dịch vụ:</strong> Team chuyên gia sẽ liên hệ để bắt đầu</li>
            <li><strong>Hoàn thành:</strong> Nhận kết quả và đánh giá dịch vụ</li>
          </ol>
        </div>
        
        <p><strong>📞 Thông tin liên hệ:</strong></p>
        <ul>
          <li>📧 Email hỗ trợ: support@rokdbot.com</li>
          <li>💬 Discord: RoK Services Official</li>
          <li>📱 Hotline: 0987.654.321 (8:00 - 22:00 hàng ngày)</li>
        </ul>
        
        <p style="color: #059669; font-weight: bold;">
          💡 Tip: Kiểm tra email thường xuyên để nhận thông tin cập nhật về đơn hàng của bạn!
        </p>
      </div>
      
      <div class="footer">
        <p>Cảm ơn bạn đã chọn RoK Services!</p>
        <p><strong>Đội ngũ RoK Services</strong></p>
        <p style="font-size: 12px; color: #9ca3af;">
          Đơn hàng này được tạo tự động. Nếu có thắc mắc, vui lòng liên hệ support@rokdbot.com
        </p>
      </div>
    </body>
    </html>
  `
  
  const text = `
✅ ĐẶT DỊCH VỤ THÀNH CÔNG!

Xin chào ${customerName},

Đơn hàng của bạn đã được xác nhận:
- Mã đơn hàng: #${bookingNumber}
- Dịch vụ: ${serviceName}
- Thời gian: ${formattedDate}
- Tổng tiền: ${formattedAmount}

Các bước tiếp theo:
1. Hoàn tất thanh toán trong 24h
2. Chờ xác nhận từ hệ thống
3. Team chuyên gia sẽ liên hệ
4. Bắt đầu cung cấp dịch vụ

Liên hệ hỗ trợ:
- Email: support@rokdbot.com
- Discord: RoK Services Official
- Hotline: 0987.654.321

Cảm ơn bạn đã tin tưởng RoK Services!

Trân trọng,
Đội ngũ RoK Services
  `
  
  return { subject, html, text }
}

// Payment confirmation email template
export function getPaymentConfirmationTemplate(
  customerName: string,
  bookingNumber: string,
  serviceName: string,
  amount: number,
  paymentMethod: string,
  paymentDate: Date
): EmailTemplate {
  const subject = `Thanh toán thành công #${bookingNumber} - RoK Services`
  
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
  
  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(paymentDate)
  
  const paymentMethodNames: { [key: string]: string } = {
    'momo': 'Ví MoMo',
    'zalopay': 'ZaloPay',
    'vnpay': 'VNPay',
    'banking': 'Chuyển khoản ngân hàng'
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thanh toán thành công</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #faf5ff; padding: 30px; border-radius: 0 0 10px 10px; }
        .payment-success { background: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .next-steps { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 28px; font-weight: bold; color: #16a34a; }
        .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💳 Thanh toán thành công!</h1>
        <p>Đơn hàng #${bookingNumber}</p>
      </div>
      
      <div class="content">
        <p>Xin chào <strong>${customerName}</strong>,</p>
        
        <div class="payment-success">
          <h2>🎉 THANH TOÁN HOÀN TẤT!</h2>
          <p class="amount">${formattedAmount}</p>
          <p>Chúng tôi đã nhận được thanh toán của bạn</p>
        </div>
        
        <p>Cảm ơn bạn đã hoàn tất thanh toán cho dịch vụ RoK Services. Giao dịch của bạn đã được xử lý thành công!</p>
        
        <div class="payment-details">
          <h3>💰 Thông tin thanh toán:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Mã đơn hàng:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">#${bookingNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Dịch vụ:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${serviceName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Số tiền:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;" style="color: #16a34a; font-weight: bold;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Phương thức:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${paymentMethodNames[paymentMethod] || paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Thời gian:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Trạng thái:</strong></td>
              <td style="padding: 10px; color: #16a34a; font-weight: bold;">✅ THÀNH CÔNG</td>
            </tr>
          </table>
        </div>
        
        <div class="next-steps">
          <h3>🚀 Điều gì sẽ xảy ra tiếp theo?</h3>
          <ol>
            <li><strong>Xác nhận tức thì:</strong> Đơn hàng của bạn được chuyển sang trạng thái "Đã xác nhận"</li>
            <li><strong>Liên hệ từ chuyên gia:</strong> Trong vòng 2-4 giờ, team sẽ liên hệ để bắt đầu</li>
            <li><strong>Bắt đầu dịch vụ:</strong> Chúng tôi sẽ tiến hành cung cấp dịch vụ theo yêu cầu</li>
            <li><strong>Cập nhật tiến độ:</strong> Bạn sẽ nhận được báo cáo định kỳ qua email</li>
          </ol>
        </div>
        
        <p><strong>📞 Liên hệ nhanh:</strong></p>
        <ul>
          <li>📧 Email: support@rokdbot.com</li>
          <li>💬 Discord: RoK Services Official</li>
          <li>📱 Hotline: 0987.654.321</li>
          <li>🌐 Website: rokdbot.com</li>
        </ul>
        
        <p style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>💡 Lưu ý:</strong> Vui lòng lưu lại email này làm biên lai thanh toán. Nếu có bất kỳ vấn đề gì, hãy liên hệ với chúng tôi kèm theo mã đơn hàng #${bookingNumber}
        </p>
      </div>
      
      <div class="footer">
        <p>Cảm ơn bạn đã tin tưởng RoK Services!</p>
        <p><strong>Team RoK Services - Chuyên gia Rise of Kingdoms</strong></p>
        <p style="font-size: 12px; color: #9ca3af;">
          Email này là xác nhận giao dịch chính thức. Vui lòng giữ lại để đối chiếu.
        </p>
      </div>
    </body>
    </html>
  `
  
  const text = `
💳 THANH TOÁN THÀNH CÔNG!

Xin chào ${customerName},

Giao dịch của bạn đã được xử lý thành công:

Thông tin thanh toán:
- Mã đơn hàng: #${bookingNumber}
- Dịch vụ: ${serviceName}
- Số tiền: ${formattedAmount}
- Phương thức: ${paymentMethodNames[paymentMethod] || paymentMethod}
- Thời gian: ${formattedDate}
- Trạng thái: ✅ THÀNH CÔNG

Điều gì sẽ xảy ra tiếp theo?
1. Đơn hàng chuyển sang "Đã xác nhận"
2. Team chuyên gia liên hệ trong 2-4h
3. Bắt đầu cung cấp dịch vụ
4. Cập nhật tiến độ định kỳ

Liên hệ:
- Email: support@rokdbot.com
- Discord: RoK Services Official
- Hotline: 0987.654.321
- Website: rokdbot.com

Lưu ý: Giữ lại email này làm biên lai thanh toán.

Cảm ơn bạn đã tin tưởng RoK Services!

Team RoK Services
  `
  
  return { subject, html, text }
}

// Lead notification email template (for admin)
export function getLeadNotificationTemplate(
  leadName: string,
  leadEmail: string,
  leadPhone: string | null,
  serviceInterest: string,
  source: string,
  notes: string | null
): EmailTemplate {
  const subject = `🔥 Lead mới: ${leadName} quan tâm ${serviceInterest}`
  
  const serviceNames: { [key: string]: string } = {
    'strategy': 'Tư vấn chiến thuật',
    'farming': 'Farm Gem',
    'kvk': 'KvK Support',
    'alliance': 'Quản lý liên minh',
    'premium': 'Dịch vụ cao cấp',
    'coaching': 'Coaching cá nhân'
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lead mới từ RoK Services</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fffbeb; padding: 30px; border-radius: 0 0 10px 10px; }
        .lead-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
        .urgent { background: #fee2e2; border: 2px solid #ef4444; color: #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
        .actions { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔥 Lead mới!</h1>
        <p>Có khách hàng tiềm năng quan tâm dịch vụ</p>
      </div>
      
      <div class="content">
        <div class="urgent">
          ⚡ CẦN PHẢN HỒI NHANH TRONG 15 PHÚT ⚡
        </div>
        
        <div class="lead-details">
          <h3>👤 Thông tin khách hàng:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Tên:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${leadName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${leadEmail}">${leadEmail}</a></td>
            </tr>
            ${leadPhone ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>SĐT:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${leadPhone}">${leadPhone}</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Quan tâm:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><span style="background: #F59E0B; color: white; padding: 4px 8px; border-radius: 4px;">${serviceNames[serviceInterest] || serviceInterest}</span></td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Nguồn:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${source}</td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Thời gian:</strong></td>
              <td style="padding: 10px;">${new Date().toLocaleString('vi-VN')}</td>
            </tr>
          </table>
          
          ${notes ? `
          <div style="margin-top: 20px;">
            <strong>📝 Ghi chú từ khách hàng:</strong>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 10px; font-style: italic;">
              "${notes}"
            </div>
          </div>
          ` : ''}
        </div>
        
        <div class="actions">
          <h3>🚀 Hành động ngay:</h3>
          <ol>
            <li><strong>Gọi điện ngay:</strong> ${leadPhone ? `<a href="tel:${leadPhone}">${leadPhone}</a>` : 'Không có SĐT'}</li>
            <li><strong>Gửi email:</strong> <a href="mailto:${leadEmail}?subject=Chào bạn ${leadName} - RoK Services&body=Xin chào ${leadName},%0A%0ACảm ơn bạn đã quan tâm đến dịch vụ ${serviceNames[serviceInterest]} của chúng tôi...">Soạn email ngay</a></li>
            <li><strong>Cập nhật CRM:</strong> Ghi nhận lead vào hệ thống quản lý</li>
            <li><strong>Follow up:</strong> Đặt lịch nhắc nhở follow up sau 1 giờ nếu chưa liên lạc được</li>
          </ol>
        </div>
        
        <p><strong>💡 Tips bán hàng:</strong></p>
        <ul>
          <li>Gọi điện trong vòng 15 phút để tăng tỷ lệ conversion</li>
          <li>Tập trung vào pain point của khách về ${serviceNames[serviceInterest]}</li>
          <li>Đề xuất tư vấn miễn phí 15 phút để build trust</li>
          <li>Sử dụng case study và testimonial phù hợp</li>
        </ul>
      </div>
    </body>
    </html>
  `
  
  const text = `
🔥 LEAD MỚI - CẦN PHẢN HỒI NGAY!

Thông tin khách hàng:
- Tên: ${leadName}
- Email: ${leadEmail}
- SĐT: ${leadPhone || 'Không có'}
- Quan tâm: ${serviceNames[serviceInterest] || serviceInterest}
- Nguồn: ${source}
- Thời gian: ${new Date().toLocaleString('vi-VN')}

${notes ? `Ghi chú: "${notes}"` : ''}

Hành động ngay:
1. Gọi điện: ${leadPhone || 'Không có SĐT'}
2. Email: ${leadEmail}
3. Cập nhật CRM
4. Đặt lịch follow up

⚡ CẦN LIÊN HỆ TRONG 15 PHÚT!

RoK Services CRM
  `
  
  return { subject, html, text }
}