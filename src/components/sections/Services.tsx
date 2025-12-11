'use client'

import { ArrowRight, Crown, Shield } from 'lucide-react'
import Link from 'next/link'

import { SERVICES_CONFIG, type ServiceConfig } from '@/config/services'

export default function Services() {
  return (
    <section className="section-padding relative overflow-hidden" data-testid="services-section">
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
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {SERVICES_CONFIG.map((service, index) => (
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
  service: ServiceConfig
}

function ServiceCard({ service }: ServiceCardProps) {
  const { title, description, price, icon: Icon, iconBgColor, iconColor, featured } = service

  const cardClass = featured ? 'card-premium' : 'card'

  return (
    <div
      aria-labelledby={`service-title-${service.id}`}
      data-testid="service-card"
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
          className={`text-2xl font-bold transition-colors duration-300 ${
            featured
              ? 'text-slate-900 group-hover:text-amber-700'
              : 'text-slate-900 group-hover:text-blue-600'
          }`}
        >
          {title}
        </h3>

        <p className="leading-relaxed text-slate-600">{description}</p>

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-6">
            <span
              className={`price text-3xl font-bold ${featured ? 'text-gradient' : 'text-blue-600'}`}
            >
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
              book-now-btn block w-full transform rounded-xl px-6 py-4 text-center font-semibold transition-all duration-300
              ${
                featured
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
