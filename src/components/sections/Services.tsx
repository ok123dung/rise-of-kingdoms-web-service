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
  ArrowRight,
  Shield
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
    <section className="relative overflow-hidden section-padding">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/20"></div>
      <div className="absolute top-20 right-10 animate-float opacity-10">
        <Crown className="h-32 w-32 text-amber-400" />
      </div>
      <div className="absolute bottom-20 left-10 animate-float opacity-10" style={{ animationDelay: '3s' }}>
        <Shield className="h-24 w-24 text-blue-400" />
      </div>

      <div className="container-max relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fadeInUp">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <Shield className="w-4 h-4 mr-2" />
              Dịch vụ chuyên nghiệp
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Dịch vụ premium cho{' '}
            <span className="text-gradient animate-glow">Rise of Kingdoms</span>
          </h2>
          
          <p className="text-xl text-slate-600 leading-relaxed">
            Nâng tầm trải nghiệm chơi game của bạn với các dịch vụ chất lượng cao 
            từ đội ngũ <span className="text-amber-600 font-semibold">chuyên gia hàng đầu Việt Nam</span>
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
        <div className="text-center mt-20 animate-fadeInUp">
          <div className="glassmorphism max-w-2xl mx-auto p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Cần tư vấn cá nhân hóa?
            </h3>
            <p className="text-slate-600 mb-8">
              Không tìm thấy dịch vụ phù hợp? Đội ngũ chuyên gia của chúng tôi sẵn sàng 
              tư vấn miễn phí để tìm ra giải pháp tốt nhất cho bạn.
            </p>
            <Link 
              href="/contact" 
              className="btn-primary inline-flex items-center space-x-3 text-lg px-8 py-4"
              aria-label="Liên hệ để được tư vấn thêm về dịch vụ"
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
      className={`
        ${cardClass} relative group cursor-pointer hover-lift
        ${featured ? 'border-2 border-amber-200 shadow-2xl' : ''}
      `}
      role="article"
      aria-labelledby={`service-title-${service.id}`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-4 -right-4 z-10">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl animate-pulse-slow">
            <span className="flex items-center space-x-1">
              <Crown className="h-4 w-4" />
              <span>Premium</span>
            </span>
          </div>
        </div>
      )}

      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
      </div>

      {/* Icon */}
      <div className="relative">
        <div className={`
          inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
          ${iconBgColor} group-hover:scale-110 transition-all duration-500 shadow-lg
          ${featured ? 'shadow-amber-200/50' : ''}
        `}>
          <Icon className={`h-8 w-8 ${iconColor} group-hover:scale-110 transition-transform duration-300`} aria-hidden="true" />
        </div>
        {featured && (
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 to-amber-600/20 rounded-2xl blur-xl -z-10"></div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 
          id={`service-title-${service.id}`}
          className={`text-2xl font-bold transition-colors duration-300 ${
            featured 
              ? 'text-slate-900 group-hover:text-amber-700' 
              : 'text-slate-900 group-hover:text-blue-600'
          }`}
        >
          {title}
        </h3>
        
        <p className="text-slate-600 leading-relaxed">
          {description}
        </p>

        <div className="pt-4 border-t border-slate-100">
          <div className="mb-6">
            <span className={`text-3xl font-bold ${
              featured ? 'text-gradient' : 'text-blue-600'
            }`}>
              {price}
            </span>
            <span className="text-slate-500 text-sm ml-2">
              {featured ? '✨ Ưu đãi đặc biệt' : 'Giá cạnh tranh'}
            </span>
          </div>

          <Link
            href="/contact"
            className={`
              w-full text-center block py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform
              ${featured 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-amber-500/25 hover:scale-105' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-105'
              }
            `}
            aria-label={`Đặt dịch vụ ${title}`}
          >
            {featured ? '🔥 Đặt ngay' : 'Đặt dịch vụ'}
          </Link>
        </div>
      </div>
    </div>
  )
}
