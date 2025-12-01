'use client'

import { Shield, Sword, Hammer, Heart, Zap, Gem, Map, FileText } from 'lucide-react'

import { useLanguage } from '@/contexts/LanguageContext'

export default function AutoServiceDetails() {
  const { t } = useLanguage()

  const features = [
    {
      name: t.autoService.features.army.name,
      description: t.autoService.features.army.desc,
      icon: Sword,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      name: t.autoService.features.shield.name,
      description: t.autoService.features.shield.desc,
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      name: t.autoService.features.smith.name,
      description: t.autoService.features.smith.desc,
      icon: Hammer,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      name: t.autoService.features.heal.name,
      description: t.autoService.features.heal.desc,
      icon: Heart,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      name: t.autoService.features.pilot.name,
      description: t.autoService.features.pilot.desc,
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      name: t.autoService.features.gem.name,
      description: t.autoService.features.gem.desc,
      icon: Gem,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      name: t.autoService.features.travel.name,
      description: t.autoService.features.travel.desc,
      icon: Map,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      name: t.autoService.features.report.name,
      description: t.autoService.features.report.desc,
      icon: FileText,
      color: 'text-slate-500',
      bgColor: 'bg-slate-50'
    }
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t.autoService.title} <span className="text-gradient">{t.autoService.subtitle}</span>
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">{t.autoService.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map(feature => (
            <div
              key={feature.name}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bgColor}`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{feature.name}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
