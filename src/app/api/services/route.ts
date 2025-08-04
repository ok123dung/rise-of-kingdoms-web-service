import { NextRequest, NextResponse } from 'next/server'

// Static services data for now since Railway DB has issues
const staticServices = [
  {
    id: 'strategy-consulting',
    slug: 'strategy-consulting',
    name: 'Tư vấn chiến thuật',
    description: 'Phân tích và tối ưu chiến thuật cho từng tình huống trong game',
    shortDescription: 'Tư vấn chiến thuật chuyên nghiệp',
    basePrice: 500000,
    currency: 'VND',
    category: 'STRATEGY',
    isActive: true,
    isFeatured: false,
    sortOrder: 1,
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
      ]
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
    category: 'MANAGEMENT',
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    metadata: {
      features: [
        'Thiết lập cấu trúc quản lý',
        'Hệ thống tuyển dụng',
        'Quản lý sự kiện',
        'Phát triển thành viên'
      ]
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
    category: 'STRATEGY',
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    metadata: {
      features: [
        'Chiến thuật KvK',
        'Coordination team',
        'Map control',
        'Migration support'
      ]
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
    category: 'PREMIUM',
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
    metadata: {
      features: [
        'Hỗ trợ 24/7',
        'Priority response',
        'All services included',
        'Dedicated manager'
      ]
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
    category: 'TRAINING',
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
    metadata: {
      features: [
        'Tư vấn talent build',
        'Equipment tối ưu',
        'Pairing commander',
        'Session 1-on-1'
      ]
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
    category: 'TRAINING',
    isActive: true,
    isFeatured: false,
    sortOrder: 6,
    metadata: {
      features: [
        'Session 1-on-1 riêng',
        'Customize theo nhu cầu',
        'Top player guidance',
        'Follow-up support'
      ]
    }
  }
]

// GET /api/services - Lấy danh sách tất cả services
export async function GET(request: NextRequest) {
  try {
    // Sort services by featured first, then sort order
    const sortedServices = staticServices
      .filter(service => service.isActive)
      .sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        return a.sortOrder - b.sortOrder
      })

    return NextResponse.json({
      success: true,
      data: sortedServices,
      count: sortedServices.length
    })
  } catch (error) {
    console.error('Services API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch services',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/services - Create new service (admin only)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Database temporarily unavailable',
      message: 'Service creation is temporarily disabled due to database maintenance'
    },
    { status: 503 }
  )
}