import { type NextRequest, NextResponse } from 'next/server'
// Static services data for now since Railway DB has issues
const staticServices = [
  {
    id: 'strategy-consulting',
    slug: 'strategy-consulting',
    name: 'Tư vấn chiến thuật',
    description:
      'Phân tích và tối ưu chiến thuật cho từng tình huống trong game với đội ngũ chuyên gia top 1% server. Chúng tôi sẽ phân tích chi tiết tài khoản, tối ưu formation, và đưa ra kế hoạch phát triển cá nhân hóa.',
    short_description: 'Tư vấn chiến thuật chuyên nghiệp',
    base_price: 500000,
    currency: 'VND',
    category: 'STRATEGY',
    is_active: true,
    is_featured: false,
    sort_order: 1,
    metadata: {
      features: [
        'Phân tích tình huống chiến đấu chi tiết',
        'Tối ưu hóa formation cho từng commander',
        'Lên kế hoạch phát triển dài hạn',
        'Hỗ trợ 24/7 qua Discord',
        'Báo cáo tiến độ hàng tuần'
      ],
      requirements: [
        'Tài khoản RoK active',
        'Power tối thiểu 1M',
        'Discord để liên lạc',
        'Thông tin chi tiết về tài khoản'
      ]
    }
  },
  {
    id: 'alliance-management',
    slug: 'alliance-management',
    name: 'Quản lý liên minh',
    description:
      'Hỗ trợ toàn diện trong việc quản lý, tuyển dụng và phát triển liên minh mạnh mẽ. Từ thiết lập cấu trúc quản lý đến phát triển hệ thống event và training thành viên.',
    short_description: 'Quản lý liên minh chuyên nghiệp',
    base_price: 1000000,
    currency: 'VND',
    category: 'MANAGEMENT',
    is_active: true,
    is_featured: true,
    sort_order: 2,
    metadata: {
      features: [
        'Thiết lập cấu trúc quản lý R4/R5',
        'Hệ thống tuyển dụng chuyên nghiệp',
        'Quản lý sự kiện và hoạt động',
        'Phát triển và training thành viên',
        'Template và tools quản lý'
      ],
      requirements: [
        'Là R5 hoặc R4 của liên minh',
        'Liên minh có ít nhất 20 thành viên',
        'Cam kết thực hiện theo hướng dẫn'
      ]
    }
  },
  {
    id: 'kvk-support',
    slug: 'kvk-support',
    name: 'Hỗ trợ KvK',
    description:
      'Chiến thuật và coordination chuyên nghiệp cho Kingdom vs Kingdom. Hỗ trợ từ planning phase đến execution với real-time coordination và post-KvK analysis.',
    short_description: 'Hỗ trợ KvK chuyên nghiệp',
    base_price: 2000000,
    currency: 'VND',
    category: 'STRATEGY',
    is_active: true,
    is_featured: true,
    sort_order: 3,
    metadata: {
      features: [
        'Chiến thuật KvK cho mọi giai đoạn',
        'Real-time coordination trong battle',
        'Map control và territory strategy',
        'Migration timing và support',
        'Rally leadership training'
      ],
      requirements: [
        'Kingdom tham gia KvK',
        'Power minimum 10M',
        'Role R4/R5 hoặc rally leader',
        'Available 24/7 during KvK'
      ]
    }
  },
  {
    id: 'vip-support',
    slug: 'vip-support',
    name: 'VIP Support 24/7',
    description:
      'Gói dịch vụ cao cấp nhất với hỗ trợ ưu tiên và tư vấn chuyên nghiệp mọi lúc mọi nơi. Bao gồm tất cả dịch vụ khác với dedicated account manager.',
    short_description: 'VIP Support 24/7',
    base_price: 3000000,
    currency: 'VND',
    category: 'PREMIUM',
    is_active: true,
    is_featured: true,
    sort_order: 4,
    metadata: {
      features: [
        'Hỗ trợ 24/7 với priority response',
        'Tất cả dịch vụ khác được included',
        'Dedicated account manager',
        'Custom strategy development',
        'Exclusive community và resources'
      ],
      requirements: [
        'Cam kết sử dụng dịch vụ 30 ngày',
        'Power minimum 50M',
        'Available for consultation sessions'
      ]
    }
  },
  {
    id: 'commander-training',
    slug: 'commander-training',
    name: 'Training Commander',
    description:
      'Hướng dẫn chi tiết cách build và phát triển commander hiệu quả nhất. Từ talent tree optimization đến equipment và pairing strategies.',
    short_description: 'Training commander chuyên nghiệp',
    base_price: 300000,
    currency: 'VND',
    category: 'TRAINING',
    is_active: true,
    is_featured: false,
    sort_order: 5,
    metadata: {
      features: [
        'Tư vấn talent build tối ưu',
        'Equipment recommendations chi tiết',
        'Commander pairing strategies',
        'Session training 1-on-1',
        'Follow-up và progress tracking'
      ],
      requirements: [
        'Có ít nhất 1 commander 5-star',
        'Resources để implement changes',
        'Time commitment cho training'
      ]
    }
  },
  {
    id: 'personal-coaching',
    slug: 'personal-coaching',
    name: 'Coaching 1-on-1',
    description:
      'Hướng dẫn cá nhân hóa từ chuyên gia top player hàng đầu. Customize hoàn toàn theo nhu cầu và mục tiêu cá nhân của từng player.',
    short_description: 'Coaching cá nhân 1-on-1',
    base_price: 200000,
    currency: 'VND',
    category: 'TRAINING',
    is_active: true,
    is_featured: false,
    sort_order: 6,
    metadata: {
      features: [
        'Session 1-on-1 riêng biệt',
        'Customize hoàn toàn theo nhu cầu',
        'Top player guidance trực tiếp',
        'Follow-up support sau session',
        'Recording session để review'
      ],
      requirements: [
        'Xác định rõ goals muốn đạt được',
        'Flexible schedule cho sessions',
        'Commitment để implement advice'
      ]
    }
  }
]
interface RouteParams {
  params: {
    slug: string
  }
}
// GET /api/services/[slug] - Lấy thông tin service theo slug
export function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params
    // Find service by slug from static data
    const service = staticServices.find(s => s.slug === slug && s.is_active)
    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not found',
          message: `Service with slug '${slug}' does not exist or is not active`
        },
        { status: 404 }
      )
    }
    return NextResponse.json({
      success: true,
      data: service
    })
  } catch (error) {
    console.error('Service detail API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch service details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
