'use client'

import { Clock, Trophy, Shield, Zap, Star, TrendingUp, CheckCircle } from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  statistic: string
  statisticLabel: string
  icon: React.ComponentType<{ className?: string }>
  iconBgColor: string
  iconColor: string
}

const features: Feature[] = [
  {
    id: 'expert-support',
    title: 'Chuyên gia 24/7',
    description:
      'Đội ngũ chuyên gia Rise of Kingdoms luôn sẵn sàng hỗ trợ bạn mọi lúc mọi nơi, kể cả trong những trận đấu quan trọng nhất.',
    statistic: '24/7',
    statisticLabel: 'Hỗ trợ liên tục',
    icon: Clock,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'top-players',
    title: 'Đội ngũ Top Player',
    description:
      'Được hướng dẫn bởi những game thủ hàng đầu Việt Nam, thuộc top 1% player toàn cầu với kinh nghiệm thực chiến phong phú.',
    statistic: 'Top 1%',
    statisticLabel: 'Players toàn cầu',
    icon: Trophy,
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    id: 'exclusive-strategies',
    title: 'Chiến thuật độc quyền',
    description:
      'Kho tàng hơn 500+ chiến thuật độc quyền được phát triển và kiểm chứng qua hàng nghìn trận đấu thực tế.',
    statistic: '500+',
    statisticLabel: 'Chiến thuật độc quyền',
    icon: Shield,
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 'realtime-support',
    title: 'Hỗ trợ Real-time',
    description:
      'Phản hồi siêu nhanh trong vòng 5 phút, đặc biệt hữu ích trong các tình huống khẩn cấp như KvK hay rally defense.',
    statistic: '< 5 phút',
    statisticLabel: 'Thời gian phản hồi',
    icon: Zap,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'experience',
    title: 'Kinh nghiệm 5+ năm',
    description:
      'Đội ngũ với hơn 5 năm kinh nghiệm chơi Rise of Kingdoms, từng trải qua tất cả các meta và update của game.',
    statistic: '5+',
    statisticLabel: 'Năm kinh nghiệm',
    icon: Star,
    iconBgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'success-rate',
    title: 'Tỷ lệ thành công cao',
    description:
      'Với 95% khách hàng đạt được mục tiêu đề ra, chúng tôi tự hào là đơn vị cung cấp dịch vụ RoK uy tín nhất.',
    statistic: '95%',
    statisticLabel: 'Tỷ lệ thành công',
    icon: TrendingUp,
    iconBgColor: 'bg-accent-100',
    iconColor: 'text-accent-600'
  }
]

export default function Features() {
  return (
    <section className="section-padding relative bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <div className="container-max">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tại sao chọn <span className="text-gradient">RoK Services</span>?
          </h2>
          <p className="text-lg leading-relaxed text-gray-600">
            Chúng tôi mang đến những giá trị vượt trội giúp bạn chinh phục Rise of Kingdoms một cách
            chuyên nghiệp và hiệu quả nhất
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-6 py-3 shadow-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">
              Đã được hơn 1000+ game thủ tin tưởng
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  feature: Feature
  index: number
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const {
    title,
    description,
    statistic,
    statisticLabel,
    icon: Icon,
    iconBgColor,
    iconColor
  } = feature

  return (
    <div
      className="group relative"
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="space-y-6 text-center">
        {/* Icon & Statistic */}
        <div className="relative">
          <div
            className={`
            mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl
            ${iconBgColor} transition-transform duration-300 group-hover:scale-110
          `}
          >
            <Icon aria-hidden="true" className={`h-8 w-8 ${iconColor}`} />
          </div>

          {/* Floating Statistic */}
          <div className="absolute -right-2 -top-2 rounded-lg border border-gray-200 bg-white px-3 py-1 shadow-lg">
            <div className="text-lg font-bold text-primary-600">{statistic}</div>
            <div className="whitespace-nowrap text-xs text-gray-500">{statisticLabel}</div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600">
            {title}
          </h3>

          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>

        {/* Hover Effect Line */}
        <div className="mx-auto h-1 w-0 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500 group-hover:w-full" />
      </div>
    </div>
  )
}
