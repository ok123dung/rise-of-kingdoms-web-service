# 🚀 Cấu hình Vercel với Railway Database

## Bước 1: Vào Vercel Dashboard
1. Đăng nhập Vercel
2. Chọn project của bạn
3. Vào **Settings** → **Environment Variables**

## Bước 2: Thêm các biến môi trường

### DATABASE_URL (BẮT BUỘC)
```
DATABASE_URL=postgresql://postgres:qllvWulFKNbBHBGVLaevIRjjDMxDpUPy@yamabiko.proxy.rlwy.net:59019/railway?pgbouncer=true&connection_limit=1
```

**LƯU Ý**: Dùng DATABASE_PUBLIC_URL từ Railway, KHÔNG phải DATABASE_URL internal!

### NEXTAUTH_URL (BẮT BUỘC)
```
NEXTAUTH_URL=https://your-app-name.vercel.app
```
Thay `your-app-name` bằng tên app Vercel của bạn

### NEXTAUTH_SECRET (BẮT BUỘC)
Chạy lệnh này để tạo secret:
```bash
openssl rand -base64 32
```
Hoặc dùng secret này (chỉ để test):
```
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
```

## Bước 3: Thêm biến môi trường vào Vercel

### Cách 1: Qua Vercel Dashboard
1. Click **Add New**
2. Nhập từng biến:
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres:qllvWulFKNbBHBGVLaevIRjjDMxDpUPy@yamabiko.proxy.rlwy.net:59019/railway?pgbouncer=true&connection_limit=1`
   - Environment: Chọn **Production**, **Preview**, và **Development**
3. Lặp lại cho `NEXTAUTH_URL` và `NEXTAUTH_SECRET`

### Cách 2: Qua Vercel CLI
```bash
# Cài Vercel CLI nếu chưa có
npm i -g vercel

# Link project
vercel link

# Thêm biến môi trường
vercel env add DATABASE_URL production
# Paste: postgresql://postgres:qllvWulFKNbBHBGVLaevIRjjDMxDpUPy@yamabiko.proxy.rlwy.net:59019/railway?pgbouncer=true&connection_limit=1

vercel env add NEXTAUTH_URL production
# Paste: https://your-app-name.vercel.app

vercel env add NEXTAUTH_SECRET production
# Paste secret đã tạo
```

## Bước 4: Redeploy
1. Sau khi thêm xong tất cả biến
2. Vào tab **Deployments**
3. Click dấu 3 chấm ở deployment mới nhất
4. Chọn **Redeploy**

## Bước 5: Kiểm tra
Sau khi deploy xong (~2-3 phút), test:

```bash
# Kiểm tra health
curl https://your-app-name.vercel.app/api/health

# Kiểm tra database
curl https://your-app-name.vercel.app/api/health/db
```

## Biến môi trường khác (tùy chọn)

```env
# Email (nếu dùng)
RESEND_API_KEY=your-resend-key
FROM_EMAIL=noreply@yourdomain.com

# Discord OAuth (nếu dùng)
DISCORD_CLIENT_ID=your-discord-id
DISCORD_CLIENT_SECRET=your-discord-secret

# Payment (nếu dùng)
MOMO_PARTNER_CODE=your-momo-code
# ... các payment gateway khác
```

## Troubleshooting

### Lỗi "Too many connections"
→ Đảm bảo DATABASE_URL có `?pgbouncer=true&connection_limit=1`

### Lỗi "NEXTAUTH_URL mismatch"
→ NEXTAUTH_URL phải khớp chính xác với domain Vercel

### Vẫn lỗi sau khi thêm biến?
1. Kiểm tra Function Logs trong Vercel
2. Đảm bảo đã Redeploy sau khi thêm biến
3. Kiểm tra không có typo trong DATABASE_URL

---
**Thời gian hoàn thành: 5 phút** ⏱️