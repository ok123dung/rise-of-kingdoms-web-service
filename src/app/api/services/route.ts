import { type NextRequest, NextResponse } from 'next/server'

import { withCache, withETag, CacheConfigs } from '@/lib/api-cache'
// Static services data for now since Railway DB has issues
const staticServices = [
  {
    id: 'strategy-consulting',
    slug: 'strategy-consulting',
    name: 'Tư vấn chiến thuật',
    description: 'Phân tích và tối ưu chiến thuật cho từng tình huống trong game',
    short_description: 'Tư vấn chiến thuật chuyên nghiệp',
    base_price: 500000,
    currency: 'VND',
    category: 'STRATEGY',
    is_active: true,
    is_featured: false,
    sort_order: 1,
    metadata: {
      features: [
        'Phân tích tình huống chiến đấu',
        'Tối ưu hóa formation',
        'Lên kế hoạch phát triển',
        'Hỗ trợ 24/7'
      ],
      requirements: ['Tài khoản RoK active', 'Power tối thiểu 1M', 'Discord để liên lạc']
    }
  },
  {
    id: 'alliance-management',
    slug: 'alliance-management',
    name: 'Quản lý liên minh',
    description: 'Hỗ trợ quản lý, tuyển dụng và phát triển liên minh mạnh mẽ',
    short_description: 'Quản lý liên minh chuyên nghiệp',
    base_price: 1000000,
    currency: 'VND',
    category: 'MANAGEMENT',
    is_active: true,
    is_featured: true,
    sort_order: 2,
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
    short_description: 'Hỗ trợ KvK chuyên nghiệp',
    base_price: 2000000,
    currency: 'VND',
    category: 'STRATEGY',
    is_active: true,
    is_featured: true,
    sort_order: 3,
    metadata: {
      features: ['Chiến thuật KvK', 'Coordination team', 'Map control', 'Migration support']
    }
  },
  {
    id: 'vip-support',
    slug: 'vip-support',
    name: 'VIP Support 24/7',
    description: 'Hỗ trợ ưu tiên và tư vấn chuyên nghiệp mọi lúc mọi nơi',
    short_description: 'VIP Support 24/7',
    base_price: 3000000,
    currency: 'VND',
    category: 'PREMIUM',
    is_active: true,
    is_featured: true,
    sort_order: 4,
    metadata: {
      features: ['Hỗ trợ 24/7', 'Priority response', 'All services included', 'Dedicated manager']
    }
  },
  {
    id: 'commander-training',
    slug: 'commander-training',
    name: 'Training Commander',
    description: 'Hướng dẫn build và phát triển commander hiệu quả nhất',
    short_description: 'Training commander chuyên nghiệp',
    base_price: 300000,
    currency: 'VND',
    category: 'TRAINING',
    is_active: true,
    is_featured: false,
    sort_order: 5,
    metadata: {
      features: ['Tư vấn talent build', 'Equipment tối ưu', 'Pairing commander', 'Session 1-on-1']
    }
  },
  {
    id: 'personal-coaching',
    slug: 'personal-coaching',
    name: 'Coaching 1-on-1',
    description: 'Hướng dẫn cá nhân hóa từ chuyên gia top player hàng đầu',
    short_description: 'Coaching cá nhân 1-on-1',
    base_price: 200000,
    currency: 'VND',
    category: 'TRAINING',
    is_active: true,
    is_featured: false,
    sort_order: 6,
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
export const GET = withETag(
  withCache(
    function handler(_request: NextRequest) {
      try {
        // Sort services by featured first, then sort order
        const sortedServices = staticServices
          .filter(service => service.is_active)
          .sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1
            if (!a.is_featured && b.is_featured) return 1
            return a.sort_order - b.sort_order
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
    },
    CacheConfigs.PUBLIC_STATIC // Cache for 1 hour since data is static
  )
)
// POST /api/services - Create new service (admin only)
export function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Database temporarily unavailable',
      message: 'Service creation is temporarily disabled due to database maintenance'
    },
    { status: 503 }
  )
}
