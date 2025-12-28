'use client'

import { Check, Crown, Zap, Shield, Star } from 'lucide-react'
import Link from 'next/link'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Pricing() {
  const { t, language } = useLanguage()

  // USD prices for international customers
  const isEnglish = language === 'en'

  const tiers = [
    {
      name: t.pricing.week.name,
      id: 'weekly',
      href: '/contact?plan=weekly',
      price: isEnglish ? '$6' : '150.000đ',
      period: t.pricing.week.period,
      description: t.pricing.week.desc,
      features: t.pricing.week.features,
      featured: false,
      icon: Star,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      name: t.pricing.v1.name,
      id: 'v1',
      href: '/contact?plan=v1',
      price: isEnglish ? '$27' : '750.000đ',
      period: t.pricing.v1.period,
      description: t.pricing.v1.desc,
      features: t.pricing.v1.features,
      featured: true,
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      discount: t.pricing.v1.discount
    },
    {
      name: t.pricing.v2.name,
      id: 'v2',
      href: '/contact?plan=v2',
      price: isEnglish ? '$36' : '900.000đ',
      period: t.pricing.v2.period,
      description: t.pricing.v2.desc,
      features: t.pricing.v2.features,
      featured: false,
      icon: Crown,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      discount: t.pricing.v2.discount
    },
    {
      name: t.pricing.special.name,
      id: 'special',
      href: '/contact?plan=special',
      price: isEnglish ? '$260' : '7.000.000đ',
      period: t.pricing.special.period,
      description: t.pricing.special.desc,
      features: t.pricing.special.features,
      featured: false,
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <section className="section-padding relative overflow-hidden bg-slate-50">
      <div className="container-max relative z-10">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.pricing.title} <span className="text-gradient">Auto Gem & Farm</span>
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">{t.pricing.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`
                relative flex flex-col rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                ${tier.featured ? 'ring-2 ring-amber-500' : ''}
              `}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-sm font-semibold text-white shadow-md">
                  {t.pricing.popular}
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
                  <p className="text-sm text-slate-500">{tier.description}</p>
                </div>
                <div className={`rounded-xl p-3 ${tier.bgColor}`}>
                  <tier.icon className={`h-6 w-6 ${tier.color}`} />
                </div>
              </div>

              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-bold text-slate-900">{tier.price}</span>
                <span className="ml-1 text-slate-500">{tier.period}</span>
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.discount && (
                <div className="mb-6 rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-700">
                  🎁 {isEnglish ? 'Bundle Offer:' : 'Ưu đãi:'} {tier.discount}
                </div>
              )}

              <Link
                href={tier.href}
                className={`
                  block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors
                  ${
                    tier.featured
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }
                `}
              >
                {t.pricing.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
