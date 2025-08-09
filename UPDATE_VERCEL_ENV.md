# ✅ Update Vercel Environment Variables

Your Railway database is working! Now update Vercel with the correct values:

## 1. Go to Vercel Dashboard
https://vercel.com/dashboard

## 2. Select your project: rok-servicesb

## 3. Go to Settings → Environment Variables

## 4. Add these variables:

```
DATABASE_URL=postgresql://postgres:qllvWulFKNbBHBGVLaevIRjjDMxDpUPy@yamabiko.proxy.rlwy.net:59019/railway

NEXTAUTH_URL=https://rok-servicesb-p9bwd1jrw-website-e92f26fc.vercel.app

NEXTAUTH_SECRET=generate-this-with-command-below
```

To generate NEXTAUTH_SECRET, run:
```bash
openssl rand -base64 32
```

## 5. Select environments:
- ✅ Production
- ✅ Preview
- ✅ Development

## 6. Save and Redeploy

After adding the variables, redeploy your site:
- Go to Deployments tab
- Click on the three dots menu on the latest deployment
- Select "Redeploy"

## Your database schema has been created!

I've successfully pushed all the tables to your Railway database:
- ✅ Users table
- ✅ Services table  
- ✅ Bookings table
- ✅ Payments table
- ✅ All other tables

Your signup API should now work correctly! 🎉