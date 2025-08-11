import { Shield, Users, Target, Trophy, Crown, Star } from 'lucide-react'

export interface ServiceData {
  slug: string
  name: string
  shortDescription: string
  description: string
  icon: any
  features: string[]
  benefits: string[]
  pricing: {
    tier: string
    price: number
    duration: string
    features: string[]
  }[]
  testimonials?: {
    name: string
    kingdom: string
    content: string
    rating: number
  }[]
}

export const servicesData: Record<string, ServiceData> = {
  'strategy-consulting': {
    slug: 'strategy-consulting',
    name: 'Tư vấn chiến thuật Rise of Kingdoms',
    shortDescription: 'Chiến lược chuyên sâu từ các chuyên gia hàng đầu',
    description: 'Dịch vụ tư vấn chiến thuật chuyên nghiệp giúp bạn phát triển kingdom mạnh mẽ, tối ưu commander và chiến thắng trong mọi trận chiến.',
    icon: Shield,
    features: [
      'Phân tích kingdom và đưa ra chiến lược phát triển',
      'Tư vấn build commander tối ưu',
      'Lập kế hoạch phát triển VIP hiệu quả',
      'Chiến thuật cho các sự kiện trong game',
      'Hướng dẫn quản lý tài nguyên thông minh'
    ],
    benefits: [
      'Tiết kiệm thời gian và tài nguyên',
      'Tránh những sai lầm tốn kém',
      'Phát triển nhanh hơn 3x so với tự mày mò',
      'Được support 24/7 qua Discord'
    ],
    pricing: [
      {
        tier: 'Cơ bản',
        price: 500000,
        duration: '1 tháng',
        features: [
          'Tư vấn 1 lần/tuần',
          'Review account',
          'Kế hoạch phát triển',
          'Support qua Discord'
        ]
      },
      {
        tier: 'Nâng cao',
        price: 1500000,
        duration: '1 tháng',
        features: [
          'Tư vấn không giới hạn',
          'Review account hàng tuần',
          'Chiến lược KvK',
          'Support ưu tiên 24/7',
          'Video hướng dẫn riêng'
        ]
      },
      {
        tier: 'VIP',
        price: 3000000,
        duration: '1 tháng',
        features: [
          'Mọi tính năng Nâng cao',
          'Coaching 1-1 hàng ngày',
          'Tham gia nhóm VIP',
          'Tool tính toán độc quyền',
          'Chiến lược Osiris League'
        ]
      }
    ]
  },
  'alliance-management': {
    slug: 'alliance-management',
    name: 'Quản lý liên minh chuyên nghiệp',
    shortDescription: 'Xây dựng và phát triển liên minh mạnh mẽ',
    description: 'Dịch vụ hỗ trợ quản lý liên minh từ A-Z, giúp xây dựng một liên minh đoàn kết và mạnh mẽ trong Rise of Kingdoms.',
    icon: Users,
    features: [
      'Tư vấn cấu trúc và tổ chức liên minh',
      'Xây dựng nội quy và chính sách',
      'Quản lý territory và diplomacy',
      'Chiến lược cho Ark of Osiris',
      'Training R4/R5 chuyên nghiệp'
    ],
    benefits: [
      'Liên minh phát triển bền vững',
      'Giảm drama và conflict nội bộ',
      'Tăng tỷ lệ thắng trong các event',
      'Thu hút và giữ chân thành viên giỏi'
    ],
    pricing: [
      {
        tier: 'Startup',
        price: 2000000,
        duration: '1 tháng',
        features: [
          'Setup liên minh từ đầu',
          'Tư vấn cấu trúc',
          'Template nội quy',
          'Training R4 cơ bản'
        ]
      },
      {
        tier: 'Growth',
        price: 4000000,
        duration: '1 tháng',
        features: [
          'Mọi tính năng Startup',
          'Chiến lược phát triển',
          'Quản lý diplomacy',
          'Support trong KvK',
          'Discord bot setup'
        ]
      },
      {
        tier: 'Enterprise',
        price: 8000000,
        duration: '1 tháng',
        features: [
          'Full service management',
          'Đại diện trong đàm phán',
          'Training team R4/R5',
          'Tool quản lý độc quyền',
          'Analytics dashboard'
        ]
      }
    ]
  },
  'commander-training': {
    slug: 'commander-training',
    name: 'Training Commander chuyên sâu',
    shortDescription: 'Tối ưu hóa sức mạnh commander của bạn',
    description: 'Hướng dẫn chi tiết cách build và sử dụng commander hiệu quả nhất cho từng mục đích trong Rise of Kingdoms.',
    icon: Target,
    features: [
      'Phân tích và đánh giá commander hiện tại',
      'Lộ trình nâng skill tối ưu',
      'Cặp đôi commander cho từng tình huống',
      'Hướng dẫn sử dụng trong combat',
      'Tư vấn equipment và talent tree'
    ],
    benefits: [
      'Tiết kiệm sculpture và resources',
      'Tăng sức mạnh combat đáng kể',
      'Hiểu rõ meta và counter',
      'Sẵn sàng cho mọi tình huống chiến đấu'
    ],
    pricing: [
      {
        tier: 'Basic',
        price: 400000,
        duration: 'Gói',
        features: [
          'Review 5 commander',
          'Skill order guide',
          'Talent tree templates',
          'Pairing suggestions'
        ]
      },
      {
        tier: 'Advanced',
        price: 800000,
        duration: 'Gói',
        features: [
          'Review toàn bộ commander',
          'Video guide chi tiết',
          'Equipment optimization',
          'Combat tactics guide',
          'Update meta hàng tháng'
        ]
      },
      {
        tier: 'Master',
        price: 1500000,
        duration: 'Gói',
        features: [
          'Mọi tính năng Advanced',
          '1-on-1 coaching sessions',
          'Live combat training',
          'Personal build calculator',
          'Priority meta updates'
        ]
      }
    ]
  },
  'kvk-support': {
    slug: 'kvk-support',
    name: 'Hỗ trợ KvK chuyên nghiệp',
    shortDescription: 'Chiến thắng trong Kingdom vs Kingdom',
    description: 'Dịch vụ hỗ trợ toàn diện cho KvK, từ chuẩn bị đến chiến thuật và execution trong trận chiến.',
    icon: Trophy,
    features: [
      'Lập kế hoạch pre-KvK preparation',
      'Chiến thuật cho từng stage',
      'Coordination và timing attacks',
      'Resource và speedup management',
      'Post-KvK recovery strategy'
    ],
    benefits: [
      'Maximize rewards từ KvK',
      'Minimize losses và downtime',
      'Better coordination với alliance',
      'Chiến thắng nhiều objective hơn'
    ],
    pricing: [
      {
        tier: 'Support',
        price: 1000000,
        duration: 'Per KvK',
        features: [
          'Pre-KvK checklist',
          'Basic strategy guide',
          'Discord support',
          'Resource calculator'
        ]
      },
      {
        tier: 'Tactical',
        price: 2500000,
        duration: 'Per KvK',
        features: [
          'Full strategy planning',
          'Live tactical support',
          'Coordination assistance',
          'Rally/garrison guidance',
          'Daily briefings'
        ]
      },
      {
        tier: 'Command',
        price: 5000000,
        duration: 'Per KvK',
        features: [
          'Act as war consultant',
          '24/7 on-call support',
          'Lead planning sessions',
          'Real-time decision making',
          'Post-war analysis'
        ]
      }
    ]
  },
  'vip-support': {
    slug: 'vip-support',
    name: 'VIP Support 24/7',
    shortDescription: 'Dịch vụ hỗ trợ cao cấp không giới hạn',
    description: 'Gói dịch vụ VIP all-inclusive với support 24/7, tư vấn không giới hạn và nhiều đặc quyền độc quyền.',
    icon: Crown,
    features: [
      'Hỗ trợ 24/7 qua mọi kênh',
      'Tư vấn không giới hạn mọi khía cạnh',
      'Ưu tiên xử lý mọi yêu cầu',
      'Access vào VIP community',
      'Tools và resources độc quyền'
    ],
    benefits: [
      'Không bỏ lỡ bất kỳ cơ hội nào',
      'Giải quyết vấn đề ngay lập tức',
      'Network với top players',
      'Always stay ahead of meta'
    ],
    pricing: [
      {
        tier: 'VIP Silver',
        price: 5000000,
        duration: '1 tháng',
        features: [
          'Support ưu tiên 24/7',
          'Unlimited consultations',
          'VIP Discord channel',
          'Monthly account review',
          'Exclusive guides'
        ]
      },
      {
        tier: 'VIP Gold',
        price: 10000000,
        duration: '1 tháng',
        features: [
          'Everything in Silver',
          'Personal account manager',
          'Weekly 1-on-1 sessions',
          'Custom tools access',
          'Event planning service'
        ]
      },
      {
        tier: 'VIP Platinum',
        price: 20000000,
        duration: '1 tháng',
        features: [
          'White glove service',
          'Dedicated support team',
          'Daily check-ins',
          'Play on your behalf',
          'Full account management'
        ]
      }
    ]
  },
  'personal-coaching': {
    slug: 'personal-coaching',
    name: 'Coaching 1-on-1',
    shortDescription: 'Huấn luyện cá nhân từ top players',
    description: 'Được coaching trực tiếp 1-1 từ những player hàng đầu, với lộ trình training được thiết kế riêng cho bạn.',
    icon: Star,
    features: [
      'Đánh giá skill level hiện tại',
      'Xây dựng lộ trình phát triển cá nhân',
      'Live coaching sessions',
      'Review gameplay và decision making',
      'Mindset và psychological coaching'
    ],
    benefits: [
      'Improve nhanh chóng và bền vững',
      'Fix bad habits và mistakes',
      'Learn pro strategies và tricks',
      'Build confidence trong combat'
    ],
    pricing: [
      {
        tier: 'Starter',
        price: 2000000,
        duration: '4 sessions',
        features: [
          '4 x 1-hour sessions',
          'Skill assessment',
          'Personal roadmap',
          'Homework & exercises',
          'Discord support'
        ]
      },
      {
        tier: 'Intensive',
        price: 5000000,
        duration: '10 sessions',
        features: [
          '10 x 1-hour sessions',
          'Daily check-ins',
          'Live combat training',
          'Video analysis',
          'Performance tracking'
        ]
      },
      {
        tier: 'Transformation',
        price: 12000000,
        duration: '1 tháng',
        features: [
          'Unlimited sessions',
          'Play together daily',
          'Complete transformation',
          'Join coach\'s alliance',
          'Lifetime mentorship'
        ]
      }
    ]
  }
}