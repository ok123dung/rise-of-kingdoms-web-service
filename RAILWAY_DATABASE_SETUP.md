# Railway Database Setup Guide

## ⚠️ Current Issue
The database credentials you provided are being rejected by Railway. This means the password is incorrect.

## How to Get Correct Credentials from Railway

### Step 1: Access Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on your PostgreSQL service

### Step 2: Find Connection String
Railway provides the connection string in several places:

#### Option A: Variables Tab
1. Click on the "Variables" tab
2. Look for `DATABASE_URL`
3. Click the eye icon to reveal the full value
4. Copy the entire string

#### Option B: Connect Tab
1. Click on the "Connect" tab
2. You'll see connection details including:
   - Host
   - Port  
   - Database
   - Username
   - Password
3. Copy each value or use the full connection string

### Step 3: Connection String Format
The connection string should look like:
```
postgresql://postgres:[ACTUAL-PASSWORD]@[HOST].railway.app:[PORT]/railway
```

Common Railway hosts:
- `containers-us-west-XXX.railway.app`
- `autorack.proxy.rlwy.net` (proxy host)
- Direct container hosts

### Step 4: Update Your Environment

#### Local Development (.env file):
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway"
```

#### Vercel Dashboard:
1. Go to your Vercel project settings
2. Environment Variables section
3. Add `DATABASE_URL` with the Railway connection string

## Common Issues

### 1. Wrong Password
- The password in Railway is auto-generated and complex
- Make sure you copy it exactly (no extra spaces)
- Some special characters might need URL encoding

### 2. Database Sleeping
- Free tier databases sleep after inactivity
- Wake it up in Railway dashboard before connecting

### 3. Connection Refused
- Check if your IP is allowed (Railway usually allows all)
- Ensure the database service is running

## Testing Connection

After updating credentials:
```bash
# Test with Prisma
npx prisma db push

# Or use the setup script
bash scripts/setup-database.sh
```

## Need Help?
1. Check Railway's connection examples in their dashboard
2. Try their connection string builder
3. Contact Railway support if credentials still don't work