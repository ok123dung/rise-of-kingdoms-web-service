// Mock data for local development when database is not available

export const mockServices = [
  {
    id: 'mock-1',
    name: 'ROK Strategy & Tactics',
    slug: 'strategy',
    description: 'Comprehensive strategy guidance for Rise of Kingdoms - from city development to alliance warfare',
    shortDescription: 'Expert RoK strategy consultation and tactical guidance',
    basePrice: 1000000,
    currency: 'VND',
    category: 'strategy',
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    serviceTiers: [
      {
        id: 'tier-1',
        name: 'Strategy Starter',
        slug: 'strategy-starter',
        description: 'Basic strategy consultation for new players',
        price: 500000,
        originalPrice: 750000,
        currency: 'VND',
        duration: 7,
        features: ['Kingdom development plan', 'Commander recommendations', 'Basic tactics guide']
      },
      {
        id: 'tier-2', 
        name: 'Strategy Pro',
        slug: 'strategy-pro',
        description: 'Advanced strategy for competitive players',
        price: 1000000,
        originalPrice: 1500000,
        currency: 'VND',
        duration: 14,
        features: ['Complete kingdom optimization', 'Advanced war tactics', 'Alliance coordination']
      }
    ]
  },
  {
    id: 'mock-2',
    name: 'ROK Power Up',
    slug: 'power-up', 
    description: 'Rapid power growth and account development for Rise of Kingdoms',
    shortDescription: 'Fast power increase and efficient account building',
    basePrice: 800000,
    currency: 'VND',
    category: 'power-up',
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    serviceTiers: [
      {
        id: 'tier-3',
        name: 'Power Boost Basic',
        slug: 'power-boost-basic',
        description: 'Efficient power growth for F2P and low spenders',
        price: 400000,
        originalPrice: 600000,
        currency: 'VND',
        duration: 7,
        features: ['Resource optimization', 'Building priority guide', 'Research planning']
      }
    ]
  }
]

export const mockStats = {
  totalUsers: 1247,
  totalBookings: 89,
  totalRevenue: 45600000,
  conversionRate: 12.4,
  avgOrderValue: 850000
}

export const mockBookings = [
  {
    id: 'booking-1',
    bookingNumber: 'RK25072201',
    user: {
      fullName: 'Nguyễn Văn A',
      email: 'gamer1@gmail.com'
    },
    serviceTier: {
      name: 'Strategy Pro',
      service: { name: 'ROK Strategy & Tactics' }
    },
    status: 'confirmed',
    paymentStatus: 'completed',
    finalAmount: 1000000,
    createdAt: new Date('2025-07-20')
  },
  {
    id: 'booking-2',
    bookingNumber: 'RK25072202', 
    user: {
      fullName: 'Trần Thị B',
      email: 'rokplayer@gmail.com'
    },
    serviceTier: {
      name: 'Power Boost Basic',
      service: { name: 'ROK Power Up' }
    },
    status: 'in_progress',
    paymentStatus: 'completed',
    finalAmount: 400000,
    createdAt: new Date('2025-07-21')
  }
]