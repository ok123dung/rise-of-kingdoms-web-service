'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Requirements() {
  const { t } = useLanguage()

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="mx-auto max-w-4xl rounded-3xl bg-slate-50 p-8 md:p-12">
          <div className="mb-8 flex items-center space-x-4">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t.requirements.title}</h2>
              <p className="text-slate-600">{t.requirements.subtitle}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">{t.requirements.k1}</h3>
              <ul className="space-y-3">
                {t.requirements.list.k1.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">{t.requirements.k2}</h3>
              <ul className="space-y-3">
                {t.requirements.list.k2.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">{t.requirements.k4}</h3>
              <ul className="space-y-3">
                {t.requirements.list.k4.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Note:</strong> {t.requirements.note}
          </div>
        </div>
      </div>
    </section>
  )
}
