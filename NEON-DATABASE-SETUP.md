# 🐘 Tạo Database mới với Neon.tech

## Tại sao chọn Neon?
- ✅ **Miễn phí** - 3GB storage, 1 million queries/month
- ✅ **Nhanh** - Setup 2 phút
- ✅ **Serverless** - Auto-sleep khi không dùng
- ✅ **PostgreSQL** - Tương thích 100% với Prisma

## Bước 1: Tạo Neon Account
1. Vào: **https://neon.tech**
2. Click **"Sign up"** → Chọn **GitHub** để đăng nhập nhanh
3. Verify email nếu cần

## Bước 2: Tạo Database Project
1. Click **"Create a project"**
2. Điền thông tin:
   - **Project name**: `rok-services-production`
   - **Database name**: `rokservices` (mặc định)
   - **Region**: **Singapore** (gần Việt Nam nhất)
3. Click **"Create project"**

## Bước 3: Lấy Connection String
1. Trong dashboard, vào **Connection Details**
2. Chọn **Pooled connection** 
3. Copy **Connection string**:
```
postgresql://[username]:[password]@[hostname]/[database]?sslmode=require
```

## Bước 4: Cập nhật .env
Thay thế DATABASE_URL cũ:
```env
DATABASE_URL="postgresql://[username]:[password]@[hostname]/[database]?sslmode=require"
```

## Bước 5: Test Connection
```bash
npx prisma db push
```

**Ưu điểm Neon vs Supabase**:
- Setup đơn giản hơn
- Không cần configuration phức tạp
- Connection string luôn hoạt động
- Free tier hào phóng hơn

---
**Thời gian**: 5 phút | **Chi phí**: Miễn phí