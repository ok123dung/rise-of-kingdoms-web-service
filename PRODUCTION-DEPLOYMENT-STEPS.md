# 🚀 TRIỂN KHAI PRODUCTION - BƯỚC CUỐI CÙNG

## 📋 Checklist Hoàn Thành

### ✅ Phase 1: Setup Database (3 phút)
1. **Railway.app**:
   - Vào https://railway.app
   - Login with GitHub
   - New Project → Provision PostgreSQL
   - Copy connection string
   
2. **Update Environment**:
   - Copy Railway URL
   - Update `.env` file
   - Test connection: `npx prisma db push`

### ✅ Phase 2: Deploy Vercel (5 phút)
1. **Vercel.com**:
   - Login with GitHub
   - Import `ok123dung/rok-services`
   - Add environment variables
   - Deploy

2. **Environment Variables**:
   ```
   DATABASE_URL=<railway-url>
   NEXTAUTH_URL=https://rok-services.vercel.app
   NEXTAUTH_SECRET=rok-services-super-secure-production-secret-2025
   NODE_ENV=production
   ```

### ✅ Phase 3: Custom Domain (5 phút)
1. **Vercel Settings**:
   - Add domain: rokdbot.com
   - Get DNS records

2. **Cloudflare DNS**:
   - Add CNAME: rokdbot.com → cname.vercel-dns.com

## 🔐 Step 2: Configure Environment Variables

### Required Environment Variables for Production:
```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://rok-services.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-app-client-id"
DISCORD_CLIENT_SECRET="your-discord-app-client-secret"

# Email Service (Resend)
RESEND_API_KEY="re_your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Payment Gateways (Optional for initial launch)
MOMO_PARTNER_CODE="your-momo-partner-code"
MOMO_ACCESS_KEY="your-momo-access-key" 
MOMO_SECRET_KEY="your-momo-secret-key"

VNPAY_TMN_CODE="your-vnpay-merchant-code"
VNPAY_HASH_SECRET="your-vnpay-hash-secret"

ZALOPAY_APP_ID="your-zalopay-app-id"
ZALOPAY_KEY1="your-zalopay-key1"
ZALOPAY_KEY2="your-zalopay-key2"

# Monitoring (Optional)
DISCORD_WEBHOOK_URL="your-discord-webhook-for-alerts"
```

### Add to Vercel:
```bash
1. Go to Vercel dashboard
2. Your project > Settings > Environment Variables
3. Add each variable above
4. Deploy > Redeploy to apply changes
```

## 📊 Step 3: Deploy Database Schema

Once you have DATABASE_URL configured:

```bash
# This will run automatically on first deployment
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

## 🎯 Expected Deployment URL
**Production URL**: https://rok-services.vercel.app

## 🧪 Step 4: Test Production Deployment

### Key Features to Test:
1. ✅ Homepage loads correctly
2. ✅ Service catalog displays
3. ✅ Discord OAuth login works
4. ✅ Admin dashboard accessible
5. ✅ Customer portal functional
6. ✅ Payment gateway integration
7. ✅ Email notifications working

### Admin Access:
- Create Discord OAuth app for production domain
- First user to register becomes admin (check database)
- Or manually set role in database

## 🎊 Success Metrics
- Build time: < 60 seconds
- First paint: < 2 seconds  
- Database response: < 100ms
- Zero build errors
- All core features working

---
*Setup by Claude Code - Production Ready ROK Services Platform*