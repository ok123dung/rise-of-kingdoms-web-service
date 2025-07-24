import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Services and Service Tiers
  console.log('📊 Creating services and tiers...')

  // 1. Strategy & Tactics Service
  const strategyService = await prisma.service.create({
    data: {
      name: 'ROK Strategy & Tactics',
      slug: 'strategy',
      description: 'Comprehensive strategy guidance for Rise of Kingdoms - from city development to alliance warfare',
      shortDescription: 'Expert RoK strategy consultation and tactical guidance',
      basePrice: 1000000, // 1M VND
      currency: 'VND',
      category: 'strategy',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      metadata: {
        features: ['Kingdom analysis', 'Commander builds', 'F2P optimization', 'War strategy'],
        duration: '1-2 weeks',
        support: '24/7 Discord chat'
      }
    }
  })

  // Create sample leads
  console.log('🎯 Creating sample leads...')
  await prisma.lead.createMany({
    data: [
      {
        email: 'gamer1@gmail.com',
        fullName: 'Nguyễn Văn A',
        phone: '0987654321',
        serviceInterest: 'strategy',
        source: 'discord',
        leadScore: 85,
        status: 'new',
        notes: 'Quan tâm đến strategy cho KvK season 6 - Player 50M power từ kingdom 2847, alliance VN Warriors'
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('📊 Created services and sample data')
  console.log('🚀 Production database ready!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })