# Vercel Database Setup Guide

## Database Connection Error Fix

The build is failing with:
`Authentication failed against database server, the provided database credentials for 'postgres' are not valid`

## Step-by-Step Solution

### 1. Set up PostgreSQL Database

You have several options:

#### Option A: Railway PostgreSQL (Recommended)

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Add PostgreSQL plugin
4. Get the connection string from the Connect tab

#### Option B: Neon PostgreSQL

1. Go to [Neon](https://neon.tech)
2. Create a new database
3. Copy the connection string

#### Option C: Supabase PostgreSQL

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

### 2. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
Name: DATABASE_URL
Value: postgresql://username:password@host:port/database?sslmode=require
```

**Important**: Make sure to:

- Replace the connection string with your actual database URL
- Include `?sslmode=require` at the end for secure connections
- Select all environments (Production, Preview, Development)

### 3. Run Database Migrations

After setting up the database URL:

1. In your local development:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations (if you have migration files)
npx prisma migrate deploy
```

2. For production, add a build command in `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### 4. Verify Database Connection

Test your database connection locally:

```bash
# Set DATABASE_URL in .env.local
DATABASE_URL=your_connection_string

# Test connection
npx prisma db pull
```

### 5. Additional Environment Variables

While fixing the database, also add these critical variables in Vercel:

```
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-secret-here
```

Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 6. Redeploy

After adding all environment variables:

1. Go to Deployments in Vercel
2. Click on the three dots on the latest deployment
3. Select "Redeploy"

## Troubleshooting

### If build still fails:

1. **Check connection string format**:
   - PostgreSQL: `postgresql://user:pass@host:port/db`
   - Must include protocol `postgresql://`
2. **Check database accessibility**:
   - Ensure database allows connections from Vercel IPs
   - Most cloud databases have this enabled by default

3. **Check Prisma schema**:
   - Ensure `datasource db` in `schema.prisma` uses `env("DATABASE_URL")`

4. **Clear build cache**:
   - In Vercel project settings, clear build cache and redeploy

## Quick Checklist

- [ ] Database created and accessible
- [ ] DATABASE_URL added to Vercel env vars
- [ ] NEXTAUTH_URL set to your Vercel URL
- [ ] NEXTAUTH_SECRET generated and added
- [ ] Database migrations run successfully
- [ ] Build cache cleared and redeployed
