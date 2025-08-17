# RoK Services Deployment Checklist

## Pre-Deployment
- [x] Fix all TypeScript errors
- [x] Fix Edge Runtime compatibility
- [x] Update CSP configuration
- [x] Create database security scripts
- [x] Test production build locally

## Database Setup (Supabase)

### 1. Manual Migration Steps
Since we can't use Supabase CLI without access token, run these SQL scripts manually in Supabase SQL Editor:

1. **Enable RLS Policies** (001_enable_rls_security.sql)
   - Copy entire content and run in SQL editor
   - This enables row-level security on all tables

2. **Create Indexes** (002_strategic_indexes.sql)
   - Copy entire content and run in SQL editor
   - Creates 70+ performance indexes

3. **Setup Encryption** (003_field_encryption.sql)
   - Copy entire content and run in SQL editor
   - Sets up field-level encryption for sensitive data

4. **Enable Monitoring** (004_audit_monitoring.sql)
   - Copy entire content and run in SQL editor
   - Creates audit logs and monitoring views

### 2. Configure Supabase Settings
1. Go to Supabase Dashboard > Settings > API
2. Copy the service role key (needed for admin operations)
3. Enable RLS on all tables via Table Editor

## Environment Variables (Vercel)

Add these environment variables in Vercel Dashboard:

```env
# Database (Already configured)
DATABASE_URL="postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://inondhimzqiguvdhyjng.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_Xc6vXnPpEJcxxPWCnit9zg_f71ZCiMP"
SUPABASE_SERVICE_ROLE_KEY="[GET FROM SUPABASE DASHBOARD]"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="NW1q8qogTUIzluVfzKJTk6putP2Jq8ReGRq2+on8IeM="

# Email (Optional)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Discord OAuth (Optional)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Payment Gateways (Required for production)
MOMO_PARTNER_CODE="your-momo-partner-code"
MOMO_ACCESS_KEY="your-momo-access-key"
MOMO_SECRET_KEY="your-momo-secret-key"

VNPAY_TMN_CODE="your-vnpay-tmn-code"
VNPAY_HASH_SECRET="your-vnpay-hash-secret"

ZALOPAY_APP_ID="your-zalopay-app-id"
ZALOPAY_KEY1="your-zalopay-key1"
ZALOPAY_KEY2="your-zalopay-key2"

# Monitoring
SENTRY_DSN="your-actual-sentry-dsn"

# Storage
CLOUDFLARE_R2_ACCESS_KEY_ID="your-r2-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-r2-secret"
CLOUDFLARE_R2_BUCKET_NAME="rok-services"
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
```

## GitHub Repository Setup

1. Create repository on GitHub
2. Push code:
```bash
git init
git add .
git commit -m "Initial deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rok-services.git
git push -u origin main
```

## Vercel Deployment

1. Go to https://vercel.com/new
2. Import GitHub repository
3. Configure:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Install Command: `npm install`
4. Add all environment variables
5. Deploy

## Post-Deployment

### 1. Verify Deployment
- [ ] Check homepage loads
- [ ] Test user registration
- [ ] Test user login
- [ ] Check service pages
- [ ] Test booking flow
- [ ] Verify payment gateways

### 2. Configure Domain (Optional)
1. Add custom domain in Vercel
2. Update DNS records
3. Wait for SSL certificate

### 3. Setup Monitoring
1. Configure Sentry project
2. Setup Vercel Analytics
3. Enable Supabase monitoring

### 4. Security Verification
- [ ] Test RLS policies work
- [ ] Verify encryption active
- [ ] Check audit logs recording
- [ ] Test rate limiting

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in Vercel
   - Verify Supabase project is active

2. **Authentication Not Working**
   - Update NEXTAUTH_URL to production URL
   - Check callback URLs in OAuth providers

3. **Payment Gateway Errors**
   - Verify API keys are correct
   - Check webhook URLs configured

4. **Performance Issues**
   - Check if indexes were created
   - Monitor slow queries in Supabase

## Rollback Plan

If issues occur:
1. Revert to previous deployment in Vercel
2. Restore database backup in Supabase
3. Check error logs in Vercel Functions

## Support Contacts

- Database: Supabase Support
- Hosting: Vercel Support
- Payment: Gateway provider support

---

Ready for deployment! Follow these steps carefully.