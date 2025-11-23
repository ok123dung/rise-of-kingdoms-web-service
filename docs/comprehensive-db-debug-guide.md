# Comprehensive Database Connection Debugging Guide

## 🎯 Overview

This guide helps you diagnose and fix database connection issues for the ROK Services application deployed on Vercel with Supabase PostgreSQL database.

## 🔍 Common Error: 503 "Unable to connect to database"

### Root Cause Identified

**Self-Signed SSL Certificate Error**: The most common cause of 503 errors is SSL certificate validation failure when connecting to Supabase.

```
Error: self-signed certificate in certificate chain
Error Code: SELF_SIGNED_CERT_IN_CHAIN
```

## 🛠️ Step-by-Step Fix

### Step 1: Verify Environment Variables on Vercel

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Check DATABASE_URL** (Pooled Connection - for Serverless Functions)
   ```
   postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   
   ✅ **Must include**:
   - `?pgbouncer=true` - Enables connection pooling
   - `&connection_limit=1` - Limits connections per function instance

3. **Check DIRECT_URL** (Direct Connection - for Migrations & Prisma)
   ```
   postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
   ```
   
   ✅ **Must include**:
   - `?sslmode=require` - Enables SSL (required by Supabase)

4. **Apply to All Environments**
   - Make sure both variables are set for: **Production**, **Preview**, **Development**

### Step 2: Update Prisma Schema (Already Configured)

Your `prisma/schema.prisma` should look like this:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

### Step 3: Test Locally

Run the verification script to test all connections:

```bash
# Run comprehensive verification
node scripts/verify-db-connection.js
```

Expected output:
```
✅ Pooled Connection (6543): PASS
✅ Direct Connection (5432): PASS
✅ Prisma Connection: PASS
✅ Schema Verification: PASS
```

### Step 4: Deploy to Vercel

After verifying locally, deploy to Vercel:

```bash
# Deploy to production
npm run deploy:vercel

# Or use Vercel CLI
vercel --prod
```

### Step 5: Verify Production Deployment

1. **Health Check Endpoint**
   Visit: `https://your-app.vercel.app/api/health/db-diagnostic`
   
   Expected response:
   ```json
   {
     "overallStatus": "healthy",
     "checks": {
       "connection": { "status": "connected" },
       "query": { "status": "success" }
     }
   }
   ```

2. **Debug Database Endpoint**
   Visit: `https://your-app.vercel.app/api/debug-db`
   
   Should show connection success

3. **Test Signup Flow**
   - Visit: `https://your-app.vercel.app/auth/signup`
   - Try creating a new account
   - Should work without 503 error

## 🐛 Common Issues & Solutions

### Issue 1: "P1001: Can't reach database server"

**Cause**: DATABASE_URL is incorrect or database is not accessible

**Solutions**:
- ✅ Verify DATABASE_URL format is correct
- ✅ Check if Supabase project is paused (free tier auto-pauses after inactivity)
- ✅ Ensure you're using the pooled connection URL (port 6543)
- ✅ Add `?pgbouncer=true&connection_limit=1` to URL

### Issue 2: "P1002: Database server timeout"

**Cause**: Database took too long to respond (cold start)

**Solutions**:
- ✅ Use connection pooling: `?pgbouncer=true`
- ✅ Ensure Vercel region is close to Supabase region
- ✅ Consider upgrading Supabase plan for better performance

### Issue 3: "SELF_SIGNED_CERT_IN_CHAIN"

**Cause**: SSL certificate validation failure (THE MAIN ISSUE WE FIXED)

**Solutions**:
- ✅ Ensure `?sslmode=require` is in DIRECT_URL
- ✅ For some providers, try `?ssl=true` instead
- ✅ In Node.js scripts, use `ssl: { rejectUnauthorized: false }`

### Issue 4: "Too many connections"

**Cause**: Connection pool exhausted

**Solutions**:
- ✅ Add `?connection_limit=1` to DATABASE_URL
- ✅ Enable PgBouncer: `?pgbouncer=true`
- ✅ Ensure Prisma is using connection pooling
- ✅ Consider upgrading database plan

### Issue 5: "Authentication failed"

**Cause**: Wrong credentials in DATABASE_URL

**Solutions**:
- ✅ Get fresh credentials from Supabase Dashboard → Settings → Database
- ✅ Ensure password is URL-encoded if it contains special characters
- ✅ Verify you're using the correct user (usually `postgres`)

## 📋 Verification Checklist

Before deploying, ensure:

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] `DIRECT_URL` is set in Vercel environment variables
- [ ] Both URLs include proper SSL parameters
- [ ] `DATABASE_URL` includes `?pgbouncer=true&connection_limit=1`
- [ ] `DIRECT_URL` includes `?sslmode=require`
- [ ] Local tests pass: `node scripts/verify-db-connection.js`
- [ ] Prisma generates successfully: `npm run db:generate`
- [ ] `/api/health/db-diagnostic` returns healthy status
- [ ] Signup flow works without 503 errors

## 🔧 Debugging Tools

### 1. Vercel Logs

View real-time logs:
```bash
vercel logs --follow
```

### 2. Database Diagnostic Endpoint

Visit: `/api/health/db-diagnostic`

Provides detailed information about:
- Environment variables configuration
- Connection status
- Query execution
- Schema validation
- Connection pool status

### 3. Test Scripts

```bash
# Test direct connection
node scripts/test-direct-connection.js

# Comprehensive verification
node scripts/verify-db-connection.js

# Test Prisma connection
npm run db:generate && node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('OK')).catch(e => console.error(e))"
```

## 🆘 Still Having Issues?

1. **Check Vercel Deployment Logs**
   - Go to Vercel Dashboard → Deployments → Select latest
   - Click "View Function Logs"

2. **Verify Supabase Status**
   - Go to Supabase Dashboard
   - Check if project is active (not paused)
   - Verify connection pooling is enabled

3. **Test Connection from Vercel CLI**
   ```bash
   vercel env pull .env.vercel.local
   # Then test with local scripts
   ```

4. **Contact Support**
   - Create an issue with:
     - Error message from `/api/health/db-diagnostic`
     - Vercel function logs
     - Output from `node scripts/verify-db-connection.js`

## 📚 Additional Resources

- [Supabase Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

## ✅ Success Indicators

You know everything is working when:

1. ✅ `node scripts/verify-db-connection.js` shows all tests passing
2. ✅ `/api/health/db-diagnostic` returns `"overallStatus": "healthy"`
3. ✅ Signup form creates users without errors
4. ✅ No 503 errors in Vercel function logs
5. ✅ Admin dashboard loads data correctly
