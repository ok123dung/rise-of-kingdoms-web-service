# ROK Services

Professional gaming services platform for Rise of Kingdoms players in Vietnam.

**Domain:** rokdbot.com | **Status:** Production-Ready MVP

---

## Quick Start

### Prerequisites
- Node.js 20.x LTS
- PostgreSQL (Supabase recommended)
- npm

### Development Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development
npm run dev
```

Open http://localhost:3000

### Production Deployment

```bash
npm i -g vercel
vercel login
vercel --prod
```

See [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md) for detailed instructions.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js + 2FA (TOTP) |
| Styling | Tailwind CSS |
| Payments | MoMo, VNPay, ZaloPay |
| Hosting | Vercel + Cloudflare |
| Monitoring | Sentry |

---

## Features

- 8 RoK gaming services with tiered pricing
- User authentication with Discord OAuth + 2FA
- Vietnamese payment gateway integration
- Real-time WebSocket notifications
- Admin dashboard with analytics
- Lead management and conversion tracking
- Mobile-optimized, SEO-ready

---

## Project Structure

```
src/
├── app/                # Next.js App Router
│   ├── api/            # API routes (~50 endpoints)
│   ├── auth/           # Auth pages
│   ├── admin/          # Admin dashboard
│   └── dashboard/      # Customer dashboard
├── components/         # React components (77 files)
├── services/           # Business logic layer
├── lib/                # Utilities and integrations
├── hooks/              # Custom React hooks
└── types/              # TypeScript definitions

prisma/
├── schema.prisma       # Database schema (20 models)
└── migrations/         # Database migrations

docs/                   # Documentation
```

---

## Available Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint check
npm run lint:fix      # Fix lint errors
npm run type-check    # TypeScript check
npm run test          # Jest tests
npm run test:e2e      # Playwright E2E
npm run db:studio     # Prisma Studio
npm run db:migrate    # Run migrations
```

---

## Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://rokdbot.com
NEXTAUTH_SECRET=<openssl rand -base64 32>
```

**Payment Gateways:**
```bash
VNPAY_TMN_CODE, VNPAY_HASH_SECRET
MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY
ZALOPAY_APP_ID, ZALOPAY_KEY1, ZALOPAY_KEY2
```

**Optional:**
```bash
RESEND_API_KEY        # Email service
DISCORD_*             # Discord OAuth/bot
SENTRY_DSN            # Error monitoring
NEXT_PUBLIC_GA_*      # Analytics
```

See `.env.example` for complete list.

---

## Security

| Feature | Implementation |
|---------|----------------|
| Password | 12+ chars, bcrypt 14 rounds, history |
| 2FA | TOTP with backup codes |
| Headers | CSP, HSTS, X-Frame-Options |
| Rate Limiting | Auth: 5/min, Payments: 20/min |
| Input Validation | Zod schemas, Prisma ORM |
| Webhook Security | HMAC verification, replay protection |

---

## Database Models (20)

**Core:** User, Service, ServiceTier, Booking, Payment, Lead, Staff

**Supporting:** Communication, ServiceTask, FileUpload, WebhookEvent

**Auth:** Account, Session, VerificationToken, PasswordResetToken, TwoFactorAuth, PasswordHistory

**Logging:** SystemLog, SecurityLog, AuditLog

---

## Documentation

| Document | Description |
|----------|-------------|
| [Project Overview PDR](docs/project-overview-pdr.md) | Product requirements, features, metrics |
| [Codebase Summary](docs/codebase-summary.md) | File structure, modules, data flow |
| [Code Standards](docs/code-standards.md) | Naming conventions, patterns |
| [System Architecture](docs/system-architecture.md) | Architecture diagrams, components |
| [Project Roadmap](docs/project-roadmap.md) | Technical debt, future features |
| [Deployment Guide](docs/DEPLOYMENT-GUIDE.md) | Setup, configuration, troubleshooting |

---

## Cost Estimates

| Scale | Monthly Cost |
|-------|--------------|
| Free tier (MVP) | $0 |
| Production (50+ users) | ~$55 |
| Business (200+ users) | ~$180 |

---

## Support

- **Discord:** https://discord.gg/rokservices
- **Email:** contact@rokdbot.com

---

## License

MIT License - See LICENSE file for details.
