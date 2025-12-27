'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { ServiceReviews } from '@/components/reviews/ServiceReviews'
import { useLanguage } from '@/contexts/LanguageContext'

interface ServiceTier {
  id: string
  name: string
  slug: string
  price: number
  features: string[]
  isPopular: boolean
}

interface ServiceData {
  slug: string
  name: string
  description: string
  shortDescription: string
  tiers: ServiceTier[]
}

interface ServiceDetailClientProps {
  slug: string
  serviceData: ServiceData
}

export default function ServiceDetailClient({ slug, serviceData }: ServiceDetailClientProps) {
  const router = useRouter()
  const { t } = useLanguage()
  // Default to popular tier or middle tier
  const defaultIndex = serviceData.tiers.findIndex(t => t.isPopular) ?? Math.floor(serviceData.tiers.length / 2)
  const [selectedTierIndex, setSelectedTierIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0)

  const service = serviceData

  const handleBookService = () => {
    const selectedTier = service.tiers[selectedTierIndex]
    if (!selectedTier) return
    const bookingUrl = `/booking?service=${slug}&tier=${selectedTier.slug}`
    router.push(bookingUrl)
  }

  const handleContactSupport = () => {
    router.push('/contact')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        {/* Hero Section */}
        <section className="section-padding-y container-max">
          <div className="animate-fadeInUp mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
              <span>🎯</span>
              {t.hero.badge}
            </div>

            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">{service.name}</h1>

            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-slate-600">
              {service.description}
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 backdrop-blur">
                <span className="text-xl">🛡️</span>
                <span className="text-sm font-medium">{t.features.safety.title}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 backdrop-blur">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-medium">{t.features.results.title}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 backdrop-blur">
                <span className="text-xl">👥</span>
                <span className="text-sm font-medium">{t.hero.stats.customers}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section className="section-padding container-max">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Service Description */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Mô tả dịch vụ</h2>
                <p className="text-slate-700 leading-relaxed">{service.description}</p>
              </div>

              {/* Available Tiers with Features */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Các gói dịch vụ</h2>
                <div className="space-y-6">
                  {service.tiers.map((tier, index) => (
                    <div key={tier.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                        <span className="text-lg font-bold text-amber-600">
                          {tier.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {tier.features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600">✅</span>
                            <span className="text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Reviews */}
              <ServiceReviews serviceSlug={slug} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="card animate-fadeInUp sticky top-6">
                <h3 className="mb-6 text-xl font-bold text-slate-900">{t.pricing.title}</h3>

                <div className="space-y-4">
                  {service.tiers.map((tier, index) => (
                    <button
                      key={tier.id}
                      type="button"
                      className={`hover-lift relative w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                        selectedTierIndex === index
                          ? 'z-10 scale-105 border-amber-500 bg-amber-50 shadow-lg'
                          : 'border-slate-200 hover:border-amber-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTierIndex(index)}
                    >
                      {tier.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
                          {t.pricing.popular}
                        </div>
                      )}

                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{tier.name}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {tier.price.toLocaleString('vi-VN')}
                          </div>
                          <div className="text-sm text-slate-500">VNĐ</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {tier.features.slice(0, 3).map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-green-600">✅</span>
                            <span className="text-slate-600">{feature}</span>
                          </div>
                        ))}
                        {tier.features.length > 3 && (
                          <div className="text-xs text-slate-500">
                            +{tier.features.length - 3} tính năng khác
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

                  <button
                    className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-lg active:scale-95"
                    onClick={handleBookService}
                  >
                    <span>{t.common.bookNow}</span>
                    <span>➡️</span>
                  </button>

                  <div className="text-center text-sm text-slate-500">
                    💰 {t.features.safety.title} • 🔒 {t.features.safety.desc}
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="card animate-fadeInUp bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <h3 className="mb-4 text-xl font-bold">🤝 {t.common.contact}?</h3>
                <p className="mb-6 text-sm opacity-90">{t.hero.subtitle}</p>
                <div className="space-y-3">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-3 text-center transition-colors duration-300 hover:bg-white/30"
                    onClick={handleContactSupport}
                  >
                    <span>💬</span>
                    <span>{t.common.contact}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
