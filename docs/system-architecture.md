# System Architecture

**Project:** ROK Services
**Last Updated:** 2025-12-09

---

## 1. High-Level Architecture

```
                              INTERNET
                                  |
                    +-------------+-------------+
                    |                           |
              Cloudflare CDN              Discord OAuth
              (DDoS, Cache)                    |
                    |                          |
         +----------+----------+               |
         |                     |               |
    rokdbot.com          *.rokdbot.com         |
         |                     |               |
         +----------+----------+               |
                    |                          |
              +-----v-----+                    |
              |  Vercel   |<-------------------+
              | (Next.js) |
              +-----+-----+
                    |
    +---------------+---------------+---------------+
    |               |               |               |
+---v---+     +-----v-----+   +-----v-----+   +-----v-----+
|Prisma |     | Socket.io |   |  Resend   |   |  Sentry   |
|  ORM  |     | WebSocket |   |  (Email)  |   | (Monitor) |
+---+---+     +-----------+   +-----------+   +-----------+
    |
+---v---+
|Postgres|
|Supabase|
+---------+

    +---------------+---------------+---------------+
    |               |               |               |
+---v---+     +-----v-----+   +-----v-----+   +-----v-----+
| MoMo  |     |  VNPay    |   | ZaloPay   |   | R2/S3     |
|Gateway|     | Gateway   |   | Gateway   |   | Storage   |
+-------+     +-----------+   +-----------+   +-----------+
```

---

## 2. Component Architecture

### 2.1 Frontend Layer

```
src/app/ (Next.js App Router)
├── Public Pages (SSG/ISR)
│   ├── Homepage (/)
│   ├── Services (/services/*)
│   └── Static pages
│
├── Protected Pages (SSR with Auth)
│   ├── Dashboard (/dashboard/*)
│   └── Admin (/admin/*)
│
└── API Layer (/api/*)
    ├── Auth endpoints
    ├── Business endpoints
    └── Webhook handlers
```

### 2.2 Backend Layer

```
src/lib/ (Server Utilities)
├── auth/              # Authentication logic
├── payments/          # Payment gateway integrations
├── webhooks/          # Webhook processing
├── monitoring/        # Logging, Sentry
├── security/          # CSP, CSRF, rate limiting
└── storage/           # File upload handling

src/services/ (Business Logic)
├── BookingService     # Booking CRUD
├── PaymentService     # Payment processing
├── UserService        # User management
├── LeadService        # Lead management
└── DashboardService   # Analytics
```

### 2.3 Data Layer

```
prisma/schema.prisma
├── Core Models
│   ├── User
│   ├── Service / ServiceTier
│   ├── Booking
│   └── Payment
│
├── Supporting Models
│   ├── Lead
│   ├── Staff
│   ├── Communication
│   └── ServiceTask
│
└── System Models
    ├── Auth (Account, Session, Token)
    └── Logging (SystemLog, SecurityLog, AuditLog)
```

---

## 3. Communication Patterns

### 3.1 HTTP/REST API

```
Client ──────► Vercel Edge ──────► API Route ──────► Service ──────► Database
              (Middleware)        (Validation)      (Logic)        (Prisma)
                  │
                  ▼
            Rate Limiting
            Auth Verification
            Security Headers
```

**Request Flow:**
1. Request hits Cloudflare CDN
2. Edge middleware applies security headers
3. Auth middleware verifies session
4. Route handler validates input (Zod)
5. Service layer executes business logic
6. Prisma ORM handles database operations
7. Response returned with proper status

### 3.2 WebSocket (Socket.io)

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│ WS Auth  │────►│ Socket.io│
│(Browser) │     │(JWT Token│     │  Server  │
└──────────┘     └──────────┘     └────┬─────┘
                                       │
                                  ┌────▼────┐
                                  │  Rooms  │
                                  │ (User,  │
                                  │ Booking)│
                                  └─────────┘
```

**Events:**
- `booking:created` - New booking notification
- `booking:statusUpdate` - Status change notification
- `payment:update` - Payment status change
- `chat:message` - Real-time chat messages
- `notification:new` - General notifications

### 3.3 Webhook Processing

```
Payment Gateway ──────► /api/webhooks/{gateway}
                              │
                    ┌─────────▼─────────┐
                    │ Signature Verify  │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Replay Protection │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Rate Limiting     │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Process Event     │
                    │ (Transaction)     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Update DB      Send Email      WebSocket
                                        Broadcast
```

---

## 4. Authentication Flow

### 4.1 Credential Login

```
┌────────┐     ┌────────────┐     ┌────────────┐     ┌──────────┐
│ Client │────►│ /api/auth  │────►│ Validate   │────►│ Create   │
│        │     │ /signin    │     │ Credentials│     │ Session  │
└────────┘     └────────────┘     └────────────┘     └────┬─────┘
                                                          │
    ┌──────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────┐
│ 2FA Required?    │
│   ├─► No: Done   │
│   └─► Yes: ──────┼───────────────┐
└──────────────────┘               │
                                   ▼
                          ┌────────────────┐
                          │ Verify TOTP    │
                          │ or Backup Code │
                          └───────┬────────┘
                                  │
                                  ▼
                          ┌────────────────┐
                          │ Complete Login │
                          └────────────────┘
```

### 4.2 OAuth (Discord)

```
┌────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│ Client │────►│ Discord  │────►│Callback │────►│ Find/    │
│        │     │ OAuth    │     │ Handler │     │ Create   │
└────────┘     └──────────┘     └─────────┘     │ User     │
                                                └────┬─────┘
                                                     │
                                                     ▼
                                              ┌────────────┐
                                              │ Create     │
                                              │ Session    │
                                              └────────────┘
```

---

## 5. Payment Flow

### 5.1 Payment Creation

```
┌────────────┐     ┌─────────────┐     ┌─────────────┐
│ User       │────►│ POST        │────►│ Payment     │
│ Dashboard  │     │ /api/payment│     │ Service     │
└────────────┘     │ /create     │     └──────┬──────┘
                   └─────────────┘            │
                                              ▼
                                    ┌─────────────────┐
                                    │ Validate Booking│
                                    │ Check Duplicate │
                                    └────────┬────────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          │                  │                  │
                    ┌─────▼─────┐     ┌──────▼─────┐     ┌──────▼─────┐
                    │  VNPay    │     │   MoMo     │     │  ZaloPay   │
                    │  Gateway  │     │  Gateway   │     │  Gateway   │
                    └─────┬─────┘     └──────┬─────┘     └──────┬─────┘
                          │                  │                  │
                          └──────────────────┼──────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Return Payment  │
                                    │ URL to Client   │
                                    └─────────────────┘
```

### 5.2 Payment Confirmation

```
Payment Gateway ────► Webhook Endpoint
                            │
                  ┌─────────▼─────────┐
                  │ Verify Signature  │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │ $transaction()    │
                  │ ├─ Update Payment │
                  │ └─ Update Booking │
                  └─────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼────┐  ┌─────▼────┐  ┌─────▼─────┐
        │Send Email│  │ Discord  │  │ WebSocket │
        └──────────┘  │ Notify   │  │ Broadcast │
                      └──────────┘  └───────────┘
```

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```
┌──────────┐       ┌─────────────┐       ┌─────────┐
│   User   │──1:N──│   Booking   │──1:N──│ Payment │
└────┬─────┘       └──────┬──────┘       └─────────┘
     │                    │
     │                    │ 1:N
     │                    ▼
     │             ┌────────────────┐
     │             │ ServiceTask    │
     │             └────────────────┘
     │
     │ 1:1
     ▼
┌─────────┐
│  Staff  │
└─────────┘

┌─────────┐       ┌─────────────┐
│ Service │──1:N──│ ServiceTier │
└─────────┘       └─────────────┘

┌─────────┐       ┌─────────────┐
│  User   │──1:N──│    Lead     │
└─────────┘       └─────────────┘
```

### 6.2 Key Relationships

| From | To | Relationship | Description |
|------|-----|-------------|-------------|
| User | Booking | 1:N | User can have many bookings |
| User | Staff | 1:1 | User may be staff member |
| User | Lead | 1:N | User assigned to leads |
| Booking | Payment | 1:N | Booking can have multiple payments |
| Booking | ServiceTask | 1:N | Booking generates tasks |
| Service | ServiceTier | 1:N | Service has pricing tiers |
| ServiceTier | Booking | 1:N | Tier can have many bookings |

---

## 7. Security Architecture

### 7.1 Defense Layers

```
Layer 1: CDN (Cloudflare)
├── DDoS Protection
├── WAF Rules
├── Bot Management
└── SSL/TLS Termination

Layer 2: Edge Middleware
├── Security Headers (CSP, HSTS, X-Frame-Options)
├── CORS Configuration
└── Request Validation

Layer 3: API Layer
├── Authentication (NextAuth.js)
├── Rate Limiting (Upstash Redis)
├── CSRF Protection
└── Input Validation (Zod)

Layer 4: Service Layer
├── Authorization Checks
├── Business Logic Validation
└── Audit Logging

Layer 5: Data Layer
├── Parameterized Queries (Prisma)
├── Encryption at Rest
└── Connection Pooling
```

### 7.2 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NextAuth.js                             │
├─────────────────────────────────────────────────────────────┤
│  Providers                                                   │
│  ├── Credentials (Email/Password)                           │
│  │   ├── bcrypt (14 rounds)                                 │
│  │   ├── Password History (last 10)                         │
│  │   └── Brute Force Protection                             │
│  └── Discord OAuth                                           │
├─────────────────────────────────────────────────────────────┤
│  Session                                                     │
│  ├── JWT Strategy                                           │
│  ├── 30-day expiry                                          │
│  └── Security Context (IP, User Agent)                      │
├─────────────────────────────────────────────────────────────┤
│  2FA (Optional)                                              │
│  ├── TOTP (Time-based OTP)                                  │
│  └── Backup Codes (10 codes)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
                          GitHub
                            │
                            ▼ (Push to main)
                     ┌──────────────┐
                     │ GitHub       │
                     │ Actions CI   │
                     └──────┬───────┘
                            │
                            ▼ (Deploy)
                     ┌──────────────┐
                     │   Vercel     │
                     │  Platform    │
                     ├──────────────┤
                     │ Serverless   │
                     │ Functions    │
                     │              │
                     │ Edge Network │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │ Supabase  │ │   Redis   │ │    R2     │
        │ Postgres  │ │ (Upstash) │ │ (Storage) │
        └───────────┘ └───────────┘ └───────────┘
```

### 8.2 Environment Configuration

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| Development | localhost:3000 | Local/Supabase Dev | Feature development |
| Preview | *.vercel.app | Supabase Dev | PR previews |
| Production | rokdbot.com | Supabase Prod | Live system |

---

## 9. Monitoring & Observability

### 9.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Sentry     │  │   Vercel     │  │   Custom     │       │
│  │              │  │  Analytics   │  │   Logging    │       │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤       │
│  │ Error Track  │  │ Web Vitals   │  │ SystemLog    │       │
│  │ Performance  │  │ Function     │  │ SecurityLog  │       │
│  │ Release      │  │ Metrics      │  │ AuditLog     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Alert Configuration

| Metric | Threshold | Channel |
|--------|-----------|---------|
| Error Rate | > 1% | Sentry + Discord |
| Response Time (p95) | > 500ms | Sentry |
| Uptime | < 99.9% | Discord |
| Failed Payments | > 5/hour | Discord + Email |
| Failed Logins | > 10/min | SecurityLog |

---

## 10. Scalability Considerations

### 10.1 Current Limits

| Component | Limit | Scaling Strategy |
|-----------|-------|------------------|
| Vercel Functions | 10s timeout | Edge functions for simple ops |
| Database Connections | 100 pooled | PgBouncer, connection pooling |
| WebSocket | Single instance | Redis adapter for multi-instance |
| Rate Limiting | In-memory | Already using Upstash Redis |
| File Storage | R2 limits | Sufficient for current scale |

### 10.2 Future Scaling Path

1. **Phase 1 (Current):** Single Vercel + Supabase
2. **Phase 2 (100+ users):** Add Redis caching, optimize queries
3. **Phase 3 (1000+ users):** WebSocket scaling with Redis adapter
4. **Phase 4 (10000+ users):** Database read replicas, CDN caching

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

| Data | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Database | Daily | 30 days | Supabase automated |
| File Storage | Continuous | Indefinite | R2 replication |
| Logs | Real-time | 90 days | Sentry/Vercel |

### 11.2 Recovery Procedures

1. **Database Failure:** Restore from Supabase point-in-time backup
2. **Vercel Outage:** DNS failover to static maintenance page
3. **Payment Gateway Outage:** Fallback to alternate gateway
4. **File Storage:** R2 has built-in redundancy

---

## 12. API Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Payment Operations | 20 requests | 1 minute |
| General API | 60 requests | 1 minute |
| Webhooks (per gateway) | 50 requests | 1 minute |
| File Upload | 10 requests | 1 minute |
