# ⚙️ ENVIRONMENT VARIABLES SETUP
## Complete Configuration Guide for rokdbot.com

### 🎯 QUICK SETUP COMMANDS

**For Vercel CLI:**
```bash
# Core configuration (Required)
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production  
vercel env add NEXTAUTH_URL production
vercel env add NEXT_PUBLIC_SITE_URL production

# Payment gateways (Business critical)
vercel env add MOMO_PARTNER_CODE production
vercel env add MOMO_ACCESS_KEY production
vercel env add MOMO_SECRET_KEY production
vercel env add ZALOPAY_APP_ID production
vercel env add ZALOPAY_KEY1 production
vercel env add ZALOPAY_KEY2 production
vercel env add VNPAY_TMN_CODE production
vercel env add VNPAY_HASH_SECRET production

# Monitoring (Recommended)
vercel env add SENTRY_DSN production
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
```

---

## 🔐 REQUIRED ENVIRONMENT VARIABLES

### 1. DATABASE CONFIGURATION

**DATABASE_URL**
```bash
# Supabase example:
DATABASE_URL="postgresql://postgres.abc123:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Railway example:  
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"

# PlanetScale example:
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/database-name?ssl={"rejectUnauthorized":true}"
```

**How to get:**
1. Create database on Supabase/Railway/PlanetScale
2. Copy connection string from dashboard
3. Ensure database is accessible from Vercel

### 2. AUTHENTICATION

**NEXTAUTH_SECRET**
```bash
# Generate secure random string (32+ characters)
NEXTAUTH_SECRET="your-super-secure-random-string-32-chars-minimum-abc123"

# Generate command:
openssl rand -base64 32
```

**NEXTAUTH_URL**
```bash
NEXTAUTH_URL="https://rokdbot.com"
```

### 3. SITE CONFIGURATION

**NEXT_PUBLIC_SITE_URL**
```bash
NEXT_PUBLIC_SITE_URL="https://rokdbot.com"
```

---

## 💳 PAYMENT GATEWAY CONFIGURATION

### MoMo Integration

**Required Variables:**
```bash
MOMO_PARTNER_CODE="MOMO123456"
MOMO_ACCESS_KEY="A1B2C3D4E5F6"
MOMO_SECRET_KEY="G7H8I9J0K1L2M3N4O5P6"
MOMO_ENDPOINT="https://payment.momo.vn"
```

**How to get:**
1. Visit https://business.momo.vn
2. Register business account
3. Submit required documents:
   - Business registration certificate
   - Tax code
   - Bank account information
   - Legal representative ID
4. Wait for approval (3-5 business days)
5. Access merchant dashboard for credentials

**Testing:**
```bash
# Sandbox endpoint
MOMO_ENDPOINT="https://test-payment.momo.vn"
```

### ZaloPay Integration

**Required Variables:**
```bash
ZALOPAY_APP_ID="123456"
ZALOPAY_KEY1="your-zalopay-key1"
ZALOPAY_KEY2="your-zalopay-key2"
ZALOPAY_ENDPOINT="https://openapi.zalopay.vn"
```

**How to get:**
1. Visit https://zalopay.vn/business
2. Complete business registration
3. KYC verification process
4. Get sandbox credentials first
5. Apply for production after testing

### VNPay Integration

**Required Variables:**
```bash
VNPAY_TMN_CODE="YOUR_TMN_CODE"
VNPAY_HASH_SECRET="your-vnpay-hash-secret"
VNPAY_URL="https://pay.vnpay.vn"
```

**How to get:**
1. Visit https://vnpay.vn
2. Business account registration
3. Document submission (similar to MoMo)
4. Wait for verification (2-3 business days)
5. Receive terminal code và hash secret

---

## 📧 EMAIL & COMMUNICATION

### Resend (Email Service)

**RESEND_API_KEY**
```bash
RESEND_API_KEY="re_abc123456789"
```

**Setup:**
1. Create account at https://resend.com
2. Verify domain (rokdbot.com)
3. Get API key from dashboard
4. Configure DNS records for domain verification

### Discord Integration

**DISCORD_WEBHOOK_URL**
```bash
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/123456789/abc-def-ghi"
```

**Setup:**
1. Go to Discord server settings
2. Integrations → Webhooks
3. Create new webhook for alerts
4. Copy webhook URL

**DISCORD_CLIENT_ID & DISCORD_CLIENT_SECRET** (OAuth)
```bash
DISCORD_CLIENT_ID="123456789012345678"
DISCORD_CLIENT_SECRET="abc123def456ghi789"
```

**Setup:**
1. Visit https://discord.com/developers/applications
2. Create new application
3. OAuth2 → Add redirect URI: `https://rokdbot.com/api/auth/callback/discord`
4. Copy Client ID và Client Secret

---

## 📊 MONITORING & ANALYTICS

### Google Analytics 4

**NEXT_PUBLIC_GA_MEASUREMENT_ID**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

**Setup:**
1. Create Google Analytics 4 property
2. Add website: https://rokdbot.com
3. Copy Measurement ID
4. Configure enhanced ecommerce tracking

### Sentry (Error Tracking)

**SENTRY_DSN**
```bash
SENTRY_DSN="https://abc123@o123456.ingest.sentry.io/123456"
```

**Setup:**
1. Create Sentry account
2. Create new project: "rokdbot-services"
3. Copy DSN URL
4. Configure error sampling rates

---

## 🔧 OPTIONAL CONFIGURATION

### Redis (Caching & Sessions)

**REDIS_URL**
```bash
REDIS_URL="redis://username:password@hostname:6379"
```

**Providers:**
- Upstash (recommended): Free tier, Redis 6.x
- Railway: $5/month, Redis 7.x
- AWS ElastiCache: Production scale

### Rate Limiting

**RATE_LIMIT_REDIS_URL**
```bash
RATE_LIMIT_REDIS_URL="redis://username:password@hostname:6379"
```

### Health Check Configuration

**HEALTH_CHECK_INTERVAL**
```bash
HEALTH_CHECK_INTERVAL="300000"  # 5 minutes in milliseconds
```

---

## 🚀 VERCEL DASHBOARD SETUP

### Method 1: Web Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environment: Production
   - Click "Save"

### Method 2: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... continue for all variables
```

### Method 3: Import from File

```bash
# Create .env.production with all variables
# Then bulk import
vercel env pull .env.production
```

---

## ✅ VERIFICATION CHECKLIST

### Test Database Connection
```bash
# Local test with production DATABASE_URL
DATABASE_URL="your-production-url" npx prisma db pull
```

### Test Authentication
```bash
# Generate test secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Test Payment Integration (Sandbox)
```bash
# Use sandbox endpoints first:
MOMO_ENDPOINT="https://test-payment.momo.vn"
ZALOPAY_ENDPOINT="https://sb-openapi.zalopay.vn"
VNPAY_URL="https://sandbox.vnpayment.vn"
```

### Test Environment Variables
```bash
# Deploy to preview first
vercel --prod

# Check deployment logs
vercel logs your-deployment-url
```

---

## 🔒 SECURITY BEST PRACTICES

### Secret Management
- ✅ Never commit secrets to Git
- ✅ Use strong, unique secrets (32+ characters)
- ✅ Rotate secrets regularly (quarterly)
- ✅ Use environment-specific secrets
- ✅ Monitor for secret leaks

### Environment Separation
```bash
# Development
vercel env add DATABASE_URL development

# Preview
vercel env add DATABASE_URL preview  

# Production
vercel env add DATABASE_URL production
```

### Access Control
- ✅ Limit team access to production secrets
- ✅ Use service accounts for CI/CD
- ✅ Enable audit logging
- ✅ Regular access reviews

---

## 🚨 TROUBLESHOOTING

### Common Issues

**Build Fails với Missing Environment Variables:**
```bash
# Check Vercel build logs
vercel logs

# Ensure all required variables are set
vercel env ls
```

**Database Connection Issues:**
```bash
# Test connection string locally
DATABASE_URL="production-url" npx prisma db pull

# Check IP whitelist (if using managed database)
# Add Vercel IPs to database firewall
```

**Payment Gateway Errors:**
```bash
# Verify sandbox vs production endpoints
# Check credential format (no extra spaces/characters)
# Verify webhook URLs are accessible
```

**Analytics Not Tracking:**
```bash
# Verify NEXT_PUBLIC_ prefix for client-side variables
# Check Google Analytics real-time reports
# Verify domain tracking settings
```

---

## 📋 ENVIRONMENT VARIABLES SUMMARY

**Total Required: 15**
**Total Recommended: 8**  
**Setup Time: 45 minutes**

**Priority Order:**
1. Database + Auth (5 vars) - Critical
2. Payment Gateways (9 vars) - Business Critical  
3. Monitoring (3 vars) - Recommended
4. Communication (4 vars) - Optional
5. Performance (2 vars) - Optional

**Next Step:** Deploy to Vercel!