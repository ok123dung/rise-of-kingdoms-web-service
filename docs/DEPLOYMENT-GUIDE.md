# Deployment Guide

**Project:** ROK Services
**Last Updated:** 2025-12-03

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Deploy (15 minutes)](#2-quick-deploy)
3. [Detailed Deployment Steps](#3-detailed-deployment-steps)
4. [Environment Variables](#4-environment-variables)
5. [Database Setup](#5-database-setup)
6. [Payment Gateway Configuration](#6-payment-gateway-configuration)
7. [WebSocket Server](#7-websocket-server)
8. [Custom Domain Setup](#8-custom-domain-setup)
9. [Monitoring & Analytics](#9-monitoring--analytics)
10. [Troubleshooting](#10-troubleshooting)
11. [Post-Deployment Checklist](#11-post-deployment-checklist)

---

## 1. Prerequisites

### Required Accounts
- **Vercel** - https://vercel.com (free tier available)
- **Supabase** - https://supabase.com (free tier: 500MB database)
- **GitHub** - For repository hosting

### Optional Services
- **Cloudflare** - CDN and DDoS protection
- **Resend** - Transactional email (100 free emails/day)
- **Sentry** - Error monitoring (free tier available)
- **Discord** - OAuth and notifications

### Local Requirements
- Node.js 20.x LTS
- npm or yarn
- Git

---

## 2. Quick Deploy

**Total Time:** ~15 minutes

### Step 1: Install Vercel CLI and Login

```bash
npm i -g vercel
vercel login
```

### Step 2: Deploy to Vercel

```bash
cd /path/to/rok-services
vercel --prod
```

Answer prompts:
- Set up and deploy? **YES**
- Which scope? **Your account**
- Link to existing project? **NO**
- Project name? **rok-services**
- Override settings? **NO**

### Step 3: Configure Environment Variables

Go to Vercel Dashboard > Project > Settings > Environment Variables

Add these required variables:

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production
```

### Step 4: Verify Deployment

```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status":"ok"}
```

---

## 3. Detailed Deployment Steps

### 3.1 Database Setup (Supabase)

1. Create Supabase account at https://supabase.com
2. Create new project: `rok-services`
3. Wait for database initialization (2-3 minutes)
4. Get connection strings from Settings > Database > Connection string

**Connection Strings:**
```bash
# Transaction pooler (for serverless)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### 3.2 Deploy Database Schema

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts  # Optional: seed data
```

**Verify database:**
```bash
npx prisma db pull  # Should complete without errors
npx prisma studio   # Open browser to view tables
```

### 3.3 Vercel Deployment

**Option A: Via CLI (Recommended)**
```bash
vercel --prod
```

**Option B: Via GitHub Integration**
1. Push code to GitHub
2. Vercel Dashboard > New Project > Import from GitHub
3. Configure environment variables > Deploy

### 3.4 Domain Configuration

**Vercel Dashboard:** Project Settings > Domains > Add domain

**Cloudflare DNS:**
```
Type: CNAME  Name: @    Target: cname.vercel-dns.com
Type: CNAME  Name: www  Target: cname.vercel-dns.com
```

**SSL (Cloudflare):** Full (strict), Always HTTPS, HSTS enabled, TLS 1.2+

---

## 4. Environment Variables

### 4.1 Required Variables

```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://rokdbot.com
NEXTAUTH_SECRET=<32+ character secret>
API_SECRET_KEY=<openssl rand -base64 32>
JWT_SECRET=<openssl rand -base64 32>
ENCRYPTION_KEY=<openssl rand -base64 32>
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://rokdbot.com
```

### 4.2 Payment Gateway Variables

```bash
# VNPay
VNPAY_TMN_CODE=<your_code>
VNPAY_HASH_SECRET=<your_secret>
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html

# MoMo
MOMO_PARTNER_CODE=<your_code>
MOMO_ACCESS_KEY=<your_key>
MOMO_SECRET_KEY=<your_secret>
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create

# ZaloPay
ZALOPAY_APP_ID=<your_app_id>
ZALOPAY_KEY1=<your_key1>
ZALOPAY_KEY2=<your_key2>
ZALOPAY_ENDPOINT=https://openapi.zalopay.vn/v2/create
```

### 4.3 Optional Service Variables

```bash
RESEND_API_KEY=re_xxxxx
DISCORD_CLIENT_ID=<id>
DISCORD_CLIENT_SECRET=<secret>
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 5. Database Setup

```bash
npx prisma generate          # Generate client
npx prisma migrate deploy    # Apply migrations
npx prisma db pull           # Verify connection
npx prisma studio            # View data
```

**Create Admin:** Sign up via UI, then add staff record with role 'admin' via Prisma Studio.

---

## 6. Payment Gateway Configuration

| Gateway | Register | Callback URL |
|---------|----------|--------------|
| VNPay | https://vnpay.vn | `/api/webhooks/vnpay` |
| MoMo | https://business.momo.vn | `/api/webhooks/momo` |
| ZaloPay | https://zalopay.vn/business | `/api/webhooks/zalopay` |

**Test with sandbox credentials first, then switch to production.**

---

## 7. WebSocket Server

**Development:** `npm run dev:all` (starts on :3001)

**Production (Railway):**
1. Deploy to Railway from GitHub
2. Set `WS_PORT=3001`, `DATABASE_URL`, `JWT_SECRET`
3. Update `NEXT_PUBLIC_WS_URL=wss://your-app.railway.app`

---

## 8. Custom Domain Setup

1. Add domain in Vercel Dashboard
2. Configure Cloudflare DNS (CNAME to vercel-dns.com)
3. Enable SSL Full (strict), HSTS
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`

---

## 9. Monitoring & Analytics

| Service | Purpose | Setup |
|---------|---------|-------|
| Sentry | Error tracking | Add `SENTRY_DSN` |
| GA4 | Analytics | Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Uptime | Health check | Monitor `/api/health` |

---

## 10. Troubleshooting

```bash
vercel logs --build          # Build failures
npx prisma db pull           # Database issues
vercel env ls                # Check env vars
vercel rollback              # Rollback deployment
```

**Common Issues:**
- Missing env vars in Vercel
- NEXTAUTH_URL mismatch with domain
- DATABASE_URL format or SSL issues

---

## 11. Post-Deployment Checklist

- [ ] `/api/health` returns OK
- [ ] User signup/login works
- [ ] Dashboard accessible
- [ ] Payment sandbox flow works
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Monitoring active

---

## Cost Estimates

| Scale | Monthly Cost |
|-------|--------------|
| Free tier (MVP) | $0 |
| Production (50+ users) | ~$55 |
| Business (200+ users) | ~$180 |

---

## Quick Reference

```bash
vercel --prod                # Deploy
vercel logs --follow         # View logs
vercel rollback              # Rollback
vercel env add NAME production  # Add env var
npx prisma migrate deploy    # Run migrations
curl https://rokdbot.com/api/health  # Test health
```
