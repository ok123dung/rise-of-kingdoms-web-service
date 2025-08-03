# 🚂 Railway Database Setup - 1 Phút

## Bước 1: Đăng nhập Railway
1. Vào **https://railway.app**
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway app

## Bước 2: Tạo Database
1. Click **"New Project"**
2. Click **"Provision PostgreSQL"**
3. Đợi 30 giây để database khởi tạo

## Bước 3: Lấy Connection String
1. Click vào **PostgreSQL service** (hình database)
2. Vào tab **"Connect"** 
3. Copy **"Postgres Connection URL"**:
```
postgresql://postgres:password@hostname:port/railway
```

## Bước 4: Test Connection
- URL sẽ có dạng: `postgresql://postgres:generated-password@containers-us-west-xxx.railway.app:7431/railway`
- Tự động có SSL và production-ready

## Ưu điểm Railway:
✅ **Instant setup** - Không cần config  
✅ **Auto-backups** - Tự động backup hàng ngày  
✅ **Monitoring** - Dashboard theo dõi performance  
✅ **500MB free** - Đủ cho website production  
✅ **PostgreSQL 15** - Version mới nhất  

---
**Thời gian**: 1 phút | **Chi phí**: Miễn phí | **Uptime**: 99.9%