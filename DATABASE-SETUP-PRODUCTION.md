# 🗄️ Production Database Setup - Supabase

## 📋 Quick Database Setup (While Vercel Builds):

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub (ok123dung@gmail.com)
3. Create new project:
   - Name: `rok-services-prod`
   - Database Password: Generate strong password
   - Region: Singapore (closest to Vietnam)

### Step 2: Get Connection String
After project creation:
```
Database URL: postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

### Step 3: Deploy Database Schema
```bash
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Deploy schema
npx prisma db push

# Seed initial data
npx prisma db seed
```

### Step 4: Update Vercel Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
NEXTAUTH_URL=https://[YOUR-VERCEL-URL].vercel.app
NEXTAUTH_SECRET=generate-32-char-secret
```

## 🎯 Expected Tables:
- users (authentication)
- services (8 ROK services)
- service_tiers (pricing plans)
- bookings (customer orders)
- payments (transaction records)
- leads (potential customers)
- staff_profiles (admin accounts)
- communications (customer support)

## ✅ Verification:
After setup, check:
```bash
curl https://[YOUR-VERCEL-URL].vercel.app/api/health
# Should return: {"status":"healthy"}
```

---
**Database setup takes ~5 minutes. Perfect timing with Vercel build! 🚀**