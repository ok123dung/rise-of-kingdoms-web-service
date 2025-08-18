# Environment Variables Setup Guide

## 🔐 Security Notice
**NEVER commit sensitive data like passwords, API keys, or secrets to version control!**

## Required Environment Variables

### 1. Database Configuration

#### Supabase (Recommended)
```bash
# Connection pooling URL (for serverless environments)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection URL (for migrations)
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Supabase API
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Other PostgreSQL Providers
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true
DIRECT_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

### 2. Authentication

```bash
# NextAuth configuration
NEXTAUTH_URL=https://your-domain.com  # Use http://localhost:3000 for development
NEXTAUTH_SECRET=your-secret-key       # Generate with: openssl rand -base64 32

# Discord OAuth (Create app at https://discord.com/developers/applications)
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

### 3. Payment Gateways

#### MoMo
```bash
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create  # Use test endpoint for development
```

#### ZaloPay
```bash
ZALOPAY_APP_ID=your-app-id
ZALOPAY_KEY1=your-key1
ZALOPAY_KEY2=your-key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create  # Sandbox endpoint
```

#### VNPay
```bash
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html  # Sandbox URL
```

### 4. Email Service (Resend)

```bash
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@your-domain.com
```

### 5. File Storage (Cloudflare R2)

```bash
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

### 6. Discord Bot

```bash
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_GUILD_ID=your-server-id
DISCORD_BOOKINGS_CHANNEL=channel-id-for-bookings
DISCORD_SUPPORT_CHANNEL=channel-id-for-support
```

### 7. Monitoring (Sentry)

```bash
SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### 8. Redis Cache (Optional)

```bash
REDIS_URL=redis://default:[password]@[host]:[port]
```

### 9. Security Keys

```bash
# Generate secure keys with: openssl rand -base64 32
API_SECRET_KEY=your-api-secret
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## Setup Instructions

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your development credentials in `.env.local`

3. Never commit `.env.local` to version control

### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable with its production value
4. Use different values for Preview and Production environments

### For Production (Other Platforms)

1. Use your platform's environment variable management
2. Ensure all sensitive values are stored securely
3. Use connection pooling for database URLs
4. Enable SSL/TLS for all connections

## Security Best Practices

1. **Rotate keys regularly** - Change API keys and secrets periodically
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Limit access** - Use least privilege principle for API keys
4. **Monitor usage** - Set up alerts for unusual activity
5. **Use test endpoints** - Never use production payment endpoints in development

## Troubleshooting

### Database Connection Issues
- Ensure you're using the pooled connection URL for serverless
- Check if your IP is whitelisted in database settings
- Verify SSL mode is enabled for production

### Authentication Errors
- Ensure NEXTAUTH_URL matches your deployment URL
- Regenerate NEXTAUTH_SECRET if authentication fails
- Check Discord OAuth redirect URLs match your domain

### Payment Gateway Issues
- Start with sandbox/test endpoints
- Verify webhook URLs are accessible
- Check IP whitelisting requirements

## Need Help?

1. Check the logs in your deployment platform
2. Review the error messages carefully
3. Ensure all required variables are set
4. Contact support with specific error details