# ▲ Vercel Deployment - 5 Phút

## Bước 1: Đăng nhập Vercel
1. Vào **https://vercel.com**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel app

## Bước 2: Import Project
1. Click **"Add New..." → "Project"**
2. Tìm repository **"rok-services"**
3. Click **"Import"**

## Bước 3: Configure Project
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build (auto-detected)
Output Directory: .next (auto-detected)
Install Command: npm install (auto-detected)
```

## Bước 4: Environment Variables
Click **"Environment Variables"** và thêm:
```
DATABASE_URL=<railway-connection-string>
NEXTAUTH_URL=https://rok-services.vercel.app
NEXTAUTH_SECRET=super-secret-production-key-min-32-chars-2025
NODE_ENV=production
```

## Bước 5: Deploy
1. Click **"Deploy"**
2. Đợi 2-3 phút build
3. Website live tại: **https://rok-services.vercel.app**

## Bước 6: Custom Domain
1. Vào **Settings** → **Domains**
2. Add **"rokdbot.com"**
3. Vercel sẽ cung cấp DNS records
4. Update DNS tại Cloudflare:
   ```
   CNAME rokdbot.com cname.vercel-dns.com
   ```

## Auto-Deployment
✅ **Mỗi git push** → Tự động deploy  
✅ **Preview deployments** cho feature branches  
✅ **Rollback** dễ dàng  
✅ **Analytics** và monitoring built-in  

---
**Kết quả**: https://rokdbot.com hoạt động hoàn hảo! 🚀