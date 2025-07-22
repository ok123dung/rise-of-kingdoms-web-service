# Production Environment Variables Setup

## Vercel Environment Variables

### 1. Required for Production
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://rokdbot.com
NEXT_PUBLIC_SITE_NAME="RoK Services - Dịch vụ Rise of Kingdoms chuyên nghiệp"

# Google Analytics (Get from Google Analytics 4)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Contact Information
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/rokservices
NEXT_PUBLIC_CONTACT_EMAIL=contact@rokdbot.com
NEXT_PUBLIC_SUPPORT_PHONE=+84123456789

# Business Information
NEXT_PUBLIC_COMPANY_NAME="RoK Services Vietnam"
NEXT_PUBLIC_COMPANY_ADDRESS="Hồ Chí Minh, Việt Nam"

# Feature Flags
NEXT_PUBLIC_ENABLE_BOOKING_FORM=true
NEXT_PUBLIC_ENABLE_PAYMENT_INTEGRATION=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### 2. How to Set in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with:
   - **Name**: Variable name (e.g., NEXT_PUBLIC_SITE_URL)
   - **Value**: Variable value (e.g., https://rokdbot.com)
   - **Environment**: Production, Preview, Development

### 3. Google Analytics Setup
1. Go to [Google Analytics](https://analytics.google.com)
2. Create new property for "rokdbot.com"
3. Get Measurement ID (format: G-XXXXXXXXXX)
4. Add to Vercel environment variables

## Testing Checklist After Deployment

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] /services page displays all 8 services
- [ ] /services/strategy page shows pricing tiers
- [ ] All images and icons load
- [ ] Mobile responsive design works
- [ ] Contact forms are functional

### 2. SEO & Performance
- [ ] Google Analytics tracking works
- [ ] Structured data validates (use Google Rich Results Test)
- [ ] Sitemap accessible at /sitemap.xml
- [ ] Robots.txt accessible at /robots.txt
- [ ] Core Web Vitals pass (use PageSpeed Insights)
- [ ] Meta tags display correctly in social shares

### 3. Security & SSL
- [ ] HTTPS redirects work
- [ ] SSL certificate is valid
- [ ] Security headers are present
- [ ] No mixed content warnings

### 4. Vietnamese Gaming Specific
- [ ] Vietnamese characters display correctly
- [ ] Pricing in VNĐ shows properly
- [ ] Discord links work
- [ ] Mobile performance good (most RoK players use mobile)

## Google Analytics 4 Configuration

### 1. Enhanced Ecommerce Events
```javascript
// Service view tracking
gtag('event', 'view_item', {
  currency: 'VND',
  value: 750000,
  items: [{
    item_id: 'strategy_basic',
    item_name: 'Basic Strategy Consulting',
    category: 'RoK Services',
    price: 750000
  }]
});

// Contact form submission
gtag('event', 'generate_lead', {
  currency: 'VND',
  value: 750000,
  lead_type: 'contact_form'
});
```

### 2. Custom Dimensions
- **Service Type**: strategy, alliance, commander, etc.
- **User Type**: new_visitor, returning_visitor
- **Traffic Source**: discord, facebook, organic
- **Device Type**: mobile, desktop, tablet

### 3. Goals to Track
- Contact form submissions
- Service page views
- Pricing tier selections
- Discord link clicks
- Phone number clicks

## Performance Monitoring Setup

### 1. Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 2. Tools to Use
- Google PageSpeed Insights
- GTmetrix
- WebPageTest (test from Vietnam)
- Lighthouse CI

### 3. Monitoring Schedule
- Daily: Uptime monitoring
- Weekly: Performance audit
- Monthly: SEO audit and ranking check

## SEO Optimization Checklist

### 1. Technical SEO
- [ ] XML sitemap submitted to Google Search Console
- [ ] Robots.txt configured correctly
- [ ] Structured data implemented
- [ ] Meta descriptions under 160 characters
- [ ] Title tags under 60 characters
- [ ] Alt text for all images

### 2. Vietnamese SEO Keywords
Primary keywords to track:
- "dịch vụ rise of kingdoms"
- "tư vấn chiến thuật rok"
- "rise of kingdoms việt nam"
- "coaching rise of kingdoms"
- "farm gem rok"

### 3. Local SEO
- Google My Business (if applicable)
- Vietnamese gaming forums mentions
- Discord community engagement

## Security Monitoring

### 1. Cloudflare Security Events
Monitor for:
- DDoS attacks
- Bot traffic patterns
- Suspicious IP addresses
- Failed login attempts (when backend is added)

### 2. SSL Certificate Monitoring
- Auto-renewal enabled
- Certificate transparency logs
- Mixed content detection

### 3. Uptime Monitoring
Tools to use:
- Cloudflare Analytics
- UptimeRobot
- Pingdom

## Backup & Recovery Plan

### 1. Code Backup
- GitHub repository (primary)
- Vercel automatic deployments
- Local development environment

### 2. Content Backup
- Regular exports of any dynamic content
- Database backups (when backend is added)
- Image and asset backups

### 3. Recovery Procedures
- Rollback to previous Vercel deployment
- DNS failover procedures
- Emergency contact procedures

## Launch Day Checklist

### 1. Pre-Launch (Day -1)
- [ ] Final testing on staging environment
- [ ] DNS propagation check
- [ ] SSL certificate validation
- [ ] Performance baseline measurement
- [ ] Analytics tracking verification

### 2. Launch Day
- [ ] Switch DNS to production
- [ ] Monitor error rates
- [ ] Check Core Web Vitals
- [ ] Verify all forms work
- [ ] Test from multiple devices/locations
- [ ] Social media announcement ready

### 3. Post-Launch (Day +1)
- [ ] 24-hour performance review
- [ ] Error log analysis
- [ ] User feedback collection
- [ ] SEO indexing status check
- [ ] Analytics data verification
