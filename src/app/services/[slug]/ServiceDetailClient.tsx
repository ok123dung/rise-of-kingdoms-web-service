'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { ServiceReviews } from '@/components/reviews/ServiceReviews'
import { useLanguage } from '@/contexts/LanguageContext'

interface ServiceDetailClientProps {
  slug: string
}

interface PricingTier {
  tier: string
  price: number
  duration: string
  features: string[]
}

export default function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [selectedTierIndex, setSelectedTierIndex] = useState(1) // Default to middle tier

  const service = t.services[slug as keyof typeof t.services]

  // Handle case where service might not be found (though page.tsx checks this too)
  if (!service) {
    return null
  }

  const handleBookService = () => {
    const selectedTier = service.pricing[selectedTierIndex]
    // Use the tier name or index as slug since we don't have explicit slugs in translation
    const tierSlug = selectedTier.tier.toLowerCase().replace(/\s+/g, '-')
    const bookingUrl = `/booking?service=${slug}&tier=${tierSlug}`
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
              {/* Features */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">{t.autoService.title}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {service.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 text-green-600">✅</span>
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">
                  {t.features.results.title}
                </h2>
                <div className="space-y-3">
                  {service.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                      <span className="text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process - Static for now as it wasn't in servicesData */}
              <div className="card animate-fadeInUp">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Quy trình thực hiện</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                      1
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-slate-900">{t.common.bookNow}</h3>
                      <p className="text-sm text-slate-600">{t.pricing.subtitle}</p>
                    </div>
                  </div>
                  {/* ... other process steps can be localized later or kept static if acceptable */}
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
                  {(service.pricing as PricingTier[]).map((tier: PricingTier, index: number) => (
                    <button
                      key={index}
                      type="button"
                      className={`hover-lift relative w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-300 ${
                        selectedTierIndex === index
                          ? 'z-10 scale-105 border-amber-500 bg-amber-50 shadow-lg'
                          : 'border-slate-200 hover:border-amber-300 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTierIndex(index)}
                    >
                      {index === 1 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
                          {t.pricing.popular}
                        </div>
                      )}

                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{tier.tier}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900">
                            {tier.price.toLocaleString('vi-VN')}
                          </div>
                          <div className="text-sm text-slate-500">VNĐ</div>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                        <span>⏱️</span>
                        <span>{tier.duration}</span>
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
