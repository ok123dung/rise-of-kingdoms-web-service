'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export function BookNowButton() {
  const { t } = useLanguage()

  return (
    <Link
      className="rounded-full bg-linear-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-amber-500/30"
      href="/booking"
    >
      {t.common.bookNow}
    </Link>
  )
}
