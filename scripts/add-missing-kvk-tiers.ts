import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addMissingKvKTiers() {
  console.log('🔧 Adding missing KvK service tiers...')

  try {
    // Find KvK service
    const kvkService = await prisma.service.findUnique({
      where: { slug: 'kvk-support' }
    })

    if (!kvkService) {
      console.error('❌ KvK service not found')
      return
    }

    // Add KvK service tiers
    await prisma.serviceTier.createMany({
      data: [
        {
          serviceId: kvkService.id,
          name: 'KvK Basic',
          slug: 'basic',
          price: 1000000,
          features: [
            'Pre-KvK strategy consultation',
            'Basic rally and garrison guides',
            'Resource management tips',
            'Discord support during KvK',
            'Post-KvK performance review'
          ],
          limitations: [
            'No real-time coordination',
            'Limited to 1 kingdom'
          ],
          isPopular: false,
          isAvailable: true,
          maxCustomers: 20,
          currentCustomers: 0,
          sortOrder: 1
        },
        {
          serviceId: kvkService.id,
          name: 'KvK Pro',
          slug: 'pro',
          price: 1500000,
          originalPrice: 2000000,
          features: [
            'Comprehensive pre-KvK strategy',
            'Real-time battlefield coordination',
            'Advanced rally and garrison tactics',
            'Alliance leadership coaching',
            'Daily strategy briefings',
            'Resource optimization plans',
            'Priority Discord support 24/7'
          ],
          limitations: [],
          isPopular: true,
          isAvailable: true,
          maxCustomers: 10,
          currentCustomers: 0,
          sortOrder: 2
        },
        {
          serviceId: kvkService.id,
          name: 'KvK Elite',
          slug: 'elite',
          price: 2500000,
          originalPrice: 3000000,
          features: [
            'Complete KvK domination package',
            'Dedicated strategist assignment',
            'Real-time voice coordination',
            'Custom battle plans',
            'Alliance merger strategies',
            'Cross-kingdom negotiations',
            'VIP support with hotline',
            'Guaranteed performance improvement'
          ],
          limitations: [],
          isPopular: false,
          isAvailable: true,
          maxCustomers: 5,
          currentCustomers: 0,
          sortOrder: 3
        }
      ]
    })

    console.log('✅ Successfully added KvK service tiers')
    
    // Verify
    const updatedService = await prisma.service.findUnique({
      where: { slug: 'kvk-support' },
      include: { serviceTiers: true }
    })
    
    console.log(`📊 KvK service now has ${updatedService?.serviceTiers.length} tiers`)
    
  } catch (error) {
    console.error('❌ Failed to add KvK tiers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMissingKvKTiers()