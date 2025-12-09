import { Target, type LucideIcon } from 'lucide-react'

export interface ServiceData {
  slug: string
  name: string
  short_description: string
  description: string
  icon: LucideIcon
  features: string[]
  benefits: string[]
  pricing: {
    tier: string
    slug: string
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
  'auto-gem-farm': {
    slug: 'auto-gem-farm',
    name: 'Auto Gem & Farm RoK',
    short_description: 'Auto Farm Gem & RSS 24/7',
    description:
      'Dịch vụ Auto Farm Gem và Tài nguyên chuyên nghiệp, an toàn 99%, bảo hành uy tín. Hệ thống hoạt động 24/7 giúp bạn tối ưu hóa tài nguyên.',
    icon: Target,
    features: [
      'Farm 4k-15k gem/ngày',
      'Chống ban 99% (Bảo hành 1 đền 1)',
      'Tự động mua shop VIP & Thương nhân',
      'Hỗ trợ làm sự kiện & đánh man',
      'Bật khiên tự động khi bị tấn công'
    ],
    benefits: [
      'Tiết kiệm thời gian cày cuốc',
      'Tối ưu hóa lượng Gem và RSS',
      'An toàn tuyệt đối với bảo hành',
      'Hỗ trợ 24/7 qua Zalo/Discord'
    ],
    pricing: [
      {
        tier: 'Gói Tuần',
        slug: 'auto-gem-weekly',
        price: 150000,
        duration: '1 tuần',
        features: [
          'Farm gem 4-15k/ngày',
          'Bấm help liên minh',
          'Mua shop VIP & Thương nhân',
          'Bật khiên tự động',
          'Farm RSS, Hộp, SK 7k gem'
        ]
      },
      {
        tier: 'Gói V1',
        slug: 'auto-gem-v1',
        price: 750000,
        duration: '1 tháng',
        features: [
          'Tất cả tính năng gói tuần',
          'Nhặt hang làng, dò sương mù',
          'Luyện lính mặc định',
          'Donate liên minh',
          'Nhặt quà sự kiện, nhiệm vụ ngày'
        ]
      },
      {
        tier: 'Gói V2',
        slug: 'auto-gem-v2',
        price: 900000,
        duration: '1 tháng',
        features: [
          'Tất cả tính năng gói V1',
          'Kéo man tay thường xuyên',
          'Luyện lính & Mua đồ chi tiết',
          'Set mua speed gem giảm 70%',
          'Luyện vật liệu & Đánh man rợ xả AP'
        ]
      },
      {
        tier: 'Gói Đặc Biệt',
        slug: 'auto-gem-special',
        price: 7000000,
        duration: '1 mùa KvK',
        features: [
          'Kéo top danh dự KvK',
          'Bao thua KvK',
          'Chạy 24/7 cả mùa KvK',
          'Tối ưu hóa điểm danh dự',
          'Hỗ trợ chiến thuật'
        ]
      }
    ]
  }
}
