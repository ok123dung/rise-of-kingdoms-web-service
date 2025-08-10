# ✅ Vercel Deployment Checklist

## Pre-Deployment

### 1. Database Setup
- [ ] Create production database (Railway/Supabase/Neon)
- [ ] Get DATABASE_URL with connection pooling parameters
- [ ] Test connection locally with production URL
- [ ] Run `npx prisma db push` to create schema
- [ ] Verify all tables created successfully

### 2. Environment Variables Preparation
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Prepare all required environment variables
- [ ] Double-check DATABASE_URL includes pooling params
- [ ] Verify NEXTAUTH_URL matches Vercel domain

### 3. Code Preparation
- [ ] Run `npm run build` locally to catch errors
- [ ] Fix any TypeScript errors
- [ ] Ensure no hardcoded secrets in code
- [ ] Verify .env files are in .gitignore

## Vercel Setup

### 4. Project Import
- [ ] Connect GitHub repository to Vercel
- [ ] Select correct branch (main/master)
- [ ] Framework preset: Next.js
- [ ] Build settings auto-detected correctly

### 5. Environment Variables (CRITICAL!)
Add in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- [ ] `DATABASE_URL` - With pooling: `?pgbouncer=true&connection_limit=1`
- [ ] `NEXTAUTH_URL` - Full Vercel URL: `https://your-app.vercel.app`
- [ ] `NEXTAUTH_SECRET` - 32+ character secret

**Optional (if using):**
- [ ] `DISCORD_CLIENT_ID`
- [ ] `DISCORD_CLIENT_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `FROM_EMAIL`
- [ ] Payment gateway credentials

### 6. Build Configuration
Verify in Vercel:
- [ ] Build Command: `npm run build` or `prisma generate && next build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node.js Version: 18.x or higher

### 7. Function Configuration
Check vercel.json:
- [ ] Max duration set for API routes (30s)
- [ ] Region set to closest to users (sin1 for SEA)

## First Deployment

### 8. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Monitor build logs for errors
- [ ] Check for Prisma generation success
- [ ] Verify no build errors

### 9. Post-Deployment Verification
- [ ] Visit site URL - homepage loads
- [ ] Check `/api/health` - returns healthy
- [ ] Check `/api/health/db` - database connected
- [ ] Test user registration
- [ ] Check Function logs for errors

## Troubleshooting

### 10. Common Issues
- [ ] **"Database not configured"** → Add DATABASE_URL in Vercel
- [ ] **"Too many connections"** → Add pooling to DATABASE_URL
- [ ] **"NEXTAUTH_URL mismatch"** → Update to match Vercel URL
- [ ] **Build fails** → Check Node version and dependencies
- [ ] **Functions timeout** → Increase maxDuration in vercel.json

### 11. Debug Steps
1. **Check Function Logs:**
   - Vercel Dashboard → Functions → View Logs
   
2. **Test Database Connection:**
   ```bash
   curl https://your-app.vercel.app/api/health/db
   ```

3. **Verify Environment Variables:**
   - Dashboard → Settings → Environment Variables
   - Ensure no typos or missing values

4. **Force Redeploy:**
   - After adding/updating env vars
   - Dashboard → Deployments → Redeploy

## Success Indicators

### 12. Final Verification
- [ ] ✅ Homepage loads without errors
- [ ] ✅ API health check passes
- [ ] ✅ Database connection successful
- [ ] ✅ Can create new user account
- [ ] ✅ No errors in Function logs
- [ ] ✅ Services page shows data
- [ ] ✅ Authentication works

## Quick Commands

```bash
# Generate secure secret
openssl rand -base64 32

# Test deployment
curl https://your-app.vercel.app/api/health

# Add env var via CLI
vercel env add DATABASE_URL production

# Force redeploy
vercel --prod --force

# View logs
vercel logs --follow
```

## Emergency Fixes

If deployment is broken:
1. Check Function logs immediately
2. Verify DATABASE_URL is set correctly
3. Ensure build command includes `prisma generate`
4. Redeploy after fixing env vars

---
**Deployment time: ~10-15 minutes** ⏱️
**Most common issue: Missing DATABASE_URL** 🚨