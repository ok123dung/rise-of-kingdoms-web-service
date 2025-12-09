# Project Overview - Product Development Requirements

**Project:** ROK Services Website
**Domain:** rokdbot.com
**Version:** 1.0.0
**Last Updated:** 2025-12-09

---

## 1. Product Vision

ROK Services is a professional gaming services platform for Rise of Kingdoms (RoK) players in Vietnam. The platform connects Vietnamese gamers with expert service providers offering account development, training, and strategic consulting.

### Target Market
- **Primary:** Vietnamese Rise of Kingdoms players (casual to competitive)
- **Secondary:** Southeast Asian RoK gaming community
- **Demographics:** 18-35 years, mobile-first users, Vietnamese language preference

### Value Proposition
- Professional RoK gaming services with transparent pricing
- Secure payment processing via Vietnamese gateways (MoMo, VNPay, ZaloPay)
- Real-time order tracking and customer communication
- Trusted platform with verified service providers

---

## 2. MVP Feature Set

### 2.1 Core Features (Implemented)

| Feature | Status | Description |
|---------|--------|-------------|
| Service Catalog | Complete | 8 RoK services with tiered pricing |
| User Authentication | Complete | Email/password + Discord OAuth + 2FA |
| Booking System | Complete | Service booking with requirements capture |
| Payment Processing | Complete | MoMo, VNPay, ZaloPay, Bank Transfer |
| Customer Dashboard | Complete | Bookings, payments, profile management |
| Admin Dashboard | Complete | Order management, analytics, user management |
| Real-time Updates | Complete | WebSocket notifications for booking/payment events |
| Lead Management | Complete | Lead capture, scoring, conversion tracking |

### 2.2 Service Offerings

1. **Account Leveling** - Power grinding and commander development
2. **Migration Services** - Kingdom transfers and restart assistance
3. **Training & Coaching** - PvP strategy and battle tactics
4. **Strategic Consulting** - Alliance management and KvK planning
5. **Resource Management** - Efficient resource allocation
6. **Commander Optimization** - Skill tree and pairing optimization
7. **Event Participation** - Ark of Osiris, Sunset Canyon support
8. **Alliance Services** - Recruitment and management assistance

---

## 3. Technical Requirements

### 3.1 Platform Requirements

| Requirement | Specification |
|-------------|---------------|
| Node.js | v20.x (LTS) |
| Database | PostgreSQL 15+ |
| Hosting | Vercel (serverless) |
| CDN/Security | Cloudflare |
| Storage | Cloudflare R2 / AWS S3 |

### 3.2 Browser Support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile Safari (iOS 14+), Chrome Mobile (Android 10+)

### 3.3 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Largest Contentful Paint (LCP) | < 2.5s | Meeting |
| First Input Delay (FID) | < 100ms | Meeting |
| Cumulative Layout Shift (CLS) | < 0.1 | Meeting |
| Time to Interactive (TTI) | < 3s | Meeting |
| Mobile Performance Score | > 90 | 90+ |

---

## 4. Security Requirements

### 4.1 Authentication Security
- **Password Policy:** Min 12 chars, uppercase, lowercase, numbers, special chars
- **Password Hashing:** bcrypt with 14 rounds (OWASP 2024 standard)
- **2FA:** TOTP-based with backup codes
- **Brute Force Protection:** 5 failed attempts = 15-minute lockout
- **Password History:** Prevents reuse of last 10 passwords

### 4.2 Application Security
- **CSP Headers:** Configured with strict directives
- **CSRF Protection:** Token-based for all mutations
- **XSS Prevention:** Input sanitization + React auto-escaping
- **SQL Injection:** Prevented via Prisma ORM parameterization
- **Rate Limiting:** Auth (5/min), Payments (20/min), API (60/min)

### 4.3 Payment Security
- **HMAC Verification:** All webhook signatures verified
- **Replay Protection:** Timestamp + idempotency checks
- **Transaction Integrity:** Database transactions for atomic updates
- **Audit Logging:** All payment events logged

---

## 5. Integration Requirements

### 5.1 Payment Gateways

| Gateway | Status | Features |
|---------|--------|----------|
| MoMo | Complete | QR code, wallet payments, webhooks |
| VNPay | Complete | Bank cards, QR, IPN callbacks |
| ZaloPay | Complete | Wallet, bank transfer, callbacks |
| Bank Transfer | Complete | Manual verification workflow |

### 5.2 External Services

| Service | Purpose | Status |
|---------|---------|--------|
| Resend | Transactional emails | Configured |
| Discord | OAuth + notifications | Configured |
| Sentry | Error monitoring | Configured |
| Cloudflare R2 | File storage | Configured |
| Upstash Redis | Rate limiting cache | Configured |

---

## 6. Success Metrics

### 6.1 Business Metrics

| Metric | Target (Q1) | Target (Q2) |
|--------|-------------|-------------|
| Monthly Active Users | 500 | 2,000 |
| Monthly Revenue | 50M VND | 200M VND |
| Conversion Rate | 3% | 5% |
| Customer Satisfaction | > 4.5/5 | > 4.7/5 |
| Repeat Customer Rate | 30% | 50% |

### 6.2 Technical Metrics

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| API Response Time (p95) | < 200ms |
| Error Rate | < 0.1% |
| Test Coverage | > 80% |

---

## 7. Acceptance Criteria

### 7.1 Launch Readiness Checklist

**Infrastructure:**
- [x] Database deployed and accessible
- [x] Vercel deployment configured
- [x] Domain DNS configured
- [x] SSL/HTTPS enforced
- [x] CDN caching enabled

**Security:**
- [x] Security headers configured
- [x] Authentication system functional
- [x] 2FA available for users
- [x] Rate limiting active
- [x] Webhook security implemented

**Features:**
- [x] Service catalog displayed
- [x] User registration/login functional
- [x] Booking flow complete
- [x] Payment processing functional
- [x] Email notifications sending
- [x] Admin dashboard accessible

**Quality:**
- [x] No critical bugs
- [x] Mobile responsive design
- [x] Vietnamese language support
- [x] Performance targets met

---

## 8. Constraints & Assumptions

### 8.1 Constraints
- Vietnamese payment gateways only (regulatory requirement)
- Single language (Vietnamese) for MVP
- Manual KYC verification for high-value transactions
- Service capacity limited by provider availability

### 8.2 Assumptions
- Users have stable internet connection
- Mobile devices support modern browsers
- Payment gateway APIs remain stable
- Discord remains popular in RoK community

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Payment gateway outage | Low | High | Multiple gateway fallback |
| Database performance issues | Medium | Medium | Query optimization, caching |
| Security breach | Low | Critical | Security hardening, monitoring |
| Service provider unavailability | Medium | Medium | Provider pool management |
| Competitor emergence | High | Medium | Feature differentiation, quality focus |

---

## 10. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-03 | Documentation System | Initial PDR creation |
