import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Services
  const services = [
    {
      id: 'strategy-consulting',
      slug: 'strategy-consulting',
      name: 'Tư vấn chiến thuật',
      description: 'Phân tích và tối ưu chiến thuật cho từng tình huống trong game',
      shortDescription: 'Tư vấn chiến thuật chuyên nghiệp',
      basePrice: 500000,
      currency: 'VND',
      isActive: true,
      isFeatured: false,
      category: 'STRATEGY',
      metadata: {
        features: [
          'Phân tích tình huống chiến đấu',
          'Tối ưu hóa formation',
          'Lên kế hoạch phát triển',
          'Hỗ trợ 24/7'
        ],
        requirements: [
          'Tài khoản RoK active',
          'Power tối thiểu 1M',
          'Discord để liên lạc'
        ],
        duration: 30
      }
    },
    {
      id: 'alliance-management', 
      slug: 'alliance-management',
      name: 'Quản lý liên minh',
      description: 'Hỗ trợ quản lý, tuyển dụng và phát triển liên minh mạnh mẽ',
      shortDescription: 'Quản lý liên minh chuyên nghiệp',
      basePrice: 1000000,
      currency: 'VND', 
      isActive: true,
      isFeatured: true,
      category: 'MANAGEMENT',
      metadata: {
        features: [
          'Thiết lập cấu trúc quản lý',
          'Hệ thống tuyển dụng',
          'Quản lý sự kiện',
          'Phát triển thành viên'
        ],
        requirements: [
          'R4/R5 trong alliance',
          'Alliance 30+ thành viên',
          'Commit 3 tháng'
        ],
        duration: 30
      }
    },
    {
      id: 'commander-training',
      slug: 'commander-training', 
      name: 'Training Commander',
      description: 'Hướng dẫn build và phát triển commander hiệu quả nhất',
      shortDescription: 'Training commander chuyên nghiệp',
      basePrice: 300000,
      currency: 'VND',
      isActive: true,
      isFeatured: false,
      category: 'TRAINING',
      metadata: {
        features: [
          'Tư vấn talent build',
          'Equipment tối ưu',
          'Pairing commander',
          'Session 1-on-1'
        ],
        requirements: [
          'Commander level 30+',
          'Có sculpture đầu tư',
          'Active player'
        ],
        duration: 60
      }
    },
    {
      id: 'kvk-support',
      slug: 'kvk-support',
      name: 'Hỗ trợ KvK', 
      description: 'Chiến thuật và coordination chuyên nghiệp cho Kingdom vs Kingdom',
      shortDescription: 'Hỗ trợ KvK chuyên nghiệp',
      basePrice: 2000000,
      currency: 'VND',
      isActive: true,
      isFeatured: true,
      category: 'STRATEGY',
      metadata: {
        features: [
          'Chiến thuật KvK',
          'Coordination team',
          'Map control',
          'Migration support'
        ],
        requirements: [
          'T4+ troops',
          'KvK experience',
          'Alliance participation'
        ],
        duration: 90
      }
    },
    {
      id: 'personal-coaching',
      slug: 'personal-coaching',
      name: 'Coaching 1-on-1',
      description: 'Hướng dẫn cá nhân hóa từ chuyên gia top player hàng đầu',
      shortDescription: 'Coaching cá nhân 1-on-1',
      basePrice: 200000,
      currency: 'VND',
      isActive: true,
      isFeatured: false,
      category: 'TRAINING',
      metadata: {
        features: [
          'Session 1-on-1 riêng',
          'Customize theo nhu cầu',
          'Top player guidance',
          'Follow-up support'
        ],
        requirements: [
          'Serious learner',
          'Basic game knowledge',
          'Regular availability'
        ],
        duration: 60
      }
    },
    {
      id: 'vip-support',
      slug: 'vip-support',
      name: 'VIP Support 24/7',
      description: 'Hỗ trợ ưu tiên và tư vấn chuyên nghiệp mọi lúc mọi nơi', 
      shortDescription: 'VIP Support 24/7',
      basePrice: 3000000,
      currency: 'VND',
      isActive: true,
      isFeatured: true,
      category: 'PREMIUM',
      metadata: {
        features: [
          'Hỗ trợ 24/7',
          'Priority response',
          'All services included',
          'Dedicated manager'
        ],
        requirements: [
          'VIP commitment',
          'High-end account',
          'Long-term partnership'
        ],
        duration: 30
      }
    }
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service
    })
    console.log(`✅ Created/Updated service: ${service.name}`)
  }

  // Create sample user (Admin)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rokservices.com' },
    update: {},
    create: {
      email: 'admin@rokservices.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewF5JQQENcLcQB3u', // hashed 'admin123'
      fullName: 'Admin RoK Services',
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create staff profile for admin
  await prisma.staff.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'ADMIN', 
      isActive: true,
      hireDate: new Date()
    }
  })

  console.log('✅ Created admin user and staff profile')
  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })