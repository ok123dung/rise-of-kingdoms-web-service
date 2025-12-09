# Codebase Summary

**Project:** ROK Services
**Total Files:** ~221 TypeScript files
**Lines of Code:** ~41,000
**Last Updated:** 2025-12-09

---

## 1. Project Structure Overview

```
rok-services/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/                # API Routes (~50 endpoints)
│   │   ├── auth/               # Authentication pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── dashboard/          # Customer dashboard
│   │   └── [public pages]/     # Public pages (services, contact, etc.)
│   ├── components/             # React components (77 files)
│   ├── services/               # Business logic services (7 files)
│   ├── lib/                    # Utilities and integrations (~50 files)
│   ├── hooks/                  # Custom React hooks (4 files)
│   └── types/                  # TypeScript definitions (7 files)
├── prisma/
│   ├── schema.prisma           # Database schema (20 models)
│   └── migrations/             # Database migrations
├── public/                     # Static assets
├── tests/                      # Test files
└── docs/                       # Documentation
```

---

## 2. Application Layer (src/app/)

### 2.1 API Routes

**Authentication (`/api/auth/`):**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth.js handler |
| `/api/auth/signup` | POST | User registration |
| `/api/auth/reset-password` | POST | Password reset |
| `/api/auth/2fa/setup` | POST | 2FA TOTP setup |
| `/api/auth/2fa/verify` | POST | 2FA verification |
| `/api/auth/2fa/disable` | POST | 2FA disable |
| `/api/auth/ws-token` | GET | WebSocket token generation |

**Payments (`/api/payments/`):**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/payments/create` | POST | Create payment order |
| `/api/payments/vnpay/ipn` | POST | VNPay IPN webhook |

**Webhooks (`/api/webhooks/`):**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/webhooks/vnpay` | POST | VNPay webhook processor |
| `/api/webhooks/momo` | POST | MoMo webhook processor |
| `/api/webhooks/zalopay` | POST | ZaloPay callback handler |

**User Operations (`/api/user/`):**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/user/profile` | GET/PATCH | Profile CRUD |
| `/api/user/payments` | GET | Payment history |
| `/api/user/payments/[id]` | GET | Payment details |
| `/api/user/bookings` | GET | User bookings |
| `/api/user/bookings/[id]` | GET | Booking details |

**Services (`/api/services/`):**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/services` | GET | List services |
| `/api/services/[slug]` | GET | Service details |

**Files (`/api/files/`, `/api/upload/`):**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/files` | GET | List files |
| `/api/files/[key]` | GET | Download file |
| `/api/upload` | POST | Generic upload |
| `/api/upload/image` | POST | Image upload |
| `/api/upload/avatar` | POST | Avatar upload |

**Admin & Monitoring:**
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/webhooks` | GET | Webhook management |
| `/api/health` | GET | Health check |
| `/api/health/db` | GET | Database health |
| `/api/leads` | GET/POST | Lead management |
| `/api/cron/webhooks` | POST | Webhook retry cron |

### 2.2 Page Routes

**Public Pages:**
- `/` - Homepage
- `/about` - About page
- `/services` - Services listing
- `/services/[slug]` - Service detail
- `/services/strategy` - Strategy consulting
- `/guides` - Guides page
- `/contact` - Contact form
- `/privacy`, `/terms` - Legal pages

**Authentication Pages:**
- `/auth/signin` - Login
- `/auth/signup` - Registration
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Password reset
- `/auth/error` - Auth error page

**Customer Dashboard (`/dashboard/`):**
- `/dashboard` - Overview
- `/dashboard/bookings` - Bookings list
- `/dashboard/bookings/[id]` - Booking detail
- `/dashboard/payments` - Payment history
- `/dashboard/payments/[id]` - Payment detail
- `/dashboard/profile` - Profile management
- `/dashboard/security` - 2FA settings
- `/dashboard/settings` - Preferences
- `/dashboard/messages` - Chat interface
- `/dashboard/notifications` - Notifications
- `/dashboard/files` - File management
- `/dashboard/support` - Support tickets
- `/dashboard/renewals` - Subscription renewals

**Admin Dashboard:**
- `/admin` - Admin home
- `/admin/dashboard` - Analytics dashboard

---

## 3. Components Layer (src/components/)

### 3.1 Component Organization

| Directory | Count | Purpose |
|-----------|-------|---------|
| `/admin` | 7 | Admin dashboard components |
| `/analytics` | 3 | Analytics tracking components |
| `/booking` | 5 | Booking flow components |
| `/customer` | 6 | Customer dashboard components |
| `/dynamic` | 4 | Dynamic/lazy-loaded components |
| `/layout` | 2 | Header, Footer |
| `/mobile` | 3 | Mobile-specific components |
| `/modals` | 2 | Modal dialogs |
| `/payment` | 7 | Payment flow components |
| `/performance` | 6 | Performance monitoring |
| `/profile` | 3 | Profile management |
| `/revenue` | 2 | Revenue tracking |
| `/sections` | 3 | Homepage sections |
| `/security` | 2 | Security components |
| `/seo` | 2 | SEO components |
| `/testing` | 2 | Testing utilities |
| `/ui` | 15+ | Reusable UI components |

### 3.2 Key Components

**Authentication:**
- `TwoFactorSetup.tsx` - 2FA TOTP setup with QR code
- `TwoFactorVerify.tsx` - 2FA verification modal

**Real-time:**
- `RealtimeNotifications.tsx` - WebSocket notification handler
- `BookingChat.tsx` - Real-time booking chat

**File Handling:**
- `FileUpload.tsx` - File upload with R2 integration
- `AvatarUpload.tsx` - Avatar upload component

**Error Handling:**
- `ErrorBoundary.tsx` - React error boundary
- `ErrorBoundaryWrapper.tsx` - Error boundary wrapper

**Providers:**
- `Providers.tsx` - Context providers wrapper
- `PWAProvider.tsx` - PWA service worker
- `NonceProvider.tsx` - CSP nonce provider

---

## 4. Services Layer (src/services/)

| Service | File | Responsibility |
|---------|------|----------------|
| BookingService | `booking.service.ts` | Booking CRUD, validation, notifications |
| PaymentService | `payment.service.ts` | Payment processing, gateway integration |
| UserService | `user.service.ts` | User CRUD, profile management |
| DashboardService | `dashboard.service.ts` | Analytics aggregation |
| LeadService | `lead.service.ts` | Lead management, scoring |
| CommunicationService | `communication.service.ts` | Email/notification tracking |
| ServiceTaskService | `service-task.service.ts` | Task management for orders |

---

## 5. Library Layer (src/lib/)

### 5.1 Core Libraries

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth configuration, password handling |
| `auth-enhanced.ts` | Enhanced auth with security features |
| `auth-security.ts` | Security-specific auth utilities |
| `db.ts` | Prisma client initialization |
| `validation.ts` | Zod schemas for input validation |
| `errors.ts` | Custom error classes |
| `error-handler.ts` | Centralized error handling |

### 5.2 Security Libraries

| File | Purpose |
|------|---------|
| `security.ts` | Security utilities |
| `csrf-protection.ts` | CSRF token handling |
| `csp.ts` | Content Security Policy |
| `crypto-utils.ts` | Encryption utilities |
| `password-validation.ts` | Password strength validation |
| `rate-limit.ts` | Rate limiting (Upstash Redis) |
| `rate-limit-edge.ts` | Edge-compatible rate limiting |
| `rate-limit-lru.ts` | LRU-based rate limiting |
| `rate-limit-memory-safe.ts` | Memory-safe rate limiting |

### 5.3 Integration Libraries

**Payments (`/lib/payments/`):**
- `vnpay.ts` - VNPay gateway integration
- `momo.ts` - MoMo gateway integration
- `zalopay.ts` - ZaloPay gateway integration

**Webhooks (`/lib/webhooks/`):**
- `processor.ts` - Webhook event processor
- `retry-service.ts` - Webhook retry logic
- `replay-protection.ts` - Replay attack prevention

**Communication (`/lib/email/`, `/lib/discord/`):**
- `email.ts` - Resend email integration
- `discord.ts` - Discord bot integration

**Storage (`/lib/storage/`):**
- R2/S3 storage utilities

**Monitoring (`/lib/monitoring/`):**
- `logger.ts` - Logging system
- `sentry.ts` - Sentry integration
- `monitoring.ts` - Performance monitoring

### 5.4 Utility Libraries

| File | Purpose |
|------|---------|
| `api-cache.ts` | API response caching |
| `cache.ts` | Redis caching |
| `env-loader.ts` | Environment validation |
| `env-validation.ts` | Env var validation schemas |
| `sw-registration.ts` | Service worker registration |
| `supabase.ts` | Supabase client (legacy) |
| `utils.ts` | General utilities |
| `mock-data.ts` | Mock data for development |

---

## 6. Hooks Layer (src/hooks/)

| Hook | Purpose |
|------|---------|
| `useWebSocket.ts` | WebSocket connection management |
| `useCSRF.ts` | CSRF token fetching |
| `useFormatters.ts` | Currency/date formatting |
| `useStatusBadges.tsx` | Status badge rendering |

---

## 7. Types Layer (src/types/)

| File | Purpose |
|------|---------|
| `database.ts` | Database model types |
| `enums.ts` | Enum definitions |
| `payment.ts` | Payment types |
| `webhook-payloads.ts` | Webhook payload types |
| `prisma.ts` | Prisma type extensions |
| `performance.d.ts` | Performance API types |
| `express.d.ts` | Express type extensions |

---

## 8. Database Layer (prisma/)

### 8.1 Models (20 total)

**Core Business:**
- `User` - User accounts with RoK game data
- `Service` - Service offerings
- `ServiceTier` - Service pricing tiers
- `Booking` - Service bookings
- `Payment` - Payment transactions
- `Lead` - Lead management
- `Staff` - Staff profiles

**Supporting:**
- `Communication` - Email/notification records
- `ServiceTask` - Task management
- `FileUpload` - File metadata
- `WebhookEvent` - Webhook queue

**Authentication:**
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification
- `PasswordResetToken` - Password reset
- `TwoFactorAuth` - 2FA secrets
- `PasswordHistory` - Password history

**Logging:**
- `SystemLog` - Application logs
- `SecurityLog` - Security events
- `AuditLog` - User action audit

### 8.2 Key Indexes

```prisma
Booking: [userId, status], [status, createdAt], [paymentStatus], [assignedStaffId, status]
Payment: [bookingId], [status], [createdAt], [paymentGateway, status]
Lead: [status, createdAt], [assignedTo, status], [source], [email]
```

---

## 9. Data Flow

### 9.1 Booking Flow
```
User → /services/[slug] → Select Tier
     → /booking → Create Booking
     → /api/bookings → BookingService.create()
     → Database → Send Email → Create Lead
     → Redirect to Payment
```

### 9.2 Payment Flow
```
Booking → /api/payments/create → PaymentService
        → Generate Gateway URL → Redirect to Gateway
        → User Completes Payment
        → Gateway → /api/webhooks/[gateway]
        → Verify Signature → Update Payment
        → Update Booking → Send Confirmation
        → WebSocket Notification
```

### 9.3 Authentication Flow
```
User → /auth/signup → /api/auth/signup
     → Validate → Hash Password → Create User
     → Create Lead → Send Welcome Email
     → Redirect to /auth/signin
     → Login → Session Created
     → (Optional) 2FA Verification
     → Redirect to /dashboard
```

---

## 10. External Dependencies

### 10.1 Core Dependencies
- `next: ^14.0.0` - React framework
- `react: ^18.0.0` - UI library
- `typescript: ^5.0.0` - Type safety
- `@prisma/client: ^6.12.0` - Database ORM
- `next-auth: ^4.24.5` - Authentication

### 10.2 Payment Dependencies
- Payment gateway SDKs (custom implementations)

### 10.3 Communication Dependencies
- `resend: 4.8.0` - Email service
- `discord.js: ^14.14.1` - Discord integration
- `socket.io: 4.8.1` - WebSocket server

### 10.4 Monitoring Dependencies
- `@sentry/nextjs: 10.1.0` - Error tracking

### 10.5 Utility Dependencies
- `zod: ^3.22.4` - Schema validation
- `bcryptjs: ^2.4.3` - Password hashing
- `otplib: 12.0.1` - 2FA TOTP
- `date-fns: 4.1.0` - Date formatting

---

## 11. Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `.eslintrc.json` | ESLint rules |
| `.prettierrc.json` | Prettier formatting |
| `jest.config.js` | Jest testing configuration |
| `playwright.config.ts` | E2E testing configuration |
| `vercel.json` | Vercel deployment configuration |

---

## 12. Environment Variables

**Required:**
```bash
DATABASE_URL          # PostgreSQL connection string
DIRECT_URL            # Direct database connection
NEXTAUTH_URL          # Application URL
NEXTAUTH_SECRET       # Session encryption key
```

**Payment Gateways:**
```bash
VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL
MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY
ZALOPAY_APP_ID, ZALOPAY_KEY1, ZALOPAY_KEY2
```

**Services:**
```bash
RESEND_API_KEY        # Email service
DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN
SENTRY_DSN            # Error monitoring
CLOUDFLARE_R2_*       # File storage
UPSTASH_REDIS_*       # Rate limiting
```

**Public:**
```bash
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_DISCORD_INVITE
```
