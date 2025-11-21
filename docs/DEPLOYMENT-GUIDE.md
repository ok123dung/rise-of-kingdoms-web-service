# 🚀 COMPLETE DEPLOYMENT GUIDE

## Rise of Kingdoms Services - rokdbot.com

### 🎯 DEPLOYMENT SEQUENCE

**Total Time:** ~2 hours **Difficulty:** Intermediate **Cost:** Free to start, ~$30/month at scale

---

## PHASE 1: DATABASE SETUP (30 minutes)

### Step 1: Create Supabase Database

```bash
# 1. Go to https://supabase.com
# 2. Create account với GitHub
# 3. Create new project: "rokdbot-services"
# 4. Wait for database initialization (2-3 minutes)
```

### Step 2: Configure Database Connection

```bash
# Get connection string from Supabase dashboard:
# Settings → Database → Connection string → URI

# Example connection string:
DATABASE_URL="postgresql://postgres.abc123:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### Step 3: Deploy Database Schema

```bash
# Clone/navigate to project directory
cd /path/to/rokdbot-project

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy migrations to production database
npx prisma migrate deploy

# Seed initial data
npx tsx prisma/seed.ts
```

**Verification:**

```bash
# Test database connection
npx prisma db pull
# Should complete without errors

# Check tables created
npx prisma studio
# Open browser at http://localhost:5555
```

---

## PHASE 2: VERCEL DEPLOYMENT (45 minutes)

### Step 1: Prepare Project for Deployment

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project to Vercel (run in project root)
vercel link
```

### Step 2: Configure Environment Variables

```bash
# In Vercel dashboard or via CLI:
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Add each environment variable from .env.production.example
```

**Required Environment Variables:**

```bash
DATABASE_URL="postgresql://..." # From Supabase
NEXTAUTH_URL="https://rokdbot.com"
NEXTAUTH_SECRET="your-32-char-secret"
NEXT_PUBLIC_SITE_URL="https://rokdbot.com"
NODE_ENV="production"
```

### Step 3: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or use the deployment script
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Step 4: Configure Custom Domain

```bash
# In Vercel dashboard:
# 1. Go to project settings
# 2. Domains tab
# 3. Add rokdbot.com
# 4. Add www.rokdbot.com (optional)
```

**DNS Configuration (Cloudflare):**

```
Type: CNAME
Name: @ (or rokdbot.com)
Value: cname.vercel-dns.com
TTL: Auto

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

---

## PHASE 3: DOMAIN & SSL SETUP (15 minutes)

### Step 1: Configure DNS

**In Cloudflare Dashboard:**

```bash
# A Records (if not using CNAME)
Type: A
Name: @
IPv4: 76.76.19.19 # Vercel IP
TTL: Auto

Type: A
Name: @
IPv4: 76.76.21.21 # Vercel IP (secondary)
TTL: Auto

# CNAME (recommended)
Type: CNAME
Name: @
Target: cname.vercel-dns.com
TTL: Auto
```

### Step 2: Enable SSL/Security Features

**Cloudflare Settings:**

```bash
# SSL/TLS → Overview
SSL/TLS Encryption Mode: Full (strict)

# SSL/TLS → Edge Certificates
Always Use HTTPS: On
HTTP Strict Transport Security (HSTS): Enable
Minimum TLS Version: 1.2

# Speed → Optimization
Auto Minify: CSS, JavaScript, HTML
Brotli: On
```

---

## PHASE 4: PAYMENT GATEWAYS (30 minutes)

### Step 1: MoMo Integration

```bash
# 1. Register at https://business.momo.vn
# 2. Submit business documents
# 3. Get partner code, access key, secret key
# 4. Add to Vercel environment variables
```

### Step 2: ZaloPay Integration

```bash
# 1. Register at https://zalopay.vn/business
# 2. Complete KYC process
# 3. Get app ID, key1, key2
# 4. Configure sandbox first, then production
```

### Step 3: VNPay Integration

```bash
# 1. Register at https://vnpay.vn
# 2. Business verification (2-3 days)
# 3. Get terminal code và hash secret
# 4. Test in sandbox environment
```

**Environment Variables:**

```bash
vercel env add MOMO_PARTNER_CODE production
vercel env add MOMO_ACCESS_KEY production
vercel env add MOMO_SECRET_KEY production
vercel env add ZALOPAY_APP_ID production
vercel env add ZALOPAY_KEY1 production
vercel env add ZALOPAY_KEY2 production
vercel env add VNPAY_TMN_CODE production
vercel env add VNPAY_HASH_SECRET production
```

---

## PHASE 5: MONITORING & ANALYTICS (20 minutes)

### Step 1: Google Analytics 4

```bash
# 1. Create GA4 property at https://analytics.google.com
# 2. Get measurement ID (G-XXXXXXXXXX)
# 3. Add to environment variables
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
```

### Step 2: Error Monitoring với Sentry

```bash
# 1. Create account at https://sentry.io
# 2. Create project: "rokdbot-services"
# 3. Get DSN URL
# 4. Configure environment
vercel env add SENTRY_DSN production
```

### Step 3: Health Monitoring

```bash
# 1. Setup uptime monitoring (UptimeRobot, Pingdom)
# 2. Monitor: https://rokdbot.com/api/health
# 3. Configure alerts for downtime
# 4. Monitor database performance
```

---

## PHASE 6: TESTING & LAUNCH (30 minutes)

### Step 1: Pre-Launch Testing

```bash
# Test all critical endpoints
curl https://rokdbot.com/api/health
curl https://rokdbot.com/api/services

# Test pages load correctly
# https://rokdbot.com
# https://rokdbot.com/services
# https://rokdbot.com/services/strategy
# https://rokdbot.com/admin/dashboard
```

### Step 2: Performance Testing

```bash
# Use tools:
# - Google PageSpeed Insights
# - GTmetrix
# - WebPageTest

# Target metrics:
# - Loading time < 3 seconds
# - First Contentful Paint < 1.5s
# - Largest Contentful Paint < 2.5s
# - Mobile performance score > 90
```

### Step 3: Security Testing

```bash
# Test HTTPS redirect
curl -I http://rokdbot.com
# Should return 301/302 redirect to HTTPS

# Test security headers
curl -I https://rokdbot.com
# Should include security headers

# Test API rate limiting
# Multiple requests to /api/leads should be rate limited
```

---

## 🎉 LAUNCH CHECKLIST

### Pre-Launch (Must Complete)

- [ ] Database deployed và accessible
- [ ] All environment variables configured
- [ ] HTTPS working với valid SSL certificate
- [ ] Payment gateways configured (sandbox)
- [ ] Health monitoring active
- [ ] Analytics tracking working
- [ ] Admin dashboard accessible
- [ ] Contact forms working
- [ ] Mobile responsiveness verified

### Launch Day

- [ ] Switch payment gateways to production mode
- [ ] Announce on Discord/social media
- [ ] Monitor error rates và performance
- [ ] Test first customer journey
- [ ] Collect feedback và iterate

### Post-Launch (First 48 hours)

- [ ] Monitor conversion rates
- [ ] Track revenue generation
- [ ] Review error logs
- [ ] Optimize based on real usage
- [ ] Customer support preparation

---

## 📞 EMERGENCY CONTACTS & SUPPORT

### Platform Support

- **Vercel:** https://vercel.com/support
- **Supabase:** https://supabase.com/support
- **Cloudflare:** https://support.cloudflare.com

### Payment Support

- **MoMo:** business.momo.vn/contact
- **ZaloPay:** zalopay.vn/support
- **VNPay:** vnpay.vn/support

### Monitoring

- **Sentry:** https://sentry.io/support
- **Google Analytics:** https://support.google.com/analytics

---

## 💰 ESTIMATED COSTS

### Free Tier (MVP Launch)

- Vercel: Free (hobby plan)
- Supabase: Free (500MB database)
- Cloudflare: Free (basic CDN + SSL)
- **Total: $0/month**

### Production Scale (50+ customers)

- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Monitoring tools: $10/month
- **Total: ~$55/month**

### Business Scale (200+ customers)

- Vercel Team: $50/month
- Supabase Scale: $100/month
- Premium monitoring: $30/month
- **Total: ~$180/month**

---

## 🚀 SUCCESS METRICS

### Week 1 Targets

- [ ] Website uptime: 99.9%
- [ ] Page load time: <3 seconds
- [ ] First 5 leads generated
- [ ] Payment system tested
- [ ] Zero critical bugs

### Month 1 Targets

- [ ] 50+ qualified leads
- [ ] 10+ paying customers
- [ ] 5M+ VNĐ revenue processed
- [ ] Customer satisfaction >90%
- [ ] Mobile traffic >85%

### Quarter 1 Targets

- [ ] 200+ qualified leads
- [ ] 50+ paying customers
- [ ] 20M+ VNĐ revenue processed
- [ ] Market recognition in RoK community
- [ ] Feature requests for Phase 2

---

**🎯 READY TO DEPLOY!**

Follow this guide step-by-step và bạn sẽ có một production-ready RoK Services platform trong 2
hours. System đã được optimized cho Vietnamese market và ready to generate revenue ngay lập tức.

**Next Action:** Start với Phase 1 - Database Setup!
