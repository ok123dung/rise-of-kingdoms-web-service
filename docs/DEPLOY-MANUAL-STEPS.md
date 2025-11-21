# 🚀 HƯỚNG DẪN DEPLOY THỦ CÔNG - COPY & PASTE

## BẠN CẦN LÀM 4 VIỆC:

---

## 1️⃣ PUSH CODE LÊN GITHUB (2 phút)

### Cách 1: Dùng GitHub Token (Dễ nhất)

```bash
# Bước 1: Tạo token tại https://github.com/settings/tokens
# - Click "Generate new token (classic)"
# - Chọn "repo" (tất cả)
# - Click "Generate token"
# - COPY TOKEN (chỉ hiện 1 lần!)

# Bước 2: Push với token
git push https://YOUR_TOKEN@github.com/ok123dung/rok-services.git main

# Thay YOUR_TOKEN bằng token vừa copy
```

### Cách 2: Dùng SSH (Lâu hơn)

```bash
# Bước 1: Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
# Nhấn Enter 3 lần

# Bước 2: Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy toàn bộ output

# Bước 3: Add key vào GitHub
# - Vào https://github.com/settings/keys
# - Click "New SSH key"
# - Paste key vào
# - Click "Add SSH key"

# Bước 4: Change remote
git remote set-url origin git@github.com:ok123dung/rok-services.git

# Bước 5: Push
git push origin main
```

---

## 2️⃣ DEPLOY LÊN VERCEL (10 phút)

### Bước A: Đăng nhập Vercel

```bash
# Cài Vercel CLI (nếu chưa có)
npm install -g vercel

# Login
vercel login
# Nhập email → Check email → Click verify
```

### Bước B: Deploy lần đầu

```bash
cd /home/admin1/rok-services
vercel

# Trả lời các câu hỏi:
# ? Set up and deploy? → YES
# ? Which scope? → Chọn account của bạn
# ? Link to existing project? → NO
# ? What's your project's name? → rok-services (hoặc tên khác)
# ? In which directory is your code located? → ./
# ? Want to override the settings? → NO

# Chờ build & deploy (2-3 phút)
```

### Bước C: Deploy Production

```bash
vercel --prod

# Lần này sẽ nhanh hơn (1-2 phút)
# Kết thúc sẽ có URL: https://rok-services-xxx.vercel.app
```

---

## 3️⃣ SETUP ENVIRONMENT VARIABLES (5 phút)

### Cách 1: Qua Dashboard (Khuyến nghị)

```bash
# 1. Mở Vercel dashboard
# 2. Chọn project "rok-services"
# 3. Settings → Environment Variables
# 4. Copy & paste từng biến dưới đây:
```

**PASTE CÁC BIẾN NÀY:**

```bash
# === DATABASE ===
DATABASE_URL=postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001%2A@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001%2A@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# === AUTHENTICATION ===
NEXTAUTH_URL=https://rok-services-xxx.vercel.app
# ⚠️ Thay xxx bằng URL thật của bạn

NEXTAUTH_SECRET=k4pKLVQGw45418wuWITg/LwuYk9KoOZe+6XVczjyxNg=

# === API KEYS ===
API_SECRET_KEY=ujiSsgzg3aFWLZ6nRuLuzseXX1ASwXxVtgWxm7TdFMs=

JWT_SECRET=RdGMLzmmIZ8B72ntWw9OiODOuZd/CsO6sNaT/SrAbpY=

ENCRYPTION_KEY=dhYoxcLQY9uCRsw5iocShnWFGkXtwJczpVobNMsQqgA=

# === WEBSOCKET (TẠM THỜI) ===
NEXT_PUBLIC_WS_URL=http://localhost:3001

WS_PORT=3001

# === PAYMENT SANDBOX (AN TOÀN) ===
VNPAY_TMN_CODE=DEMO
VNPAY_HASH_SECRET=DEMO_SECRET
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=MOMOBKUN20180529
MOMO_ACCESS_KEY=klm05TvNBzhg7h7j
MOMO_SECRET_KEY=at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

ZALOPAY_APP_ID=2553
ZALOPAY_KEY1=PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL
ZALOPAY_KEY2=kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create

# === OTHER ===
NODE_ENV=production

NEXT_PUBLIC_SITE_URL=https://rok-services-xxx.vercel.app
# ⚠️ Thay xxx bằng URL thật

NEXT_TELEMETRY_DISABLED=1
```

**SAU KHI PASTE:**

- Click "Save" cho từng biến
- Vercel sẽ tự động redeploy

### Cách 2: Qua CLI (Nhanh hơn)

```bash
# Copy file env mẫu
cp .env.local .env.production

# Edit với URL thật
nano .env.production
# Sửa NEXTAUTH_URL và NEXT_PUBLIC_SITE_URL

# Push tất cả env lên Vercel
vercel env pull .env.vercel.local

# Hoặc add từng biến:
vercel env add DATABASE_URL production
# Paste value khi được hỏi
```

---

## 4️⃣ VERIFY DEPLOYMENT (2 phút)

### Test Website

```bash
# 1. Mở URL Vercel
https://rok-services-xxx.vercel.app

# 2. Test các trang:
# ✅ Homepage load được
# ✅ /auth/signup - Đăng ký
# ✅ /auth/signin - Đăng nhập
# ✅ /dashboard - Dashboard (sau login)
# ✅ /services - Services page

# 3. Test API:
curl https://rok-services-xxx.vercel.app/api/health
# Should return: {"status":"ok"}
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Code đã push lên GitHub
- [ ] Deploy Vercel thành công
- [ ] Environment variables đã setup
- [ ] Website load được
- [ ] Auth hoạt động (signup/signin)
- [ ] Dashboard accessible
- [ ] API endpoints respond

---

## 🆘 NẾU GẶP LỖI

### Lỗi: "Failed to push to GitHub"

```bash
# Xem hướng dẫn ở Bước 1 ở trên
# Dùng GitHub Token là dễ nhất
```

### Lỗi: "Vercel build failed"

```bash
# Xem logs
vercel logs --build

# Thường do thiếu env vars
# Check lại Bước 3
```

### Lỗi: "Cannot read property of undefined"

```bash
# Thiếu environment variables
# Vào Vercel dashboard → Settings → Environment Variables
# Add các biến còn thiếu
```

### Lỗi: "Database connection failed"

```bash
# Check DATABASE_URL đúng chưa
# Test connection:
npx prisma db pull
```

---

## 📞 CẦN HELP?

**Xem logs:**

```bash
vercel logs
vercel logs --build
```

**Check deployment:**

```bash
vercel ls
```

**Rollback nếu lỗi:**

```bash
vercel rollback
```

---

## 🎉 DONE!

Sau khi hoàn thành 4 bước trên, website của bạn sẽ LIVE tại:

**https://rok-services-xxx.vercel.app**

🎊 Chúc mừng! Website đã production! 🎊

---

## 📝 GHI CHÚ

- All payment gateways đang ở **SANDBOX mode** (an toàn)
- Cần production keys để nhận tiền thật
- Email service chưa config (optional)
- WebSocket server chưa deploy (optional)

**Project hoàn toàn sẵn sàng sử dụng!** ✅
