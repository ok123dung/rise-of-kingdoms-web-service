# 🗄️ Database Setup Instructions

**Status**: Security secrets ✅ Generated | Database ❌ Not configured

---

## ⚠️ NEXT STEP: Setup Database

Bạn cần setup PostgreSQL database để dự án hoạt động đầy đủ. Hiện tại có **3 options**:

---

## 🌟 Option A: Supabase (KHUYẾN NGHỊ)

**Ưu điểm:**
- ✅ Miễn phí tier (500MB database)
- ✅ Không cần install gì
- ✅ Setup 5 phút
- ✅ Có UI để quản lý
- ✅ Backup tự động

### Bước 1: Tạo Supabase Account (2 phút)

1. Truy cập: https://supabase.com
2. Click **"Start your project"**
3. Sign up với GitHub (hoặc email)
4. Verify email nếu cần

### Bước 2: Tạo Project (2 phút)

1. Click **"New Project"**
2. Điền thông tin:
   ```
   Name: rok-services
   Database Password: [TẠO PASSWORD MẠNH - LƯU LẠI!]
   Region: Southeast Asia (Singapore)
   ```
3. Click **"Create new project"**
4. Đợi 2-3 phút database khởi tạo

### Bước 3: Lấy Connection Strings (1 phút)

1. Vào project vừa tạo
2. Click **Settings** (icon bánh răng) → **Database**
3. Scroll xuống **"Connection string"**
4. Switch tab sang **"URI"**
5. Copy 2 connection strings:

**Connection pooling** (cho DATABASE_URL):
```
postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Session mode** (cho DIRECT_URL):
```
postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

⚠️ **Lưu ý:** Thay `[YOUR-PASSWORD]` bằng password bạn tạo ở bước 2!

### Bước 4: Update .env.local

Mở file `.env.local` và update 2 dòng:

```bash
# Thay dòng này:
DATABASE_URL=postgresql://user:password@localhost:5432/rokservices?pgbouncer=true
DIRECT_URL=postgresql://user:password@localhost:5432/rokservices

# Bằng connection strings từ Supabase:
DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Bước 5: Chạy Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (tạo tables)
npx prisma migrate dev
# Khi hỏi migration name, gõ: "init"

# (Optional) Seed sample data
npx tsx prisma/seed.ts
```

### Bước 6: Verify

```bash
# Mở Prisma Studio để xem database
npx prisma studio
# Truy cập: http://localhost:5555

# Hoặc xem trong Supabase dashboard:
# Table Editor → Xem các tables đã tạo
```

✅ **DONE!** Database đã sẵn sàng!

---

## 🔷 Option B: Neon (Alternative)

**Tương tự Supabase, serverless PostgreSQL**

### Quick Steps:

1. Truy cập: https://neon.tech
2. Sign up với GitHub
3. Create project: `rok-services`
4. Copy connection string
5. Add vào `.env.local`
6. Run migrations như trên

---

## 💻 Option C: Local PostgreSQL

**Cho developers muốn run local**

### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb rokservices

# Update .env.local:
DATABASE_URL=postgresql://localhost:5432/rokservices
DIRECT_URL=postgresql://localhost:5432/rokservices
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb rokservices

# Update .env.local với local URLs
```

### Windows:
1. Download từ: https://www.postgresql.org/download/windows/
2. Install với default settings
3. Tạo database `rokservices` qua pgAdmin
4. Update .env.local

---

## 🧪 Verification Checklist

Sau khi setup xong, verify:

- [ ] `.env.local` có DATABASE_URL và DIRECT_URL đúng
- [ ] `npx prisma generate` chạy không lỗi
- [ ] `npx prisma migrate dev` tạo tables thành công
- [ ] `npx prisma studio` mở được (http://localhost:5555)
- [ ] Thấy 15 tables trong database:
  - users
  - services
  - service_tiers
  - bookings
  - payments
  - communications
  - leads
  - staff
  - accounts
  - sessions
  - verification_tokens
  - system_logs
  - security_logs
  - audit_logs
  - service_tasks

---

## 🚀 Next Steps

Sau khi database ready:

1. **Start Dev Server:**
   ```bash
   npm run dev
   # Mở http://localhost:3000
   ```

2. **Test API:**
   ```bash
   # Health check (should show DB connected)
   curl http://localhost:3000/api/health

   # Services list
   curl http://localhost:3000/api/services
   ```

3. **Create Admin User:**
   ```bash
   # Via Prisma Studio hoặc signup UI
   # Sau đó update role = 'admin' trong database
   ```

---

## ❓ Troubleshooting

### Lỗi: "Can't reach database server"
```bash
# Kiểm tra connection string đúng chưa
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Lỗi: "Authentication failed"
- Check password trong connection string
- Đảm bảo không có ký tự đặc biệt chưa encode
- URL encode password nếu cần: https://www.urlencoder.org/

### Lỗi: Migration failed
```bash
# Reset và try lại
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📞 Support

Nếu gặp vấn đề:
1. Check [Supabase Docs](https://supabase.com/docs)
2. Check [Prisma Docs](https://www.prisma.io/docs)
3. Hoặc hỏi tôi!

---

**⏭️ AFTER YOU COMPLETE DATABASE SETUP:**

Run this command để tôi verify:
```bash
npx prisma migrate status
```

Hoặc simply let me know và tôi sẽ continue với next steps! 🚀
