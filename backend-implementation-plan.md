# BACKEND IMPLEMENTATION PLAN - ROK SERVICES

## 🎯 EXECUTIVE SUMMARY

**Dự án:** Backend cho website dịch vụ Rise of Kingdoms (rokdbot.com)
**Mục tiêu revenue:** 15.6-30M VNĐ/tháng
**Timeline:** 8 tuần (2 tháng)
**Budget ước tính:** 15,000-25,000 USD
**Target users:** 1000+ concurrent Vietnamese gamers

## 📋 UPDATED ROADMAP & TIMELINE

### **PHASE 1: CORE INFRASTRUCTURE (Tuần 1-2) - CRITICAL**
**Mục tiêu:** Thiết lập nền tảng backend cơ bản
**Timeline:** 14 ngày
**Priority:** P0 (Blocking revenue generation)

#### **Week 1: Database & API Foundation**
- **Day 1-2:** Prisma setup + PostgreSQL schema
- **Day 3-4:** Basic API endpoints (users, services, bookings)
- **Day 5-7:** Authentication system (NextAuth.js + Discord OAuth)

#### **Week 2: CRUD Operations & Validation**
- **Day 8-10:** Complete CRUD operations cho tất cả entities
- **Day 11-12:** Input validation và error handling
- **Day 13-14:** API testing và documentation

### **PHASE 2: PAYMENT INTEGRATION (Tuần 3-4) - REVENUE CRITICAL**
**Mục tiêu:** Tích hợp thanh toán Việt Nam
**Timeline:** 14 ngày
**Priority:** P0 (Direct revenue impact)

#### **Week 3: Vietnamese Payment Gateways**
- **Day 15-17:** MoMo integration + webhook handling
- **Day 18-19:** ZaloPay implementation
- **Day 20-21:** VNPay banking integration

#### **Week 4: Payment Management**
- **Day 22-24:** Order tracking và payment status
- **Day 25-26:** Refund processing system
- **Day 27-28:** Revenue reporting dashboard

### **PHASE 3: AUTOMATION & COMMUNICATION (Tuần 5-6) - CUSTOMER EXPERIENCE**
**Mục tiêu:** Tự động hóa customer journey
**Timeline:** 14 ngày
**Priority:** P1 (Customer satisfaction)

#### **Week 5: Discord Bot & Email System**
- **Day 29-31:** Discord bot cho notifications
- **Day 32-33:** Email automation system
- **Day 34-35:** Customer onboarding workflow

#### **Week 6: Lead Management & CRM**
- **Day 36-38:** Lead scoring system
- **Day 39-40:** Automated follow-up sequences
- **Day 41-42:** Customer communication tracking

### **PHASE 4: ADMIN DASHBOARD (Tuần 7-8) - OPERATIONS**
**Mục tiêu:** Business management tools
**Timeline:** 14 ngày
**Priority:** P2 (Operational efficiency)

#### **Week 7: Admin Interface**
- **Day 43-45:** Booking management dashboard
- **Day 46-47:** Customer management CRM
- **Day 48-49:** Revenue analytics interface

#### **Week 8: Production Readiness**
- **Day 50-52:** Security implementation
- **Day 53-54:** Performance optimization
- **Day 55-56:** Deployment và monitoring setup

## 🏗️ TECHNICAL ARCHITECTURE

### **Technology Stack (Updated)**
```typescript
// Core Stack
- Runtime: Node.js 20+ (LTS)
- Framework: Next.js 14 API Routes
- Database: Supabase PostgreSQL (managed)
- ORM: Prisma 5.x
- Authentication: NextAuth.js v5
- Caching: Upstash Redis
- File Storage: Cloudflare R2
- Email: Resend (Vietnamese support)
- Monitoring: Sentry + LogRocket

// Vietnamese Payment Gateways
- MoMo: Official SDK
- ZaloPay: REST API integration
- VNPay: Banking gateway
- Stripe: International backup

// Communication
- Discord: discord.js v14
- Email: Resend templates
- SMS: Twilio (Vietnamese numbers)

// Deployment
- Backend: Railway (Vietnamese region)
- Database: Supabase (Singapore region)
- CDN: Cloudflare (Vietnamese edge)
```

### **Database Schema (Enhanced)**
```sql
-- Enhanced Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  discord_username VARCHAR(255),
  discord_id VARCHAR(255),
  rok_player_id VARCHAR(255),
  rok_kingdom VARCHAR(255),
  rok_power BIGINT,
  preferred_language VARCHAR(5) DEFAULT 'vi',
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  base_price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'VND',
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Service tiers table
CREATE TABLE service_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  original_price DECIMAL(12,2),
  features JSONB NOT NULL,
  limitations JSONB,
  is_popular BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  max_customers INTEGER,
  current_customers INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, slug)
);

-- Enhanced Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  service_tier_id UUID REFERENCES service_tiers(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  booking_details JSONB,
  customer_requirements TEXT,
  start_date DATE,
  end_date DATE,
  assigned_staff_id UUID,
  completion_percentage INTEGER DEFAULT 0,
  customer_rating INTEGER,
  customer_feedback TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE RESTRICT,
  payment_number VARCHAR(20) UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  payment_method VARCHAR(50) NOT NULL,
  payment_gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  gateway_order_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  failure_reason TEXT,
  gateway_response JSONB,
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(12,2) DEFAULT 0,
  refund_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Communications table
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'email', 'discord', 'sms', 'system'
  channel VARCHAR(100), -- specific channel/address
  subject VARCHAR(255),
  content TEXT NOT NULL,
  template_id VARCHAR(100),
  template_data JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead tracking table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  phone VARCHAR(20),
  full_name VARCHAR(255),
  service_interest VARCHAR(100),
  source VARCHAR(100), -- 'website', 'discord', 'referral'
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  lead_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new',
  assigned_to UUID,
  notes TEXT,
  converted_at TIMESTAMP,
  converted_booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Staff/Admin table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'consultant', 'support'
  permissions JSONB,
  specializations JSONB, -- RoK services they can handle
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_transaction_id ON payments(gateway_transaction_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_communications_booking_id ON communications(booking_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

## 💰 COST ANALYSIS & RESOURCE REQUIREMENTS

### **Monthly Operational Costs**
```
Infrastructure:
- Supabase Pro: $25/month (database)
- Railway Pro: $20/month (backend hosting)
- Upstash Redis: $10/month (caching)
- Cloudflare R2: $5/month (file storage)
- Resend: $20/month (email service)
- Sentry: $26/month (error monitoring)
Total Infrastructure: $106/month

Payment Processing:
- MoMo: 1.5% per transaction
- ZaloPay: 1.8% per transaction  
- VNPay: 1.2% per transaction
Estimated: 1.5% of revenue = 225k-450k VNĐ/month

Development Resources:
- 1 Senior Full-stack Developer: $4,000/month
- 1 DevOps Engineer (part-time): $1,500/month
Total Development: $5,500/month

Total Monthly Cost: ~$6,000/month
```

### **One-time Development Costs**
```
Phase 1 (Core): $6,000
Phase 2 (Payments): $8,000
Phase 3 (Automation): $5,000
Phase 4 (Admin): $4,000
Total Development: $23,000
```

## 🔒 SECURITY & COMPLIANCE

### **Security Implementation Checklist**
- ✅ Input validation và sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting (Redis-based)
- ✅ JWT token security
- ✅ Password hashing (bcrypt)
- ✅ API authentication
- ✅ HTTPS enforcement
- ✅ Data encryption at rest

### **Vietnamese Compliance Requirements**
- ✅ Personal Data Protection (PDPA Vietnam)
- ✅ Payment Card Industry (PCI DSS)
- ✅ Anti-Money Laundering (AML)
- ✅ Know Your Customer (KYC) basic
- ✅ Tax reporting compliance
- ✅ Consumer protection laws

## 📊 PERFORMANCE TARGETS

### **API Performance**
- Response time: <200ms (95th percentile)
- Throughput: 1000+ requests/second
- Uptime: 99.9%
- Database queries: <50ms average

### **Scalability Targets**
- Concurrent users: 1000+
- Daily transactions: 500+
- Monthly revenue processing: 300M VNĐ
- Data storage: 100GB+

## 🚨 RISK ASSESSMENT & MITIGATION

### **High Risk Items**
1. **Payment Gateway Integration**
   - Risk: API changes, downtime
   - Mitigation: Multiple gateways, fallback systems

2. **Data Security**
   - Risk: Data breaches, compliance violations
   - Mitigation: Encryption, regular audits, compliance monitoring

3. **Scalability Issues**
   - Risk: Performance degradation under load
   - Mitigation: Load testing, auto-scaling, caching

### **Medium Risk Items**
1. **Third-party Dependencies**
   - Risk: Service outages, API changes
   - Mitigation: Vendor diversification, monitoring

2. **Customer Support Load**
   - Risk: Overwhelming support requests
   - Mitigation: Automation, self-service tools

## ✅ SUCCESS CRITERIA VALIDATION

### **Technical Metrics**
- ✅ 1000+ concurrent users supported
- ✅ >99% payment processing success rate
- ✅ <200ms API response time for Vietnamese users
- ✅ 99.9% uptime with monitoring
- ✅ Scalable architecture 15M → 300M VNĐ/tháng

### **Business Metrics**
- ✅ Complete frontend integration
- ✅ Immediate customer onboarding capability
- ✅ Revenue generation ready
- ✅ Vietnamese market optimization
- ✅ Cost-effective operation

**NEXT STEP: Bắt đầu Phase 1 implementation với Prisma setup và database schema.**
