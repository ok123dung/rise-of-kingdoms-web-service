'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

import { translations, type Language } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.vi
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi')
  const [_mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  // Prevent hydration mismatch by rendering children only after mount,
  // or just accept the default 'vi' for initial server render.
  // For better UX (SEO), we render with default 'vi' on server and update on client.

  const t = translations[language] || translations.vi

  useEffect(() => {
    // Debug logging - can be removed in production
    // eslint-disable-next-line no-console
    console.log('Language changed to:', language)
    // eslint-disable-next-line no-console
    console.log('Translations object updated:', t.common.home)
  }, [language, t])

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
