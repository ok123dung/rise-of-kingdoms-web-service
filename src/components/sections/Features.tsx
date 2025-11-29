'use client'

import { Clock, Trophy, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Features() {
  const { t } = useLanguage()

  const features = [
    {
      id: 'time-saving',
      title: t.features.time.title,
      description: t.features.time.desc,
      statistic: '100%',
      statisticLabel: 'Tự động',
      icon: Clock,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'high-results',
      title: t.features.results.title,
      description: t.features.results.desc,
      statistic: 'Top 1',
      statisticLabel: 'Danh dự',
      icon: Trophy,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    {
      id: 'safety',
      title: t.features.safety.title,
      description: t.features.safety.desc,
      statistic: '100%',
      statisticLabel: 'Bảo mật',
      icon: ShieldCheck,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  return (
    <section className="section-padding bg-white" data-testid="features-section">
      <div className="container-max">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="animate-fadeInUp group relative rounded-3xl border border-slate-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${index * 0.1}s` }}
              data-testid="feature-item"
            >
              <div
                className={`mb-6 inline-flex rounded-2xl p-4 ${feature.iconBgColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
              </div>

              <h3 className="mb-4 text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mb-6 text-slate-600">{feature.description}</p>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{feature.statistic}</div>
                  <div className="text-sm font-medium text-slate-500">{feature.statisticLabel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
