# Cloudflare Configuration for rokdbot.com

## DNS Records
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy: ✅ Enabled (Orange cloud)

Type: CNAME
Name: www
Target: cname.vercel-dns.com  
Proxy: ✅ Enabled (Orange cloud)

Type: TXT
Name: @
Content: "v=spf1 include:_spf.google.com ~all"
(For future email setup)
```

## Speed Optimization Settings

### 1. Caching Rules
**Path**: `/*`
**Cache Level**: Standard
**Browser TTL**: 4 hours
**Edge TTL**: 2 hours

**Path**: `/api/*`
**Cache Level**: Bypass
**Browser TTL**: 0 seconds

**Path**: `/_next/static/*`
**Cache Level**: Cache Everything
**Browser TTL**: 1 year
**Edge TTL**: 1 year

### 2. Page Rules (in order)
1. **Pattern**: `rokdbot.com/_next/static/*`
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 year
   - Browser Cache TTL: 1 year

2. **Pattern**: `rokdbot.com/api/*`
   - Cache Level: Bypass

3. **Pattern**: `rokdbot.com/*`
   - Cache Level: Standard
   - Always Use HTTPS: On
   - Auto Minify: HTML, CSS, JS

### 3. Speed Settings
- **Auto Minify**: ✅ HTML, CSS, JavaScript
- **Brotli Compression**: ✅ Enabled
- **Early Hints**: ✅ Enabled
- **HTTP/2**: ✅ Enabled
- **HTTP/3 (QUIC)**: ✅ Enabled
- **0-RTT Connection Resumption**: ✅ Enabled

### 4. Optimization Settings
- **Polish**: ✅ Lossless
- **Mirage**: ✅ Enabled
- **Rocket Loader**: ❌ Disabled (can break React)
- **Enhanced HTTP/2 Prioritization**: ✅ Enabled

## Security Settings

### 1. SSL/TLS
- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: ✅ Enabled
- **HTTP Strict Transport Security (HSTS)**: ✅ Enabled
  - Max Age: 6 months
  - Include subdomains: ✅
  - Preload: ✅

### 2. Security Level
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes

### 3. Bot Fight Mode
- **Bot Fight Mode**: ✅ Enabled
- **Super Bot Fight Mode**: ✅ Enabled (if available)

### 4. WAF (Web Application Firewall)
**Custom Rules for Vietnamese Gaming Traffic:**

Rule 1: Allow Vietnamese IPs
```
(ip.geoip.country eq "VN") and (http.request.method eq "GET")
Action: Allow
```

Rule 2: Block suspicious patterns
```
(http.user_agent contains "bot" and not http.user_agent contains "Googlebot") or
(http.request.uri.path contains "wp-admin") or
(http.request.uri.path contains "phpmyadmin")
Action: Block
```

Rule 3: Rate limiting for API endpoints
```
(http.request.uri.path matches "^/api/.*")
Action: Rate Limit (10 requests per minute)
```

### 5. DDoS Protection
- **DDoS Protection**: ✅ Enabled (automatic)
- **Advanced DDoS Protection**: ✅ Enabled

## Performance Monitoring

### 1. Analytics
- **Web Analytics**: ✅ Enabled
- **Core Web Vitals**: ✅ Monitor

### 2. Speed Test Targets
- **Vietnamese Users**: Ho Chi Minh City, Hanoi
- **Target Metrics**:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

## Firewall Rules for Gaming Traffic

### Rule 1: Vietnamese Gaming Hours Priority
```
(ip.geoip.country eq "VN") and 
(http.request.timestamp.hour >= 18 and http.request.timestamp.hour <= 23)
Action: Allow with higher priority
```

### Rule 2: Mobile Gaming Traffic
```
(http.user_agent contains "Mobile") and 
(ip.geoip.country eq "VN")
Action: Allow
```

### Rule 3: Discord/Gaming Platform Referrers
```
(http.referer contains "discord.com") or
(http.referer contains "facebook.com/groups") or
(http.referer contains "zalo.me")
Action: Allow
```

## Page Rules for SEO

### Rule 1: Redirect www to non-www
```
Pattern: www.rokdbot.com/*
Redirect: https://rokdbot.com/$1
Status: 301 Permanent Redirect
```

### Rule 2: Force HTTPS
```
Pattern: http://rokdbot.com/*
Redirect: https://rokdbot.com/$1
Status: 301 Permanent Redirect
```

## Custom Headers for Security
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Monitoring & Alerts

### 1. Set up alerts for:
- Site downtime
- High error rates (>5%)
- Slow response times (>3s)
- DDoS attacks
- SSL certificate expiration

### 2. Weekly reports on:
- Traffic analytics
- Core Web Vitals
- Security events
- Cache hit ratio

## Notes for Implementation
1. Apply settings gradually and test each change
2. Monitor Core Web Vitals after each optimization
3. Test from Vietnamese IP addresses
4. Verify mobile performance specifically
5. Check Discord embed previews work correctly
