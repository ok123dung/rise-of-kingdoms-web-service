import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const adminPassword = await hashPassword('admin123456')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@rokdbot.com' },
    update: {},
    create: {
      email: 'admin@rokdbot.com',
      fullName: 'Admin RoK Services',
      phone: '+84123456789',
      password: adminPassword,
      status: 'active'
    }
  })

  // Create admin staff profile
  await prisma.staff.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      role: 'admin',
      permissions: {
        canManageUsers: true,
        canManageBookings: true,
        canManagePayments: true,
        canViewAnalytics: true,
        canManageStaff: true
      },
      specializations: ['strategy', 'farming', 'kvk', 'alliance'],
      isActive: true,
      hireDate: new Date()
    }
  })

  // Create services
  const strategyService = await prisma.service.upsert({
    where: { slug: 'strategy-consulting' },
    update: {},
    create: {
      name: 'Tư vấn chiến thuật',
      slug: 'strategy-consulting',
      description: 'Tư vấn chiến thuật chuyên sâu từ top 1% players Việt Nam. Phân tích account, xây dựng lộ trình phát triển, tối ưu hóa build commander và resource management.',
      shortDescription: 'Tư vấn chiến thuật chuyên sâu từ top 1% players',
      basePrice: 750000,
      currency: 'VND',
      category: 'consulting',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      metadata: {
        duration: '1 tháng',
        includes: ['Phân tích account', 'Lộ trình phát triển', 'Tư vấn build commander', 'Hỗ trợ 24/7'],
        benefits: ['Tăng power 100-200%', 'Tối ưu resource', 'Chiến thuật KvK', 'Build commander hiệu quả']
      }
    }
  })

  // Create strategy service tiers
  await prisma.serviceTier.createMany({
    data: [
      {
        serviceId: strategyService.id,
        name: 'Basic Strategy',
        slug: 'basic',
        price: 750000,
        features: [
          'Phân tích account cơ bản',
          'Lộ trình phát triển 30 ngày',
          'Tư vấn build 3 commander chính',
          'Hỗ trợ Discord 12h/ngày',
          'Report tiến độ hàng tuần'
        ],
        limitations: [
          'Không bao gồm KvK strategy',
          'Không hỗ trợ alliance management'
        ],
        isPopular: false,
        isAvailable: true,
        maxCustomers: 50,
        currentCustomers: 0,
        sortOrder: 1
      },
      {
        serviceId: strategyService.id,
        name: 'Pro Strategy',
        slug: 'pro',
        price: 900000,
        originalPrice: 1200000,
        features: [
          'Phân tích account chuyên sâu',
          'Lộ trình phát triển 60 ngày',
          'Tư vấn build 5+ commanders',
          'KvK strategy & tactics',
          'Hỗ trợ Discord 24/7',
          'Report tiến độ 2 lần/tuần',
          'Alliance management tips'
        ],
        limitations: [],
        isPopular: true,
        isAvailable: true,
        maxCustomers: 30,
        currentCustomers: 0,
        sortOrder: 2
      },
      {
        serviceId: strategyService.id,
        name: 'Premium Strategy',
        slug: 'premium',
        price: 1200000,
        originalPrice: 1500000,
        features: [
          'Phân tích account toàn diện',
          'Lộ trình phát triển 90 ngày',
          'Tư vấn build tất cả commanders',
          'KvK strategy & leadership',
          'Hỗ trợ Discord 24/7 priority',
          'Report tiến độ hàng ngày',
          'Alliance management coaching',
          'Personal mentor 1-on-1',
          'Guaranteed power increase 200%+'
        ],
        limitations: [],
        isPopular: false,
        isAvailable: true,
        maxCustomers: 15,
        currentCustomers: 0,
        sortOrder: 3
      }
    ]
  })

  // Create farming service
  const farmingService = await prisma.service.upsert({
    where: { slug: 'gem-farming' },
    update: {},
    create: {
      name: 'Farm Gem an toàn',
      slug: 'gem-farming',
      description: 'Dịch vụ farm gem an toàn 100% với phương pháp độc quyền. Đảm bảo 4-20k gem/ngày không risk ban account.',
      shortDescription: 'Farm gem an toàn 4-20k/ngày không risk ban',
      basePrice: 500000,
      currency: 'VND',
      category: 'farming',
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      metadata: {
        duration: '1 tháng',
        includes: ['Setup farm system', 'Daily monitoring', 'Safety protocols', 'Gem delivery'],
        benefits: ['4-20k gem/ngày', '100% an toàn', 'Không risk ban', 'Automated system']
      }
    }
  })

  // Create farming service tiers
  await prisma.serviceTier.createMany({
    data: [
      {
        serviceId: farmingService.id,
        name: 'Basic Farm',
        slug: 'basic',
        price: 500000,
        features: [
          '4-8k gem/ngày',
          'Setup farm system',
          'Daily monitoring',
          'Safety protocols',
          'Weekly reports'
        ],
        limitations: [
          'Chỉ 1 account',
          'Basic automation'
        ],
        isPopular: false,
        isAvailable: true,
        maxCustomers: 100,
        currentCustomers: 0,
        sortOrder: 1
      },
      {
        serviceId: farmingService.id,
        name: 'Pro Farm',
        slug: 'pro',
        price: 800000,
        originalPrice: 1000000,
        features: [
          '8-15k gem/ngày',
          'Advanced farm system',
          'Real-time monitoring',
          'Premium safety protocols',
          'Daily reports',
          'Multiple farm accounts'
        ],
        limitations: [],
        isPopular: true,
        isAvailable: true,
        maxCustomers: 50,
        currentCustomers: 0,
        sortOrder: 2
      },
      {
        serviceId: farmingService.id,
        name: 'Premium Farm',
        slug: 'premium',
        price: 1200000,
        originalPrice: 1500000,
        features: [
          '15-20k gem/ngày',
          'Enterprise farm system',
          '24/7 monitoring',
          'Military-grade security',
          'Real-time reports',
          'Unlimited farm accounts',
          'Priority support',
          'Custom automation'
        ],
        limitations: [],
        isPopular: false,
        isAvailable: true,
        maxCustomers: 20,
        currentCustomers: 0,
        sortOrder: 3
      }
    ]
  })

  // Create KvK service
  const kvkService = await prisma.service.upsert({
    where: { slug: 'kvk-support' },
    update: {},
    create: {
      name: 'Hỗ trợ KvK chuyên nghiệp',
      slug: 'kvk-support',
      description: 'Hỗ trợ KvK toàn diện từ preparation đến execution. Strategy, tactics, leadership coaching cho alliance.',
      shortDescription: 'Hỗ trợ KvK toàn diện từ strategy đến execution',
      basePrice: 1000000,
      currency: 'VND',
      category: 'kvk',
      isActive: true,
      isFeatured: false,
      sortOrder: 3,
      metadata: {
        duration: '1 KvK season',
        includes: ['Pre-KvK preparation', 'Real-time strategy', 'Leadership coaching', 'Post-KvK analysis'],
        benefits: ['Higher win rate', 'Better coordination', 'Optimal resource usage', 'Leadership skills']
      }
    }
  })

  // Create sample customer
  const customerPassword = await hashPassword('customer123')
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      fullName: 'Nguyễn Văn A',
      phone: '+84987654321',
      password: customerPassword,
      discordUsername: 'customer#1234',
      rokPlayerId: '12345678',
      rokKingdom: '1234',
      rokPower: 50000000,
      status: 'active'
    }
  })

  // Create sample booking
  const booking = await prisma.booking.create({
    data: {
      bookingNumber: 'RK24010001',
      userId: customer.id,
      serviceTierId: (await prisma.serviceTier.findFirst({
        where: { serviceId: strategyService.id, slug: 'pro' }
      }))!.id,
      status: 'confirmed',
      paymentStatus: 'completed',
      totalAmount: 900000,
      discountAmount: 0,
      finalAmount: 900000,
      currency: 'VND',
      bookingDetails: {
        requirements: 'Cần tư vấn build Saladin và Richard, focus KvK',
        notes: 'Khách hàng có kinh nghiệm, cần advanced strategy'
      },
      customerRequirements: 'Cần tư vấn build Saladin và Richard, focus KvK',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      completionPercentage: 25
    }
  })

  // Create sample payment
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      paymentNumber: 'PAY24010001',
      amount: 900000,
      currency: 'VND',
      paymentMethod: 'momo',
      paymentGateway: 'momo',
      gatewayTransactionId: 'MOMO_' + Date.now(),
      status: 'completed',
      paidAt: new Date()
    }
  })

  // Create sample leads
  await prisma.lead.createMany({
    data: [
      {
        email: 'lead1@example.com',
        fullName: 'Trần Văn B',
        phone: '+84912345678',
        serviceInterest: 'strategy',
        source: 'website',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'strategy-ads',
        leadScore: 75,
        status: 'new'
      },
      {
        email: 'lead2@example.com',
        fullName: 'Lê Thị C',
        serviceInterest: 'farming',
        source: 'discord',
        leadScore: 60,
        status: 'contacted'
      },
      {
        email: 'lead3@example.com',
        fullName: 'Phạm Văn D',
        phone: '+84923456789',
        serviceInterest: 'premium',
        source: 'referral',
        leadScore: 90,
        status: 'qualified'
      }
    ]
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Created:')
  console.log('  - 1 Admin user (admin@rokdbot.com / admin123456)')
  console.log('  - 1 Customer user (customer@example.com / customer123)')
  console.log('  - 3 Services with multiple tiers')
  console.log('  - 1 Sample booking with payment')
  console.log('  - 3 Sample leads')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
