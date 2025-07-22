# 🗄️ RoK Services - Supabase Database Setup Guide

## 🎯 Quick Setup (5 phút)

### 1. Tạo Supabase Project
1. Truy cập: https://supabase.com/dashboard
2. Click **"New Project"**
3. Điền thông tin:
   - **Name**: `rok-services-production`
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: `Southeast Asia (Singapore)` - gần Việt Nam nhất
4. Click **"Create new project"** (đợi ~2 phút)

### 2. Lấy Database URL
1. Vào **Settings** → **Database**
2. Scroll xuống **Connection string**
3. Copy **URI** string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Cấu hình Environment Variables trên Vercel
1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project `rok-services`
3. **Settings** → **Environment Variables**
4. Add các biến sau:

```bash
# Database (Required)
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# NextAuth (Required)
NEXTAUTH_URL = https://rok-services.vercel.app
NEXTAUTH_SECRET = your-super-secret-key-here-min-32-chars

# Discord OAuth (Optional - for login)
DISCORD_CLIENT_ID = your-discord-app-client-id
DISCORD_CLIENT_SECRET = your-discord-app-client-secret

# Email Service (Optional - for notifications)
RESEND_API_KEY = re_your-resend-api-key
FROM_EMAIL = noreply@rokservices.com
```

### 4. Redeploy trên Vercel
1. Vào **Deployments** tab
2. Click **3 dots** → **Redeploy**
3. Check **"Use existing Build Cache"** = false
4. Click **"Redeploy"**

## 🚀 Kết quả mong đợi

### ✅ Sau khi setup thành công:
- 🌐 **Website**: https://rok-services.vercel.app
- 🏥 **Health API**: https://rok-services.vercel.app/api/health
- 📊 **Admin**: https://rok-services.vercel.app/admin (sau khi đăng nhập)
- 💳 **Services**: https://rok-services.vercel.app/services

### 📊 Database sẽ tự động tạo các bảng:
- `User` - Người dùng và admin
- `Service` - Dịch vụ RoK (Strategy, Power Up, etc.)
- `ServiceTier` - Các gói dịch vụ (Basic/Pro/Premium)
- `Booking` - Đơn đặt hàng
- `Payment` - Thanh toán (MoMo/VNPay/ZaloPay)
- `Lead` - Khách hàng tiềm năng
- `Communication` - Email/SMS logs

### 🎮 Dữ liệu mẫu sẽ có:
- **3 dịch vụ chính**: Strategy, Power Up, Account Protection
- **15+ gói dịch vụ** với giá từ 500K-5M VNĐ
- **Admin user** (người đăng ký đầu tiên)

## ⚡ Khắc phục sự cố

### ❌ Lỗi Database Connection:
1. Check DATABASE_URL có đúng password không
2. Verify Supabase project đã hoạt động
3. Test connection trong Supabase dashboard

### ❌ Lỗi Build Failed:
1. Check tất cả environment variables đã set
2. Xem build logs trong Vercel
3. Redeploy với clean cache

### ❌ Lỗi 500 Internal Server Error:
1. Check Function logs trong Vercel
2. Verify NEXTAUTH_SECRET đã set
3. Check database schema đã deploy

## 📞 Support
- **GitHub Issues**: https://github.com/ok123dung/rok-services/issues
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---
*Database setup by Claude Code - Ready for 15.6M VNĐ/month revenue! 🎯*