# 🚀 Supabase Setup Guide

## 📋 Current Status

Your Supabase project is configured with:
- **Project Reference**: `inondhimzqiguvdhyjng`
- **Project URL**: `https://inondhimzqiguvdhyjng.supabase.co`
- **Anon Key**: `sb_publishable_Xc6vXnPpEJcxxPWCnit9zg_f71ZCiMP` ✅

## ⚠️ Required Information

You need to provide:
1. **Database Password** - Replace `[YOUR-PASSWORD]` in connection strings
2. **Service Role Key** - Get from Supabase dashboard (Settings → API)

## 🔧 Setup Steps

### 1. Update Database Password

Edit `.env` and `.env.local` files and replace `[YOUR-PASSWORD]` with your actual password:

```bash
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres"
```

### 2. Get Service Role Key

1. Go to https://supabase.com/dashboard/project/inondhimzqiguvdhyjng/settings/api
2. Copy the "service_role" key (keep it secret!)
3. Add to `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 3. Test Connection

```bash
# Test database connection
node scripts/test-supabase-connection.js

# If successful, generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

### 4. Verify Setup

1. Check Supabase dashboard for created tables
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Test authentication at http://localhost:3000/auth/signin

## 🎯 What's Already Configured

✅ **Authentication**
- NextAuth with credentials & Discord OAuth
- 2FA support with TOTP
- Password security (bcrypt 14 rounds + history)

✅ **Security Features**
- CSRF protection
- Rate limiting
- CSP headers
- Secure session management

✅ **Services Ready**
- Payment webhooks (MoMo, ZaloPay, VNPay)
- WebSocket server for real-time updates
- File upload system (can use Supabase Storage)
- Email service (needs Resend API key)

✅ **Monitoring**
- Sentry error tracking (needs DSN)
- Custom logging system
- Performance monitoring

## 📊 Database Schema

The following tables will be created:
- `User` - User accounts with authentication
- `Staff` - Staff profiles and permissions
- `Service` - Available services
- `ServiceTier` - Service pricing tiers
- `Booking` - Customer bookings
- `Payment` - Payment records
- `Lead` - Sales leads
- `Message` - Chat messages
- `Account` - OAuth accounts (Discord)
- `Session` - User sessions
- `PasswordHistory` - Password change history

## 🚦 Quick Commands

```bash
# Development
npm run dev          # Start Next.js dev server
npm run ws:dev       # Start WebSocket server
npm run dev:all      # Start both servers

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
npm run format       # Format code with Prettier

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

## 🔒 Security Notes

1. **Never commit** the service role key to Git
2. **Keep `.env.local`** in `.gitignore`
3. **Use environment variables** in production
4. **Enable RLS** (Row Level Security) in Supabase for tables
5. **Set up IP allowlist** in Supabase if needed

## 📞 Need Help?

- Check logs: `npm run dev` will show connection errors
- Verify credentials in Supabase dashboard
- Test connection: `node scripts/test-supabase-connection.js`
- Check tables: https://supabase.com/dashboard/project/inondhimzqiguvdhyjng/editor

## ✅ Ready to Deploy?

Once database is connected:
1. Push to GitHub
2. Deploy to Vercel/Railway/VPS
3. Set production environment variables
4. Configure custom domain
5. Monitor with Sentry

---

**Current Step**: Waiting for database password to complete setup