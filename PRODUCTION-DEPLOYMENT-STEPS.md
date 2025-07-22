# 🚀 RoK Services - Production Deployment Guide

## ✅ Current Status
- ✅ Code fixes complete - All TypeScript errors resolved
- ✅ GitHub push complete - Latest code deployed
- 🔄 Vercel auto-deployment in progress
- ⏳ Need to setup production database
- ⏳ Need to configure environment variables

## 🗄️ Step 1: Setup Production Database (Supabase)

### Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization: `ok123dung` or create new
4. Project name: `rok-services-production` 
5. Database password: Generate strong password (save it!)
6. Region: Southeast Asia (Singapore) - closest to Vietnam users
7. Click "Create new project"

### Get Database Connection
1. Go to Settings > Database
2. Copy "Connection string" 
3. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Alternative: Use Vercel Postgres (Recommended)
```bash
# In Vercel dashboard:
1. Go to your project
2. Storage tab
3. Create Database > Postgres
4. Database name: rok-services-db
5. Region: Singapore (sin1)
```

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