# Rise of Kingdoms Services Website

Website cung cấp dịch vụ chuyên nghiệp cho game Rise of Kingdoms tại Việt Nam.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase, Neon, or local)
- npm or yarn

### Development Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your configuration:
# - DATABASE_URL: Your PostgreSQL connection string
# - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32
# - Other API keys as needed
```

3. **Setup Database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed initial data
npx tsx prisma/seed.ts
```

4. **Start Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

## 📦 Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_SITE_URL=https://rokdbot.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/rokservices
```

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React & Heroicons
- **Deployment**: Vercel
- **Monitoring**: Sentry
- **Payment Gateways**: MoMo, ZaloPay, VNPay

## 📱 Features

- **8 RoK Services** with detailed pricing
- **Strategy Consulting** page with case studies
- **Mobile-optimized** for Vietnamese gamers
- **SEO optimized** for Vietnamese gaming keywords
- **Conversion optimized** with urgency elements

## 🎯 Target Audience

Vietnamese Rise of Kingdoms players seeking professional gaming services.

## 📊 Performance

- **Core Web Vitals**: Optimized for mobile users
- **SEO Score**: 95+ with structured data
- **Loading Speed**: < 2.5s LCP for Vietnamese users

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run database migrations

### Project Structure
```
src/
├── app/                 # Next.js 14 app directory
│   ├── api/            # API routes
│   ├── (auth)/         # Auth pages
│   ├── admin/          # Admin dashboard
│   └── ...
├── components/          # React components
│   ├── ui/             # UI components
│   ├── sections/       # Page sections
│   └── ...
├── lib/                # Utility functions
│   ├── auth/           # Authentication utilities
│   ├── payments/       # Payment integrations
│   └── ...
├── types/              # TypeScript type definitions
└── middleware/         # Next.js middleware
prisma/
├── schema.prisma       # Database schema
├── migrations/         # Database migrations
└── seed.ts            # Database seeding
```

### Security Features

✅ **Strong Password Policy**
- Minimum 12 characters
- Requires uppercase, lowercase, numbers, and special characters
- Checks against common passwords
- Prevents sequential/repeating characters

✅ **Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- CSRF Protection

✅ **Input Validation**
- Zod schema validation on all API endpoints
- SQL injection prevention via Prisma ORM
- XSS protection with sanitization

✅ **Rate Limiting**
- Auth endpoints: 5 req/min
- Payment endpoints: 20 req/min
- General API: 60 req/min

### Environment Variables

Required variables (see [.env.example](.env.example) for full list):

```bash
# Database
DATABASE_URL=           # PostgreSQL connection string
DIRECT_URL=            # Direct database connection (for migrations)

# Authentication
NEXTAUTH_URL=          # Your site URL
NEXTAUTH_SECRET=       # Generate with: openssl rand -base64 32

# Security
API_SECRET_KEY=        # Generate with: openssl rand -base64 32
JWT_SECRET=            # Generate with: openssl rand -base64 32
ENCRYPTION_KEY=        # Generate with: openssl rand -base64 32
```

## 🌐 Domain Configuration

Domain: `rokdbot.com`
- **Frontend**: Vercel
- **CDN**: Cloudflare
- **SSL**: Automatic via Cloudflare

## 📈 Analytics

- **Google Analytics 4**: User behavior tracking
- **Core Web Vitals**: Performance monitoring
- **Conversion Tracking**: Lead generation metrics

## 🔒 Security

- **HTTPS**: Enforced via Cloudflare
- **Security Headers**: XSS protection, CSRF prevention
- **DDoS Protection**: Cloudflare enterprise-level

## 📞 Support

- **Discord**: https://discord.gg/rokservices
- **Email**: contact@rokdbot.com
- **Phone**: +84123456789

## 📄 License

MIT License - See LICENSE file for details.
