# Deployment Checklist & Fix

The Vercel deployment failed because the `DATABASE_URL` environment variable is missing. Please
configure the following Environment Variables in your Vercel Project Settings.

## 1. Supabase Connection Details

**Project:** ok123dung's Project **Region:** ap-southeast-1 **Project ID:** `inondhimzqiguvdhyjng`

### Environment Variables to Add

Go to **Vercel Dashboard** > **Settings** > **Environment Variables** and add:

| Key            | Value                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | `postgresql://postgres.inondhimzqiguvdhyjng:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL`   | `postgresql://postgres:[YOUR-PASSWORD]@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres`                                          |

> [!IMPORTANT] Replace `[YOUR-PASSWORD]` with your actual database password. If you have forgotten
> your password, you can reset it in the Supabase Dashboard under **Project Settings** >
> **Database**.

## 2. Redeploy

After adding these variables:

1. Go to the **Deployments** tab in Vercel.
2. Find the failed deployment.
3. Click **Redeploy**.

## 3. Verification

The build should now succeed as Prisma will be able to generate the client with the correct schema
and connection string.
