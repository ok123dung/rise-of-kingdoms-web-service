# Quick Fix: Update DATABASE_URL on Vercel

## Automatic Method (Recommended)

Sử dụng Vercel CLI để update environment variable:

```bash
# Set DATABASE_URL with SSL mode
vercel env add DATABASE_URL production
# When prompted, paste this value:
# postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require

# Then redeploy
vercel --prod
```

## Manual Method (Via Dashboard)

1. **Mở Vercel Dashboard**
   - URL: https://vercel.com/dungs-projects-d4060553/rok-services/settings/environment-variables
   - (Bạn đang mở trang này rồi ✅)

2. **Tìm DATABASE_URL**
   - Scroll xuống tìm biến `DATABASE_URL`

3. **Click Edit (icon bút chì)**

4. **Update giá trị**

   Giá trị hiện tại (có thể):

   ```
   postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

   **Thêm vào cuối**: `&sslmode=require`

   Giá trị mới:

   ```
   postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```

5. **Click Save**

6. **Chọn Environment**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

7. **Redeploy**

   Sau khi save, có 2 cách:

   **Cách 1**: Click "Redeploy" ngay trên Vercel Dashboard
   - Go to: Deployments tab
   - Click latest deployment
   - Click "Redeploy" button

   **Cách 2**: Dùng command line

   ```bash
   cd c:\Users\admin\.gemini\antigravity\playground\silver-sojourner\rok-services
   vercel --prod
   ```

## Verify Sau Khi Deploy

1. **Test Signup**

   ```
   https://rok-services-ovc9o5fd1-dungs-projects-d4060553.vercel.app/auth/signup
   ```

   Tạo account mới - should work without 503 ✅

2. **Check Health** (optional)
   ```bash
   curl https://rok-services-ovc9o5fd1-dungs-projects-d4060553.vercel.app/api/debug-db
   ```

## ⚡ Fastest Way

Nếu muốn nhanh nhất, chỉ cần:

1. Copy exact value này:

   ```
   postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
   ```

2. Paste vào DATABASE_URL trên Vercel Dashboard (đang mở)

3. Save

4. Redeploy

Done! 🎉
