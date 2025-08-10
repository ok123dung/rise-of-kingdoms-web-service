# 📊 Database Migration Guide

## Current Migration Status

### ✅ Applied Migrations
1. **20250804113555_init** - Initial database schema (already in production)

### 🆕 Pending Migrations
2. **20250810213439_add_logs_and_tasks** - Add logging and task management tables

## How to Apply Migrations

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Set up environment variables
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy
```

### Option 2: Direct Database Connection

1. **Set Railway Database URL locally:**
```bash
export DATABASE_URL="postgresql://postgres:qllvWulFKNbBHBGVLaevIRjjDMxDpUPy@yamabiko.proxy.rlwy.net:59019/railway"
```

2. **Apply pending migrations:**
```bash
# Deploy all pending migrations
npx prisma migrate deploy

# Or reset and apply all (WARNING: This will delete all data!)
# npx prisma migrate reset
```

3. **Verify migration status:**
```bash
npx prisma migrate status
```

### Option 3: Manual SQL Execution

If automated migration fails, you can apply the SQL manually:

1. Connect to Railway database using a PostgreSQL client
2. Execute the SQL from: `prisma/migrations/20250810213439_add_logs_and_tasks/migration.sql`

## New Tables Added

### 1. **system_logs**
- Application-level logging
- Tracks errors, warnings, info messages
- Indexed by level and service

### 2. **security_logs**
- Security events tracking
- Failed auth attempts, unauthorized access
- Indexed by event and user

### 3. **audit_logs**
- User action tracking
- CRUD operations audit trail
- Indexed by user and resource

### 4. **service_tasks**
- Task management for bookings
- Track delivery, checks, updates
- Indexed by booking and assignee

## Post-Migration Checklist

- [ ] Run `npx prisma migrate deploy`
- [ ] Verify all tables created with `npx prisma db pull`
- [ ] Test application functionality
- [ ] Check logs are being written
- [ ] Update monitoring dashboards

## Rollback Plan

If issues occur, rollback with:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back 20250810213439_add_logs_and_tasks

# Or restore from backup
# Railway keeps automatic backups
```

## Migration Commands Reference

```bash
# Check status
npx prisma migrate status

# Deploy migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

## Important Notes

1. **Always backup before migrations**
2. **Test in staging first if possible**
3. **Run migrations during low traffic**
4. **Monitor application after migration**
5. **Keep migration files in version control**

---

**Current Production Database**: Railway PostgreSQL
**Connection**: `yamabiko.proxy.rlwy.net:59019`
**Database Name**: `railway`