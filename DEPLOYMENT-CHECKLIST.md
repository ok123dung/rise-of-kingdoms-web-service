# 📋 DEPLOYMENT CHECKLIST

## ✅ Đã hoàn thành:
- [x] Code đã push GitHub
- [x] Database Supabase đã kết nối
- [x] Admin user đã tạo
- [x] Services data đã seed
- [x] Security features đã setup
- [x] Cron job đã fix cho Hobby plan

## 🚀 Cần làm ngay:

### 1. Deploy Vercel (5 phút)
1. Vào https://vercel.com/new
2. Import `ok123dung/rok-services`
3. Add environment variables:
```env
DATABASE_URL=postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
NEXTAUTH_SECRET=NW1q8qogTUIzluVfzKJTk6putP2Jq8ReGRq2+on8IeM=
NEXTAUTH_URL=https://rokdbot.com
NEXT_PUBLIC_SITE_URL=https://rokdbot.com
NEXT_PUBLIC_SUPABASE_URL=https://inondhimzqiguvdhyjng.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Xc6vXnPpEJcxxPWCnit9zg_f71ZCiMP
```

### 2. Test Production
- Login: admin@rokdbot.com / Admin123!@#
- Check all pages load
- Test booking form
- Verify mobile responsive

### 3. Domain Setup
- Add domain in Vercel
- Update DNS records
- Wait for SSL certificate

## 📝 Cần làm sau:

### Payment Integration
- [ ] MoMo credentials
- [ ] ZaloPay setup
- [ ] VNPay merchant

### Communication
- [ ] Resend API key for email
- [ ] Discord bot token
- [ ] Setup webhooks

### Monitoring
- [ ] Sentry DSN
- [ ] Google Analytics
- [ ] Uptime monitoring

### Content
- [ ] Update service descriptions
- [ ] Add real testimonials
- [ ] Upload service images
- [ ] Create blog posts

## 🔧 Admin Tasks:

### Users Management
```sql
-- View all users
SELECT * FROM users;

-- Make user admin
UPDATE staff SET role = 'admin' WHERE user_id = 'USER_ID';
```

### Services Management
- Edit prices in Supabase dashboard
- Update service features
- Add new service tiers

### Bookings
- Monitor new bookings
- Update booking status
- Process payments

## 📞 Support Info:

- **Database**: https://supabase.com/dashboard/project/inondhimzqiguvdhyjng
- **Vercel**: https://vercel.com/dashboard
- **GitHub**: https://github.com/ok123dung/rok-services
- **Local Dev**: http://localhost:3000

## ⚠️ Important Notes:

1. **Never commit** `.env.local` to Git
2. **Backup database** regularly from Supabase
3. **Monitor costs** on Vercel/Supabase dashboards
4. **Update dependencies** monthly for security

---
Last updated: 2025-08-17