'use client'

import {
  Target,
  Users,
  Sword,
  Crown,
  MessageCircle,
  BarChart3,
  Calendar,
  Headphones,
  ArrowRight,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  title: string
  description: string
  price: string
  icon: React.ComponentType<{ className?: string }>
  iconBgColor: string
  iconColor: string
  featured?: boolean
}

const services: Service[] = [
  {
    id: 'strategy-consulting',
    title: 'Tư vấn chiến thuật',
    description: 'Phân tích và tối ưu chiến thuật cho từng tình huống trong game',
    price: '500.000 VNĐ/tháng',
    icon: Target,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'alliance-management',
    title: 'Quản lý liên minh',
    description: 'Hỗ trợ quản lý, tuyển dụng và phát triển liên minh mạnh mẽ',
    price: '1.000.000 VNĐ/tháng',
    icon: Users,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    featured: true
  },
  {
    id: 'commander-training',
    title: 'Training Commander',
    description: 'Hướng dẫn build và phát triển commander hiệu quả nhất',
    price: '300.000 VNĐ/session',
    icon: Sword,
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 'kvk-support',
    title: 'Hỗ trợ KvK',
    description: 'Chiến thuật và coordination chuyên nghiệp cho Kingdom vs Kingdom',
    price: '2.000.000 VNĐ/KvK',
    icon: Crown,
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    featured: true
  },
  {
    id: 'personal-coaching',
    title: 'Coaching 1-on-1',
    description: 'Hướng dẫn cá nhân hóa từ chuyên gia top player hàng đầu',
    price: '200.000 VNĐ/giờ',
    icon: MessageCircle,
    iconBgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'account-analysis',
    title: 'Phân tích tài khoản',
    description: 'Đánh giá toàn diện và đưa ra lộ trình phát triển tài khoản',
    price: '150.000 VNĐ/lần',
    icon: BarChart3,
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    id: 'event-support',
    title: 'Hỗ trợ Event',
    description: 'Tối ưu hóa chiến lược cho các sự kiện đặc biệt và limited time',
    price: '400.000 VNĐ/event',
    icon: Calendar,
    iconBgColor: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    id: 'vip-support',
    title: 'VIP Support 24/7',
    description: 'Hỗ trợ ưu tiên và tư vấn chuyên nghiệp mọi lúc mọi nơi',
    price: '3.000.000 VNĐ/tháng',
    icon: Headphones,
    iconBgColor: 'bg-accent-100',
    iconColor: 'text-accent-600',
    featured: true
  }
]

export default function Services() {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/20" />
      <div className="animate-float absolute right-10 top-20 opacity-10">
        <Crown className="h-32 w-32 text-amber-400" />
      </div>
      <div
        className="animate-float absolute bottom-20 left-10 opacity-10"
        style={{ animationDelay: '3s' }}
      >
        <Shield className="h-24 w-24 text-blue-400" />
      </div>

      <div className="container-max relative z-10">
        {/* Header */}
        <div className="animate-fadeInUp mx-auto mb-20 max-w-4xl text-center">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              <Shield className="mr-2 h-4 w-4" />
              Dịch vụ chuyên nghiệp
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Dịch vụ premium cho <span className="text-gradient animate-glow">Rise of Kingdoms</span>
          </h2>

          <p className="text-xl leading-relaxed text-slate-600">
            Nâng tầm trải nghiệm chơi game của bạn với các dịch vụ chất lượng cao từ đội ngũ{' '}
            <span className="font-semibold text-amber-600">chuyên gia hàng đầu Việt Nam</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="animate-fadeInUp mt-20 text-center">
          <div className="glassmorphism mx-auto max-w-2xl p-8">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">Cần tư vấn cá nhân hóa?</h3>
            <p className="mb-8 text-slate-600">
              Không tìm thấy dịch vụ phù hợp? Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn miễn
              phí để tìm ra giải pháp tốt nhất cho bạn.
            </p>
            <Link
              aria-label="Liên hệ để được tư vấn thêm về dịch vụ"
              className="btn-primary inline-flex items-center space-x-3 px-8 py-4 text-lg"
              href="/contact"
            >
              <span>Tư vấn miễn phí</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ServiceCardProps {
  service: Service
}

function ServiceCard({ service }: ServiceCardProps) {
  const { title, description, price, icon: Icon, iconBgColor, iconColor, featured } = service

  const cardClass = featured ? 'card-premium' : 'card'

  return (
    <div
      aria-labelledby={`service-title-${service.id}`}
      role="article"
      className={`
        ${cardClass} hover-lift group relative cursor-pointer
        ${featured ? 'border-2 border-amber-200 shadow-2xl' : ''}
      `}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -right-4 -top-4 z-10">
          <div className="animate-pulse-slow rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-white shadow-xl">
            <span className="flex items-center space-x-1">
              <Crown className="h-4 w-4" />
              <span>Premium</span>
            </span>
          </div>
        </div>
      )}

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="animate-shine absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Icon */}
      <div className="relative">
        <div
          className={`
          mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl
          ${iconBgColor} shadow-lg transition-all duration-500 group-hover:scale-110
          ${featured ? 'shadow-amber-200/50' : ''}
        `}
        >
          <Icon
            aria-hidden="true"
            className={`h-8 w-8 ${iconColor} transition-transform duration-300 group-hover:scale-110`}
          />
        </div>
        {featured && (
          <div className="absolute -inset-2 -z-10 rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-xl" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3
          id={`service-title-${service.id}`}
          className={`text-2xl font-bold transition-colors duration-300 ${featured
              ? 'text-slate-900 group-hover:text-amber-700'
              : 'text-slate-900 group-hover:text-blue-600'
            }`}
        >
          {title}
        </h3>

        <p className="leading-relaxed text-slate-600">{description}</p>

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-6">
            <span className={`text-3xl font-bold ${featured ? 'text-gradient' : 'text-blue-600'}`}>
              {price}
            </span>
            <span className="ml-2 text-sm text-slate-500">
              {featured ? '✨ Ưu đãi đặc biệt' : 'Giá cạnh tranh'}
            </span>
          </div>

          <Link
            aria-label={`Đặt dịch vụ ${title}`}
            href="/contact"
            className={`
              block w-full transform rounded-xl px-6 py-4 text-center font-semibold transition-all duration-300
              ${featured
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:scale-105 hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-500/25'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25'
              }
            `}
          >
            {featured ? '🔥 Đặt ngay' : 'Đặt dịch vụ'}
          </Link>
        </div>
      </div>
    </div>
  )
}
