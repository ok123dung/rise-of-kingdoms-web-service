# 🗄️ DATABASE SETUP GUIDE
## PostgreSQL Production Database for rokdbot.com

### 📋 OPTION 1: SUPABASE (RECOMMENDED)

**Why Supabase:**
- ✅ Free tier available (500MB, up to 2 projects)
- ✅ PostgreSQL 15 with full SQL support
- ✅ Automatic backups và point-in-time recovery
- ✅ Built-in authentication (if needed later)
- ✅ Real-time subscriptions
- ✅ Dashboard để monitor queries
- ✅ Vietnam-friendly (good latency)

**Setup Steps:**

1. **Create Supabase Account**
   ```bash
   # Go to https://supabase.com
   # Sign up với GitHub account
   # Create new project: "rokdbot-services"
   ```

2. **Get Connection String**
   ```
   # In Supabase dashboard:
   Settings → Database → Connection string → URI
   
   Example:
   postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
   ```

3. **Configure Environment**
   ```bash
   # Update DATABASE_URL in your deployment platform
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.abc123.supabase.co:5432/postgres"
   ```

### 📋 OPTION 2: RAILWAY

**Why Railway:**
- ✅ Simple deployment
- ✅ PostgreSQL 14
- ✅ $5/month hobby plan (512MB RAM)
- ✅ Automatic backups
- ✅ Easy environment variables

**Setup Steps:**

1. **Create Railway Account**
   ```bash
   # Go to https://railway.app
   # Sign up với GitHub
   # Create new project
   # Add PostgreSQL service
   ```

2. **Get Connection Details**
   ```bash
   # Railway will provide:
   PGHOST=containers-us-west-xxx.railway.app
   PGPORT=5432
   PGDATABASE=railway
   PGUSER=postgres
   PGPASSWORD=xxx
   
   # Connection string:
   postgresql://postgres:password@host:5432/railway
   ```

### 📋 OPTION 3: RENDER

**Setup Steps:**

1. **Create Render Account**
   ```bash
   # Go to https://render.com
   # Create PostgreSQL database
   # Free tier: 90 days, then $7/month
   ```

### 🚀 DATABASE DEPLOYMENT COMMANDS

Once you have your DATABASE_URL:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Deploy database migrations
npx prisma migrate deploy

# 4. Seed initial data
npx tsx prisma/seed.ts
```

### ⚡ PERFORMANCE OPTIMIZATION

**Recommended Database Configuration:**

```sql
-- Enable performance extensions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Optimize for Vietnamese text search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Connection pooling settings (for Supabase)
-- These are already optimized, but good to know:
-- shared_preload_libraries = 'pg_stat_statements'
-- max_connections = 100
-- shared_buffers = 128MB
```

### 📊 MONITORING QUERIES

**Check Database Performance:**

```sql
-- Top slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public';
```

### 🔒 SECURITY CHECKLIST

- [x] **SSL/TLS enabled** (automatic với Supabase/Railway)
- [x] **Row Level Security** được implement trong schema
- [x] **Password strength** - minimum 16 characters
- [x] **IP whitelist** if available (Supabase Pro)
- [x] **Backup strategy** - automatic daily backups
- [x] **Connection pooling** - prevent connection exhaustion

### 💰 COST ESTIMATES

| Provider | Free Tier | Paid Plan | Vietnam Access |
|----------|-----------|-----------|----------------|
| **Supabase** | 500MB, 2 projects | $25/month (8GB) | ✅ Good |
| **Railway** | $5 credit | $5/month (512MB) | ✅ Good |
| **Render** | 90 days free | $7/month (256MB) | ⚠️ Average |
| **PlanetScale** | 5GB free | $29/month | ✅ Excellent |

**Recommendation for RoK Services:**
- **Start:** Supabase free tier (perfect for MVP)
- **Scale:** Supabase Pro at $25/month (handles 50+ concurrent users)
- **Enterprise:** PlanetScale at $29/month (global scale)

### 🎯 PRODUCTION CHECKLIST

Before deployment:

- [ ] Database created và accessible
- [ ] DATABASE_URL configured in deployment platform
- [ ] Prisma migrations deployed successfully
- [ ] Seed data populated
- [ ] Health check endpoint returning database status
- [ ] Backup strategy confirmed
- [ ] Connection limits understood
- [ ] Performance baseline established

### 📞 SUPPORT CONTACTS

**Supabase:**
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

**Railway:**
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### 🚨 TROUBLESHOOTING

**Common Issues:**

1. **Connection Timeout**
   ```bash
   # Check if DATABASE_URL is correct
   npx prisma db pull
   ```

2. **Migration Errors**
   ```bash
   # Reset và re-deploy migrations
   npx prisma migrate reset --force
   npx prisma migrate deploy
   ```

3. **Seeding Fails**
   ```bash
   # Check data conflicts
   npx tsx prisma/seed.ts --verbose
   ```

4. **Performance Issues**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Check slow queries
   SELECT query, mean_time FROM pg_stat_statements 
   ORDER BY mean_time DESC LIMIT 5;
   ```

---

**🎯 RECOMMENDED NEXT STEP: Supabase Setup**

Supabase is the best choice cho RoK Services vì:
- Vietnamese-friendly performance
- Generous free tier
- Built-in features we'll need later
- Excellent documentation
- Strong community support

**Setup time: 15 minutes**