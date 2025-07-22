# 🚀 QUICK START DEPLOYMENT
## rokdbot.com - 30 Minutes to Live

### 🎯 IMMEDIATE ACTIONS

**1. CREATE DATABASE (5 minutes)**
```bash
# Go to https://supabase.com
# Sign up → Create project: "rokdbot-services"
# Copy DATABASE_URL from Settings → Database → Connection string
```

**2. INSTALL VERCEL CLI (1 minute)**
```bash
npm i -g vercel
vercel login
```

**3. DEPLOY PROJECT (10 minutes)**
```bash
# In project directory
vercel link
vercel --prod

# Add environment variables:
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
```

**4. SETUP DATABASE (5 minutes)**
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

**5. CONFIGURE DOMAIN (5 minutes)**
```bash
# In Vercel dashboard:
# Settings → Domains → Add rokdbot.com

# In Cloudflare:
# DNS → CNAME @ → cname.vercel-dns.com
```

**6. TEST DEPLOYMENT (4 minutes)**
```bash
# Test these URLs:
curl https://rokdbot.com/api/health
curl https://rokdbot.com/api/services

# Visit:
# https://rokdbot.com
# https://rokdbot.com/services  
# https://rokdbot.com/services/strategy
```

---

## 📋 ESSENTIAL ENVIRONMENT VARIABLES

**Core (Required now):**
```bash
DATABASE_URL="postgresql://postgres.xxx:password@xxx.supabase.co:5432/postgres"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://rokdbot.com"  
NEXT_PUBLIC_SITE_URL="https://rokdbot.com"
NODE_ENV="production"
```

**Payment (Add later):**
```bash
# Get these from payment providers:
MOMO_PARTNER_CODE="xxx"
MOMO_ACCESS_KEY="xxx"  
MOMO_SECRET_KEY="xxx"
ZALOPAY_APP_ID="xxx"
ZALOPAY_KEY1="xxx"
ZALOPAY_KEY2="xxx"
VNPAY_TMN_CODE="xxx"
VNPAY_HASH_SECRET="xxx"
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Database created và connected
- [ ] Website loads at https://rokdbot.com
- [ ] SSL certificate active
- [ ] Services page displays correctly
- [ ] Strategy detail page works
- [ ] Health API returns 200
- [ ] Admin dashboard accessible
- [ ] Mobile responsive

---

## 🎉 POST-DEPLOYMENT

**Immediate (Today):**
1. Test all pages on mobile
2. Share link with first potential customers
3. Monitor error logs

**This Week:**
1. Setup payment gateways
2. Add monitoring (Sentry, GA4)
3. First customer onboarding

**This Month:**  
1. Revenue generation: 5-10M VNĐ
2. Customer feedback integration
3. Feature enhancements

---

**🚀 WEBSITE WILL BE LIVE IN 30 MINUTES!**

Ready to generate revenue cho Vietnamese Rise of Kingdoms community!