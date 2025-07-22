'use client'

import Link from 'next/link'
import { 
  Target, 
  Users, 
  Sword, 
  Crown, 
  MessageCircle, 
  BarChart3, 
  Calendar, 
  Headphones,
  ArrowRight 
} from 'lucide-react'

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
    iconColor: 'text-blue-600',
  },
  {
    id: 'alliance-management',
    title: 'Quản lý liên minh',
    description: 'Hỗ trợ quản lý, tuyển dụng và phát triển liên minh mạnh mẽ',
    price: '1.000.000 VNĐ/tháng',
    icon: Users,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    featured: true,
  },
  {
    id: 'commander-training',
    title: 'Training Commander',
    description: 'Hướng dẫn build và phát triển commander hiệu quả nhất',
    price: '300.000 VNĐ/session',
    icon: Sword,
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    id: 'kvk-support',
    title: 'Hỗ trợ KvK',
    description: 'Chiến thuật và coordination chuyên nghiệp cho Kingdom vs Kingdom',
    price: '2.000.000 VNĐ/KvK',
    icon: Crown,
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    featured: true,
  },
  {
    id: 'personal-coaching',
    title: 'Coaching 1-on-1',
    description: 'Hướng dẫn cá nhân hóa từ chuyên gia top player hàng đầu',
    price: '200.000 VNĐ/giờ',
    icon: MessageCircle,
    iconBgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'account-analysis',
    title: 'Phân tích tài khoản',
    description: 'Đánh giá toàn diện và đưa ra lộ trình phát triển tài khoản',
    price: '150.000 VNĐ/lần',
    icon: BarChart3,
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    id: 'event-support',
    title: 'Hỗ trợ Event',
    description: 'Tối ưu hóa chiến lược cho các sự kiện đặc biệt và limited time',
    price: '400.000 VNĐ/event',
    icon: Calendar,
    iconBgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    id: 'vip-support',
    title: 'VIP Support 24/7',
    description: 'Hỗ trợ ưu tiên và tư vấn chuyên nghiệp mọi lúc mọi nơi',
    price: '3.000.000 VNĐ/tháng',
    icon: Headphones,
    iconBgColor: 'bg-accent-100',
    iconColor: 'text-accent-600',
    featured: true,
  },
]

export default function Services() {
  return (
    <section className="relative bg-gradient-to-br from-white via-primary-50/30 to-white section-padding">
      <div className="container-max">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            Dịch vụ chuyên nghiệp cho{' '}
            <span className="text-gradient">Rise of Kingdoms</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Nâng tầm trải nghiệm chơi game của bạn với các dịch vụ chất lượng cao 
            từ đội ngũ chuyên gia hàng đầu Việt Nam
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Không tìm thấy dịch vụ phù hợp? Liên hệ với chúng tôi để được tư vấn cá nhân hóa
          </p>
          <Link 
            href="/contact" 
            className="btn-secondary inline-flex items-center space-x-2"
            aria-label="Liên hệ để được tư vấn thêm về dịch vụ"
          >
            <span>Tư vấn miễn phí</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
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

  return (
    <div 
      className={`
        card relative group cursor-pointer transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1
        ${featured ? 'ring-2 ring-primary-200 shadow-lg' : ''}
      `}
      role="article"
      aria-labelledby={`service-title-${service.id}`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 -right-3 bg-accent-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
          Phổ biến
        </div>
      )}

      {/* Icon */}
      <div className={`
        inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4
        ${iconBgColor} group-hover:scale-110 transition-transform duration-300
      `}>
        <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h3 
          id={`service-title-${service.id}`}
          className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200"
        >
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-primary-600">
              {price}
            </span>
          </div>

          <button
            className="w-full btn-primary text-sm py-2.5 group-hover:bg-primary-700 transition-colors duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={`Đặt dịch vụ ${title}`}
          >
            Đặt dịch vụ
          </button>
        </div>
      </div>
    </div>
  )
}
