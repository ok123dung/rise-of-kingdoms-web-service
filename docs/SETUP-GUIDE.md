# 🚀 Setup Guide - Rise of Kingdoms Services

Hướng dẫn setup chi tiết từ đầu cho dự án rok-services.

## 📋 Tổng Quan

**Thời gian setup**: ~1.5 giờ **Độ khó**: Trung bình **Chi phí**: Miễn phí để bắt đầu

---

## ✅ Bước 1: Chuẩn Bị Môi Trường (10 phút)

### Yêu Cầu Hệ Thống

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ Git ([Download](https://git-scm.com/))
- ✅ Code editor (VS Code khuyến nghị)

### Kiểm Tra Cài Đặt

```bash
node --version  # Phải >= 18.0.0
npm --version   # Phải >= 8.0.0
git --version   # Phải có
```

---

## 📦 Bước 2: Clone & Install (15 phút)

### 2.1 Clone Repository

```bash
cd /path/to/your/projects
git clone <your-repo-url> rok-services
cd rok-services
```

### 2.2 Install Dependencies

```bash
npm install
# Đợi khoảng 2-3 phút để cài đặt tất cả packages
```

### 2.3 Verify Installation

```bash
# Kiểm tra TypeScript
npm run type-check
# Nếu không có lỗi, bạn đã cài đặt thành công!
```

---

## 🗄️ Bước 3: Setup Database (20 phút)

### Option A: Supabase (Khuyến nghị - Miễn phí)

#### 3.1 Tạo Supabase Project

1. Truy cập [https://supabase.com](https://supabase.com)
2. Sign up với GitHub
3. Click **New Project**
4. Điền thông tin:
   - **Name**: `rok-services`
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: `Southeast Asia (Singapore)`
5. Click **Create new project** (đợi 2-3 phút)

#### 3.2 Lấy Connection Strings

1. Vào **Settings** → **Database**
2. Scroll xuống **Connection string**
3. Copy 2 connection strings:

**Pooling Connection** (cho DATABASE_URL):

```
postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Direct Connection** (cho DIRECT_URL):

```
postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Option B: Neon (Alternative - Cũng miễn phí)

1. Truy cập [https://neon.tech](https://neon.tech)
2. Sign up và tạo project mới
3. Copy connection strings từ dashboard

### Option C: Local PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# Windows: Download từ postgresql.org
```

---

## 🔐 Bước 4: Configure Environment (15 phút)

### 4.1 Tạo .env.local

```bash
cp .env.example .env.local
```

### 4.2 Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
# Copy output và paste vào .env.local

# Generate API_SECRET_KEY
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32
```

### 4.3 Cấu Hình .env.local

Mở file `.env.local` và điền các giá trị:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="RoK Services - Dịch vụ Rise of Kingdoms chuyên nghiệp"

# Database - ĐIỀN DATABASE URLS CỦA BẠN
DATABASE_URL=postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.[ref]:[password]@...pooler.supabase.com:5432/postgres

# Authentication - ĐIỀN SECRETS ĐÃ GENERATE
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-secret-here>

# Security - ĐIỀN SECRETS ĐÃ GENERATE
API_SECRET_KEY=<paste-secret-here>
JWT_SECRET=<paste-secret-here>
ENCRYPTION_KEY=<paste-secret-here>

# Feature Flags
NEXT_PUBLIC_ENABLE_BOOKING_FORM=true
NEXT_PUBLIC_ENABLE_PAYMENT_INTEGRATION=false  # Set false for dev
NEXT_PUBLIC_MAINTENANCE_MODE=false

# Optional: Để trống cho development
REDIS_URL=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
MOMO_PARTNER_CODE=
ZALOPAY_APP_ID=
VNPAY_TMN_CODE=
RESEND_API_KEY=
SENTRY_DSN=
```

---

## 🔨 Bước 5: Setup Database Schema (15 phút)

### 5.1 Generate Prisma Client

```bash
npx prisma generate
# Tạo Prisma Client để interact với database
```

### 5.2 Run Database Migrations

```bash
npx prisma migrate dev
# Tạo tất cả tables trong database
# Khi hỏi migration name, nhập: "init"
```

### 5.3 Seed Initial Data (Optional)

```bash
npx tsx prisma/seed.ts
# Tạo dữ liệu mẫu: services, users, etc.
```

### 5.4 Verify Database

```bash
npx prisma studio
# Mở Prisma Studio để xem database
# Truy cập http://localhost:5555
```

---

## 🚀 Bước 6: Start Development Server (5 phút)

### 6.1 Start Server

```bash
npm run dev
```

### 6.2 Verify Application

Mở browser và truy cập:

- **Homepage**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **Services**: http://localhost:3000/services

### 6.3 Test Features

1. ✅ Homepage loads correctly
2. ✅ Services page shows 8 services
3. ✅ API health check returns `{"status":"healthy"}`

---

## 🔍 Bước 7: Verify Setup (10 phút)

### 7.1 Run Tests

```bash
# TypeScript check
npm run type-check
# Should pass with no errors

# Lint check (có thể có warnings, OK)
npm run lint

# Format check
npm run format:check
```

### 7.2 Test Database Connection

```bash
# Mở Prisma Studio
npx prisma studio

# Kiểm tra:
# - Tables đã được tạo
# - Seed data có trong database (nếu đã chạy seed)
```

### 7.3 Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Services list
curl http://localhost:3000/api/services

# Database check
curl http://localhost:3000/api/health/db
```

---

## ✅ Checklist Hoàn Thành

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Database created (Supabase/Neon/Local)
- [ ] `.env.local` created and configured
- [ ] Secrets generated and added
- [ ] Database migrations ran successfully
- [ ] Prisma Client generated
- [ ] Dev server starts without errors
- [ ] Homepage accessible at localhost:3000
- [ ] API health check returns healthy
- [ ] Prisma Studio opens successfully

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to database"

```bash
# Kiểm tra DATABASE_URL đúng format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Lỗi: "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Port 3000 already in use"

```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Lỗi: Prisma migrations fail

```bash
# Reset database (XÓA TẤT CẢ DỮ LIỆU!)
npx prisma migrate reset

# Hoặc push schema trực tiếp
npx prisma db push
```

---

## 🎯 Next Steps

Sau khi setup xong, bạn có thể:

1. **Tạo Admin Account**

   ```bash
   # Chạy signup qua UI hoặc tạo user trực tiếp trong database
   ```

2. **Customize Services**
   - Edit `src/data/services.ts`
   - Update pricing, features, etc.

3. **Setup Payment Gateways** (Production)
   - Đăng ký MoMo/ZaloPay/VNPay
   - Add credentials vào `.env.local`

4. **Enable Analytics**
   - Tạo Google Analytics property
   - Add GA_MEASUREMENT_ID

5. **Deploy to Production**
   - Xem `DEPLOYMENT-GUIDE.md`

---

## 📚 Documentation

- [README.md](README.md) - Project overview
- [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) - Production deployment
- [SECURITY.md](SECURITY.md) - Security best practices
- [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md) - Environment variables guide

---

## 💡 Tips

### Development Workflow

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Prisma Studio (database GUI)
npx prisma studio

# Terminal 3: Watch logs/run commands
npm run type-check
```

### Recommended VS Code Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit with good messages
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 🆘 Getting Help

- **Issues**: [GitHub Issues](your-repo/issues)
- **Documentation**: Check `docs/` folder
- **Community**: Discord server (if available)

---

**🎉 Chúc mừng! Bạn đã setup thành công dự án rok-services!**

Next: Xem [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) để deploy lên production.
