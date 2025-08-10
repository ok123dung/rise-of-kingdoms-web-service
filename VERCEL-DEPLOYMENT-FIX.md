# 🚨 VERCEL DATABASE CONNECTION FIX

## Problem
Your Vercel deployment cannot connect to the database because the `DATABASE_URL` environment variable is not configured in Vercel.

## Quick Solution

### 1. Add Environment Variables in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **REQUIRED** variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database?pgbouncer=true&connection_limit=1
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-here
```

### 2. Database URL Format

For different providers:

**Railway:**
```
postgresql://postgres:password@monorail.proxy.rlwy.net:12345/railway?pgbouncer=true&connection_limit=1
```

**Supabase:**
```
postgresql://postgres:password@db.projectid.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

**Neon:**
```
postgresql://username:password@ep-name.region.aws.neon.tech/database?sslmode=require&pgbouncer=true&connection_limit=1
```

### 3. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

### 4. Add Variables via Vercel CLI (Alternative)

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
```

### 5. Redeploy After Adding Variables

**Option 1: Via Dashboard**
- Go to Deployments tab
- Click "..." on latest deployment
- Select "Redeploy"

**Option 2: Via CLI**
```bash
vercel --prod
```

### 6. Verify Connection

After redeployment, test:
```bash
curl https://your-app.vercel.app/api/health/db
```

Should return:
```json
{"status":"healthy","message":"Database connection successful"}
```

## Common Issues & Solutions

### Issue 1: Too Many Connections
**Solution:** Add connection pooling parameters:
```
?pgbouncer=true&connection_limit=1&pool_timeout=0
```

### Issue 2: SSL Required
**Solution:** Add SSL mode:
```
?sslmode=require
```

### Issue 3: Timeout Errors
**Solution:** Increase function duration in vercel.json:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Complete Environment Variables List

```env
# Required
DATABASE_URL=your-database-url-with-pooling
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=32-character-secret

# Optional (add if using these features)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com

# Payment Gateways (if enabled)
MOMO_PARTNER_CODE=your-momo-code
MOMO_ACCESS_KEY=your-momo-key
MOMO_SECRET_KEY=your-momo-secret
# ... other payment configs
```

## Verification Checklist

- [ ] DATABASE_URL added to Vercel with connection pooling
- [ ] NEXTAUTH_URL matches your Vercel deployment URL
- [ ] NEXTAUTH_SECRET is 32+ characters
- [ ] Redeployed after adding variables
- [ ] Health check endpoint returns success
- [ ] Can create new user account

## Need Help?

1. Check Vercel Function Logs: Dashboard → Functions → View logs
2. Test locally with production database (carefully!)
3. Contact support with error messages from logs

---
**Time to fix: ~5 minutes** 🚀