# 🚀 FINAL DEPLOYMENT CHECKLIST - ROK SERVICES

## Phase 1: Railway Database (3 phút) 🗄️

### Bước 1: Tạo Railway Database
```bash
1. Vào https://railway.app
2. Click "Login" → "Login with GitHub"  
3. Click "New Project"
4. Click "Provision PostgreSQL"
5. Đợi 30 giây khởi tạo
```

### Bước 2: Lấy Connection String
```bash
1. Click vào PostgreSQL service
2. Tab "Connect" 
3. Copy "Postgres Connection URL"
4. Dạng: postgresql://postgres:xxx@containers-us-west-xxx.railway.app:xxxx/railway
```

### Bước 3: Update Environment
```bash
# Cập nhật file .env
DATABASE_URL="<railway-connection-string>"
```

---

## Phase 2: Vercel Deployment (5 phút) ▲

### Bước 1: Import Project
```bash
1. Vào https://vercel.com
2. "Continue with GitHub"
3. "Add New..." → "Project"
4. Import "rok-services"
```

### Bước 2: Environment Variables
```env
DATABASE_URL=postgresql://postgres:xxx@containers-us-west-xxx.railway.app:xxxx/railway
NEXTAUTH_URL=https://rok-services.vercel.app
NEXTAUTH_SECRET=rok-services-super-secure-production-secret-2025-railway
NODE_ENV=production
```

### Bước 3: Deploy
```bash
1. Click "Deploy"
2. Build time: ~3 phút
3. Live URL: https://rok-services.vercel.app
```

---

## Phase 3: Custom Domain (5 phút) 🌐

### Bước 1: Add Domain in Vercel
```bash
1. Project Settings → Domains
2. Add "rokdbot.com"
3. Copy DNS records
```

### Bước 2: Update Cloudflare DNS
```bash
1. Cloudflare Dashboard → rokdbot.com → DNS
2. Add record:
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
```

---

## Phase 4: Database Migration (2 phút) 🔄

### Migrate Schema
```bash
# Local terminal
export DATABASE_URL="<railway-connection-string>"
npx prisma db push
npx prisma generate
```

---

## 🎯 EXPECTED RESULTS

### URLs
- ✅ **Production**: https://rokdbot.com
- ✅ **Admin**: https://rokdbot.com/admin
- ✅ **Dashboard**: https://rokdbot.com/dashboard
- ✅ **API Health**: https://rokdbot.com/api/health

### Features Live
- 🔐 Authentication (NextAuth + Discord)
- 💳 Payment gateways (MoMo, VNPay, ZaloPay)
- 📊 Admin dashboard
- 👥 Customer portal
- 🎮 ROK service catalog
- 📱 Mobile responsive
- ⚡ Edge deployment globally

### Revenue Target
- **Conservative**: 15.6M VNĐ/month
- **Optimistic**: 30M VNĐ/month

---

## 🚀 LAUNCH SEQUENCE

**Total Time**: 15 phút  
**Cost**: $0 (Free tiers)  
**Uptime**: 99.9%  
**Performance**: Global CDN  

**Ready to dominate Rise of Kingdoms market! 👑**

---

*Prepared by Claude Code - Your AI Development Partner*