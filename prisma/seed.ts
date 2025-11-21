import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ... (services code remains same, skipping for brevity in this tool call if possible, but replace_file_content needs context. I will target the specific block)


  // Create Services & Tiers
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
        requirements: ['Tài khoản RoK active', 'Power tối thiểu 1M', 'Discord để liên lạc'],
        duration: 30
      },
      tiers: [
        {
          name: 'Cơ bản',
          slug: 'strategy-basic',
          price: 500000,
          features: ['Phân tích cơ bản', '1 buổi tư vấn 30p', 'Hỗ trợ qua email']
        },
        {
          name: 'Nâng cao',
          slug: 'strategy-advanced',
          price: 1000000,
          features: ['Phân tích chi tiết', '2 buổi tư vấn 45p', 'Hỗ trợ qua Discord', 'Chiến thuật KvK']
        }
      ]
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
        requirements: ['R4/R5 trong alliance', 'Alliance 30+ thành viên', 'Commit 3 tháng'],
        duration: 30
      },
      tiers: [
        {
          name: 'Standard',
          slug: 'alliance-standard',
          price: 1000000,
          features: ['Cấu trúc R4 cơ bản', 'Bot Discord cơ bản', 'Hỗ trợ tuyển dụng']
        },
        {
          name: 'Premium',
          slug: 'alliance-premium',
          price: 2500000,
          features: ['Full cấu trúc quản lý', 'Bot Discord nâng cao', 'Chiến lược ngoại giao', 'Training R4']
        }
      ]
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
        requirements: ['Commander level 30+', 'Có sculpture đầu tư', 'Active player'],
        duration: 60
      },
      tiers: [
        {
          name: 'Single Pair',
          slug: 'commander-single',
          price: 300000,
          features: ['Tối ưu 1 cặp tướng', 'Talent & Gear guide']
        },
        {
          name: 'Full March',
          slug: 'commander-march',
          price: 1200000,
          features: ['Tối ưu 5 đạo quân', 'Chiến thuật Open Field', 'Chiến thuật Rally/Garrison']
        }
      ]
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
        features: ['Chiến thuật KvK', 'Coordination team', 'Map control', 'Migration support'],
        requirements: ['T4+ troops', 'KvK experience', 'Alliance participation'],
        duration: 90
      },
      tiers: [
        {
          name: 'Map Strategy',
          slug: 'kvk-map',
          price: 2000000,
          features: ['Phân tích bản đồ', 'Chiến thuật Zone 4-5-6', 'Ngoại giao Kingdom']
        },
        {
          name: 'Full Campaign',
          slug: 'kvk-full',
          price: 5000000,
          features: ['Đồng hành suốt kỳ KvK', 'Call trận đánh lớn', 'Tracking stats', 'Họp chiến thuật hàng tuần']
        }
      ]
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
        requirements: ['Serious learner', 'Basic game knowledge', 'Regular availability'],
        duration: 60
      },
      tiers: [
        {
          name: 'Hourly',
          slug: 'coaching-hourly',
          price: 200000,
          features: ['1 giờ coaching', 'Q&A trực tiếp']
        },
        {
          name: 'Monthly',
          slug: 'coaching-monthly',
          price: 1500000,
          features: ['8 giờ coaching/tháng', 'Lộ trình phát triển riêng', 'Review account hàng tuần']
        }
      ]
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
        requirements: ['VIP commitment', 'High-end account', 'Long-term partnership'],
        duration: 30
      },
      tiers: [
        {
          name: 'Gold',
          slug: 'vip-gold',
          price: 3000000,
          features: ['Hỗ trợ ưu tiên', 'Giảm 10% các dịch vụ khác', 'Private Discord channel']
        },
        {
          name: 'Diamond',
          slug: 'vip-diamond',
          price: 5000000,
          features: ['Hỗ trợ 24/7 tức thì', 'Miễn phí 2 dịch vụ bất kỳ/tháng', 'Dedicated Account Manager']
        }
      ]
    }
  ]

  for (const service of services) {
    // Create Service
    const { tiers, ...serviceData } = service
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: serviceData,
      create: serviceData
    })
    console.log(`✅ Created/Updated service: ${service.name}`)

    // Create Tiers
    if (tiers && tiers.length > 0) {
      for (const tier of tiers) {
        await prisma.serviceTier.upsert({
          where: {
            serviceId_slug: {
              serviceId: service.id,
              slug: tier.slug
            }
          },
          update: {
            name: tier.name,
            price: tier.price,
            features: tier.features
          },
          create: {
            serviceId: service.id,
            name: tier.name,
            slug: tier.slug,
            price: tier.price,
            features: tier.features,
            isAvailable: true
          }
        })
        console.log(`   🔹 Created/Updated tier: ${tier.name}`)
      }
    }
  }

  // Create sample user (Admin)
  const passwordHash = await bcrypt.hash('admin123', 14)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rokservices.com' },
    update: {
      password: passwordHash
    },
    create: {
      email: 'admin@rokservices.com',
      password: passwordHash,
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
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
