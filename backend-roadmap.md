# Backend Development Roadmap for RoK Services

## Phase 1: Core Infrastructure (Week 1-2)

### 1.1 Technology Stack Selection
**Recommended Stack:**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Next.js 14 API Routes + Express.js for complex APIs
- **Database**: PostgreSQL (primary) + Redis (caching/sessions)
- **ORM**: Prisma (type-safe, great with TypeScript)
- **Authentication**: NextAuth.js + JWT
- **File Storage**: Cloudflare R2 or AWS S3
- **Email**: Resend or SendGrid
- **Payment**: Stripe + Vietnamese gateways

### 1.2 Database Schema Design
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  discord_username VARCHAR(255),
  rok_player_id VARCHAR(255),
  rok_kingdom VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'VND',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service tiers table
CREATE TABLE service_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  service_tier_id UUID REFERENCES service_tiers(id),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  booking_details JSONB,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer communications
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  type VARCHAR(50), -- 'email', 'discord', 'sms'
  subject VARCHAR(255),
  content TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 API Architecture
```
/api/
├── auth/
│   ├── login
│   ├── register
│   ├── logout
│   └── verify
├── services/
│   ├── list
│   ├── [slug]
│   └── tiers/[serviceId]
├── bookings/
│   ├── create
│   ├── list
│   ├── [id]
│   └── cancel
├── payments/
│   ├── create-intent
│   ├── webhook
│   └── verify
├── users/
│   ├── profile
│   ├── update
│   └── dashboard
└── admin/
    ├── bookings
    ├── users
    └── analytics
```

## Phase 2: Authentication & User Management (Week 3)

### 2.1 NextAuth.js Configuration
```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Verify user credentials
        const user = await verifyUser(credentials)
        return user ? { id: user.id, email: user.email } : null
      }
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.userId = token.userId
      return session
    }
  }
})
```

### 2.2 User Registration Flow
1. **Email/Phone verification**
2. **Discord account linking (optional)**
3. **RoK player info collection**
4. **Welcome email with onboarding**

### 2.3 Customer Dashboard Features
- Service booking history
- Payment history
- Current active services
- Communication logs
- Profile management

## Phase 3: Booking & Payment System (Week 4-5)

### 3.1 Vietnamese Payment Integration

#### 3.1.1 MoMo Integration
```typescript
// lib/payments/momo.ts
export class MoMoPayment {
  async createPayment(booking: Booking) {
    const payload = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      amount: booking.total_amount,
      orderId: booking.id,
      orderInfo: `RoK Service: ${booking.service_name}`,
      redirectUrl: `${process.env.SITE_URL}/payment/success`,
      ipnUrl: `${process.env.SITE_URL}/api/payments/momo/webhook`,
      requestType: 'payWithATM',
      extraData: '',
      lang: 'vi'
    }
    
    const signature = this.generateSignature(payload)
    return await this.sendRequest(payload, signature)
  }
}
```

#### 3.1.2 ZaloPay Integration
```typescript
// lib/payments/zalopay.ts
export class ZaloPayPayment {
  async createOrder(booking: Booking) {
    const order = {
      app_id: process.env.ZALOPAY_APP_ID,
      app_trans_id: `${Date.now()}_${booking.id}`,
      app_user: booking.user_email,
      amount: booking.total_amount,
      description: `Thanh toán dịch vụ RoK: ${booking.service_name}`,
      bank_code: '',
      callback_url: `${process.env.SITE_URL}/api/payments/zalopay/callback`
    }
    
    return await this.createZaloPayOrder(order)
  }
}
```

#### 3.1.3 VNPay Integration
```typescript
// lib/payments/vnpay.ts
export class VNPayPayment {
  async createPaymentUrl(booking: Booking) {
    const vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: booking.total_amount * 100, // VNPay uses smallest currency unit
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: booking.user_ip,
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan dich vu RoK ${booking.id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: `${process.env.SITE_URL}/payment/return`,
      vnp_TxnRef: booking.id
    }
    
    return this.buildPaymentUrl(vnp_Params)
  }
}
```

### 3.2 Booking Flow
1. **Service selection** → Tier selection
2. **User authentication** (login/register)
3. **Booking details** (dates, requirements)
4. **Payment method** selection
5. **Payment processing**
6. **Confirmation & onboarding**

### 3.3 Payment Webhook Handling
```typescript
// pages/api/payments/webhook.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gateway, ...payload } = req.body
  
  try {
    let paymentResult
    
    switch (gateway) {
      case 'momo':
        paymentResult = await handleMoMoWebhook(payload)
        break
      case 'zalopay':
        paymentResult = await handleZaloPayWebhook(payload)
        break
      case 'vnpay':
        paymentResult = await handleVNPayWebhook(payload)
        break
    }
    
    if (paymentResult.success) {
      await updateBookingStatus(paymentResult.bookingId, 'confirmed')
      await sendConfirmationEmail(paymentResult.bookingId)
      await notifyDiscord(paymentResult.bookingId)
    }
    
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

## Phase 4: Communication & Automation (Week 6)

### 4.1 Discord Bot Integration
```typescript
// lib/discord/bot.ts
import { Client, GatewayIntentBits } from 'discord.js'

export class RoKDiscordBot {
  private client: Client
  
  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
    })
  }
  
  async notifyNewBooking(booking: Booking) {
    const channel = await this.client.channels.fetch(process.env.DISCORD_BOOKINGS_CHANNEL)
    
    const embed = {
      title: '🎮 New RoK Service Booking',
      fields: [
        { name: 'Service', value: booking.service_name, inline: true },
        { name: 'Customer', value: booking.user_name, inline: true },
        { name: 'Amount', value: `${booking.total_amount.toLocaleString()} VNĐ`, inline: true }
      ],
      color: 0x00ff00,
      timestamp: new Date()
    }
    
    await channel.send({ embeds: [embed] })
  }
  
  async createCustomerChannel(booking: Booking) {
    const guild = await this.client.guilds.fetch(process.env.DISCORD_GUILD_ID)
    const category = await guild.channels.fetch(process.env.DISCORD_CUSTOMER_CATEGORY)
    
    const channel = await guild.channels.create({
      name: `${booking.user_name}-${booking.service_slug}`,
      type: ChannelType.GuildText,
      parent: category,
      permissionOverwrites: [
        {
          id: booking.discord_user_id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        }
      ]
    })
    
    return channel
  }
}
```

### 4.2 Email Automation
```typescript
// lib/email/templates.ts
export const emailTemplates = {
  bookingConfirmation: (booking: Booking) => ({
    subject: `Xác nhận đặt dịch vụ ${booking.service_name}`,
    html: `
      <h2>Cảm ơn bạn đã đặt dịch vụ RoK!</h2>
      <p>Chúng tôi đã nhận được đơn đặt dịch vụ của bạn:</p>
      <ul>
        <li><strong>Dịch vụ:</strong> ${booking.service_name}</li>
        <li><strong>Gói:</strong> ${booking.tier_name}</li>
        <li><strong>Giá:</strong> ${booking.total_amount.toLocaleString()} VNĐ</li>
        <li><strong>Ngày bắt đầu:</strong> ${booking.start_date}</li>
      </ul>
      <p>Chuyên gia sẽ liên hệ với bạn trong vòng 24 giờ.</p>
      <a href="${process.env.SITE_URL}/dashboard">Xem chi tiết đơn hàng</a>
    `
  }),
  
  serviceReminder: (booking: Booking) => ({
    subject: `Nhắc nhở: Dịch vụ ${booking.service_name} sắp hết hạn`,
    html: `
      <h2>Dịch vụ của bạn sắp hết hạn</h2>
      <p>Dịch vụ ${booking.service_name} sẽ hết hạn vào ${booking.end_date}.</p>
      <p>Bạn có muốn gia hạn không?</p>
      <a href="${process.env.SITE_URL}/renew/${booking.id}">Gia hạn ngay</a>
    `
  })
}
```

### 4.3 Automated Workflows
1. **New booking** → Discord notification + Email confirmation
2. **Payment confirmed** → Create Discord channel + Send welcome email
3. **Service starting** → Reminder email + Discord ping
4. **Service ending** → Renewal reminder + Feedback request
5. **Payment failed** → Retry notification + Support contact

## Phase 5: Admin Dashboard & Analytics (Week 7-8)

### 5.1 Admin Dashboard Features
- **Booking management** (approve, modify, cancel)
- **Customer management** (view profiles, communication history)
- **Payment tracking** (revenue, refunds, failed payments)
- **Service performance** (popular services, conversion rates)
- **Discord integration** (channel management, bot commands)

### 5.2 Analytics & Reporting
```typescript
// lib/analytics/reports.ts
export class BusinessAnalytics {
  async getMonthlyRevenue(month: string) {
    return await db.payments.aggregate({
      where: {
        status: 'completed',
        created_at: {
          gte: new Date(`${month}-01`),
          lt: new Date(`${month}-31`)
        }
      },
      _sum: { amount: true }
    })
  }
  
  async getServicePopularity() {
    return await db.bookings.groupBy({
      by: ['service_tier_id'],
      _count: true,
      orderBy: { _count: { service_tier_id: 'desc' } }
    })
  }
  
  async getCustomerLifetimeValue() {
    return await db.users.findMany({
      include: {
        bookings: {
          include: { payments: true }
        }
      }
    })
  }
}
```

### 5.3 Performance Monitoring
- **API response times**
- **Payment success rates**
- **Customer satisfaction scores**
- **Discord engagement metrics**
- **Revenue tracking**

## Phase 6: Advanced Features (Week 9-12)

### 6.1 Customer Portal Enhancements
- **Service progress tracking**
- **File sharing** (screenshots, reports)
- **Live chat integration**
- **Feedback and rating system**
- **Referral program**

### 6.2 Mobile App (React Native)
- **Booking management**
- **Push notifications**
- **Discord integration**
- **Payment processing**
- **Offline mode**

### 6.3 AI-Powered Features
- **Chatbot for basic support**
- **Automated service recommendations**
- **Predictive analytics for churn**
- **Dynamic pricing optimization**

## Deployment & DevOps

### Infrastructure
- **Frontend**: Vercel (current)
- **Backend API**: Railway or Render
- **Database**: Supabase or PlanetScale
- **Redis**: Upstash
- **File Storage**: Cloudflare R2
- **Monitoring**: Sentry + LogRocket

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run deploy
```

## Security Considerations

### 1. Data Protection
- **GDPR compliance** for EU customers
- **Data encryption** at rest and in transit
- **PCI DSS compliance** for payment data
- **Regular security audits**

### 2. API Security
- **Rate limiting** (Redis-based)
- **JWT token validation**
- **Input sanitization**
- **SQL injection prevention**
- **CORS configuration**

### 3. Payment Security
- **PCI DSS compliance**
- **Webhook signature verification**
- **Fraud detection**
- **Secure token storage**

## Estimated Timeline & Budget

### Development Timeline (12 weeks)
- **Week 1-2**: Infrastructure setup
- **Week 3**: Authentication system
- **Week 4-5**: Payment integration
- **Week 6**: Communication automation
- **Week 7-8**: Admin dashboard
- **Week 9-12**: Advanced features

### Estimated Costs (Monthly)
- **Database**: $20-50/month (Supabase/PlanetScale)
- **Backend hosting**: $25-100/month (Railway/Render)
- **Redis**: $10-30/month (Upstash)
- **Email service**: $10-50/month (Resend/SendGrid)
- **Monitoring**: $20-100/month (Sentry/LogRocket)
- **Total**: $85-330/month depending on scale

### Development Resources
- **1 Full-stack developer**: 12 weeks
- **1 DevOps engineer**: 2 weeks (setup)
- **1 UI/UX designer**: 4 weeks (admin dashboard)
- **Total estimated cost**: $15,000-25,000 USD
