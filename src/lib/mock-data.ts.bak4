// Mock data for local development when database is not available

export const mockServices = [
  {
    id: 'mock-1',
    name: 'ROK Strategy & Tactics',
    slug: 'strategy',
    description:
      'Comprehensive strategy guidance for Rise of Kingdoms - from city development to alliance warfare',
    short_description: 'Expert RoK strategy consultation and tactical guidance',
    base_price: 1000000,
    currency: 'VND',
    category: 'strategy',
    is_active: true,
    is_featured: true,
    sort_order: 1,
    service_tierss: [
      {
        id: 'tier-1',
        name: 'Strategy Starter',
        slug: 'strategy-starter',
        description: 'Basic strategy consultation for new players',
        price: 500000,
        original_price: 750000,
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
        original_price: 1500000,
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
    short_description: 'Fast power increase and efficient account building',
    base_price: 800000,
    currency: 'VND',
    category: 'power-up',
    is_active: true,
    is_featured: true,
    sort_order: 2,
    service_tierss: [
      {
        id: 'tier-3',
        name: 'Power Boost Basic',
        slug: 'power-boost-basic',
        description: 'Efficient power growth for F2P and low spenders',
        price: 400000,
        original_price: 600000,
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
    booking_number: 'RK25072201',
    user: {
      full_name: 'Nguyễn Văn A',
      email: 'gamer1@gmail.com'
    },
    service_tiers: {
      name: 'Strategy Pro',
      service: { name: 'ROK Strategy & Tactics' }
    },
    status: 'confirmed',
    payment_status: 'completed',
    final_amount: 1000000,
    created_at: new Date('2025-07-20')
  },
  {
    id: 'booking-2',
    booking_number: 'RK25072202',
    user: {
      full_name: 'Trần Thị B',
      email: 'rokplayer@gmail.com'
    },
    service_tiers: {
      name: 'Power Boost Basic',
      service: { name: 'ROK Power Up' }
    },
    status: 'in_progress',
    payment_status: 'completed',
    final_amount: 400000,
    created_at: new Date('2025-07-21')
  }
]
