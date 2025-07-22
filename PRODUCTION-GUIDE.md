# 🚀 PRODUCTION DEPLOYMENT GUIDE - ROK SERVICES

## 📋 PRE-DEPLOYMENT CHECKLIST

### **Environment Setup**
- [ ] Supabase PostgreSQL database configured
- [ ] Upstash Redis cache configured  
- [ ] Resend email service configured
- [ ] Discord bot tokens configured
- [ ] Payment gateway credentials configured (MoMo, ZaloPay, VNPay)
- [ ] Sentry error monitoring configured
- [ ] Cloudflare DNS and CDN configured

### **Security Checklist**
- [ ] All environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] SSL certificates valid
- [ ] Database access restricted
- [ ] Admin access secured with 2FA

### **Performance Checklist**
- [ ] Database indexes optimized
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] Caching strategies implemented
- [ ] Load testing completed

## 🔧 DEPLOYMENT STEPS

### **Step 1: Environment Configuration**

Create production environment file:
```bash
cp .env.example .env.production
```

Configure production variables:
```env
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://rokdbot.com
NEXTAUTH_URL=https://rokdbot.com
NEXTAUTH_SECRET=your-super-secure-secret-key

# Database
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
DIRECT_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Redis Cache
REDIS_URL=redis://default:password@redis.upstash.io:6379

# Email Service
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@rokdbot.com

# Payment Gateways
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key

ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2

VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret

# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_BOOKINGS_CHANNEL=your_bookings_channel_id
DISCORD_SUPPORT_CHANNEL=your_support_channel_id

# Monitoring
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Security
API_SECRET_KEY=your_api_secret_key
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### **Step 2: Database Setup**

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### **Step 3: Build and Deploy**

```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production
```

### **Step 4: Verify Deployment**

```bash
# Check health endpoint
curl https://rokdbot.com/api/health

# Verify database connection
curl https://rokdbot.com/api/services

# Test payment endpoints
curl -X POST https://rokdbot.com/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🔍 MONITORING & MAINTENANCE

### **Health Monitoring**

Monitor these endpoints:
- `GET /api/health` - Overall system health
- `GET /api/services` - Database connectivity
- `GET /api/auth/session` - Authentication system

### **Key Metrics to Track**

**Business Metrics:**
- Daily/Monthly revenue
- Conversion rates
- Customer acquisition cost
- Average order value
- Customer lifetime value

**Technical Metrics:**
- API response times (<200ms)
- Error rates (<1%)
- Database query performance
- Payment success rates (>99%)
- Uptime (>99.9%)

**User Experience Metrics:**
- Page load times
- Core Web Vitals
- Mobile performance
- Bounce rates

### **Log Monitoring**

Important log patterns to monitor:
```bash
# Payment failures
grep "payment.*failed" /var/log/rok-services.log

# Authentication issues
grep "auth.*error" /var/log/rok-services.log

# Database errors
grep "database.*error" /var/log/rok-services.log

# High response times
grep "duration.*[5-9][0-9][0-9][0-9]" /var/log/rok-services.log
```

### **Automated Alerts**

Set up alerts for:
- Payment gateway failures
- Database connection issues
- High error rates (>5%)
- Slow response times (>500ms)
- Memory/CPU usage (>80%)
- Disk space (>90%)

## 🚨 INCIDENT RESPONSE

### **Payment Issues**

**Symptoms:** Payment failures, webhook timeouts
**Actions:**
1. Check payment gateway status
2. Verify webhook endpoints
3. Review payment logs
4. Contact gateway support if needed

**Rollback:** Disable affected payment method

### **Database Issues**

**Symptoms:** Connection timeouts, slow queries
**Actions:**
1. Check database metrics
2. Review slow query logs
3. Restart connections if needed
4. Scale database if required

**Rollback:** Switch to read-only mode

### **Authentication Issues**

**Symptoms:** Login failures, session errors
**Actions:**
1. Check NextAuth configuration
2. Verify JWT secrets
3. Review session storage
4. Clear problematic sessions

**Rollback:** Restart authentication service

## 📊 PERFORMANCE OPTIMIZATION

### **Database Optimization**

```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('bookings', 'payments', 'users');

-- Optimize frequently used queries
CREATE INDEX CONCURRENTLY idx_bookings_user_status 
ON bookings(user_id, status) 
WHERE status IN ('pending', 'confirmed');
```

### **Caching Strategy**

```typescript
// API response caching
export const revalidate = 300 // 5 minutes

// Database query caching
const services = await redis.get('services:all') || 
  await db.service.findMany()
```

### **CDN Configuration**

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.rokdbot.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  }
}
```

## 🔐 SECURITY BEST PRACTICES

### **API Security**

- Rate limiting: 100 requests/15 minutes per IP
- Input validation on all endpoints
- SQL injection prevention via Prisma
- XSS protection with CSP headers
- CSRF protection enabled

### **Data Protection**

- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper session management
- Regular security audits
- PCI DSS compliance for payments

### **Access Control**

- Role-based permissions
- Admin 2FA required
- API key rotation
- Regular access reviews
- Audit logging enabled

## 📈 SCALING GUIDELINES

### **Traffic Scaling**

**Current Capacity:** 1,000 concurrent users
**Scaling Triggers:**
- CPU usage >70%
- Memory usage >80%
- Response time >300ms
- Error rate >2%

**Scaling Actions:**
1. Horizontal scaling (add more instances)
2. Database read replicas
3. CDN optimization
4. Caching improvements

### **Revenue Scaling**

**15M VNĐ/month → 300M VNĐ/month:**
- Database: Scale to larger instance
- Payment processing: Add redundancy
- Customer support: Automate workflows
- Monitoring: Enhanced alerting

## 🔄 BACKUP & RECOVERY

### **Automated Backups**

```bash
# Daily database backup
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 tar -czf /backups/full-$(date +\%Y\%m\%d).tar.gz /app

# Backup retention (30 days)
find /backups -name "*.sql" -mtime +30 -delete
```

### **Recovery Procedures**

**Database Recovery:**
```bash
# Restore from backup
psql $DATABASE_URL < /backups/db-20240101.sql

# Verify data integrity
npm run db:verify
```

**Application Recovery:**
```bash
# Rollback to previous version
git checkout v20240101-120000
./scripts/deploy.sh production
```

## 📞 SUPPORT CONTACTS

**Technical Issues:**
- Primary: DevOps Team
- Secondary: Development Team
- Emergency: On-call engineer

**Business Issues:**
- Primary: Product Manager
- Secondary: Customer Success
- Emergency: CEO/CTO

**Payment Issues:**
- MoMo: support@momo.vn
- ZaloPay: support@zalopay.vn
- VNPay: support@vnpay.vn

## ✅ POST-DEPLOYMENT VERIFICATION

After deployment, verify:
- [ ] Website loads correctly
- [ ] Admin dashboard accessible
- [ ] Payment flows working
- [ ] Email notifications sending
- [ ] Discord bot responding
- [ ] Analytics tracking
- [ ] Error monitoring active
- [ ] Backup systems running

**🎉 Production deployment complete! Monitor closely for the first 24 hours.**
