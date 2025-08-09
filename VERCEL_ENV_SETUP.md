# Vercel Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project settings (Settings > Environment Variables):

### 1. Database (Railway PostgreSQL)
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:[PORT]/railway
```
- Get this from Railway dashboard > PostgreSQL service > Variables tab

### 2. NextAuth Configuration
```
NEXTAUTH_URL=https://[your-vercel-app].vercel.app
NEXTAUTH_SECRET=[generate-with-openssl-rand-base64-32]
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Email Service (Optional)
```
RESEND_API_KEY=re_[your-resend-api-key]
```

### 4. Public Variables
```
NEXT_PUBLIC_SITE_URL=https://[your-vercel-app].vercel.app
```

## Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Navigate to "Environment Variables"
4. Add each variable with the appropriate value
5. Make sure to select the correct environments:
   - Production
   - Preview
   - Development (if needed)

## Testing Your Configuration

After setting up:
1. Trigger a new deployment
2. Check the Functions tab for any errors
3. Test the signup endpoint: `/api/auth/signup`

## Troubleshooting

If you get database connection errors:
1. Make sure your Railway database is active (not sleeping)
2. Check that the DATABASE_URL is correctly formatted
3. Verify the password doesn't contain special characters that need escaping
4. Try connecting with a PostgreSQL client to verify credentials