'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  return (
    <button
      className="relative z-50 flex items-center space-x-1 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white/50"
      type="button"
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        toggleLanguage()
      }}
    >
      <span>{language === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}</span>
    </button>
  )
}
