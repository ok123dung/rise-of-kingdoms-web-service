# 🚀 Cloudflare Pages Deployment Guide

## Domain Ready: rokdbot.com ✅

### Step 1: Access Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com
2. Login with your Cloudflare account
3. Navigate to **Pages** in the left sidebar

### Step 2: Create New Project
1. Click **"Create a project"**
2. Choose **"Connect to Git"**
3. Select **GitHub** as source
4. Authorize Cloudflare to access your GitHub

### Step 3: Select Repository
1. Find and select: **`ok123dung/rok-services`**
2. Click **"Begin setup"**

### Step 4: Build Configuration
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (leave empty)
```

### Step 5: Environment Variables
Add these in Cloudflare Pages settings:
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn01*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
NEXTAUTH_URL=https://rokdbot.com
NEXTAUTH_SECRET=rok_services_cloudflare_super_secure_secret_2025_min_32_chars
```

### Step 6: Custom Domain
1. In Pages project → **Custom domains**
2. Add custom domain: **`rokdbot.com`**
3. DNS will auto-configure (domain already in Cloudflare)

### Step 7: Deploy
1. Click **"Save and Deploy"**
2. First build will start automatically
3. Website will be live at: **https://rokdbot.com**

---

## Next.js Compatibility
- ✅ Static export ready
- ✅ API routes supported
- ✅ Prisma database connected
- ✅ Environment variables configured

## Build Command Details
```bash
npm install
npm run build  # Includes: prisma generate && next build
```

---
**Ready for deployment!** 🚀