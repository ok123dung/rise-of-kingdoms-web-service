# 🚀 THAY THẾ: Sử dụng Railway Database (1 phút)

Nếu không muốn đăng ký Neon, có thể dùng **Railway** - cũng miễn phí:

## Railway.app - Siêu nhanh
1. Vào: **https://railway.app**
2. **Login with GitHub**
3. **New Project** → **Provision PostgreSQL**
4. Vào **PostgreSQL** → **Connect** → **Public URL**
5. Copy connection string

## Hoặc ElephantSQL - Lâu đời nhất
1. Vào: **https://www.elephantsql.com**
2. **Get a managed database today** → **Try now for FREE**
3. **Create New Instance**
4. Plan: **Tiny Turtle (Free)**
5. Name: `rok-services`
6. Region: **Singapore**
7. Copy **URL** từ dashboard

## Hoặc Aiven - Enterprise grade
1. Vào: **https://aiven.io**
2. **Start free trial**
3. **Create service** → **PostgreSQL**
4. Plan: **Hobbyist (Free)**
5. Cloud: **Google Singapore**

---

**TẤT CẢ ĐỀU MIỄN PHÍ** và có connection string ngay lập tức!

Chọn dịch vụ nào cũng được, chỉ cần:
1. Tạo PostgreSQL database
2. Lấy connection string
3. Cập nhật DATABASE_URL
4. Chạy `npx prisma db push`