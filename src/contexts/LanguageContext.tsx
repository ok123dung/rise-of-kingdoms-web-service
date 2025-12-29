'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

import { translations, type Language } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.vi
  /** True when client hydration is complete and localStorage has been read */
  isReady: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with default 'vi' to match server render exactly
  const [language, setLanguageState] = useState<Language>('vi')
  const [isReady, setIsReady] = useState(false)

  // Hydrate from localStorage after mount to prevent mismatch
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for SSR hydration
      setLanguageState(savedLang)
    }
    // Mark as ready after hydration
     
    setIsReady(true)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  // Memoize translations lookup for performance
  const t = useMemo(() => translations[language] || translations.vi, [language])

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t,
      isReady
    }),
    [language, t, isReady]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

/**
 * Hydration-safe text component
 * Shows translation key during SSR, actual translation after hydration
 */
export function LocalizedText({
  tKey,
  fallback
}: {
  tKey: keyof typeof translations.vi.common
  fallback?: string
}) {
  const { t, isReady } = useLanguage()

  // During SSR/hydration, show fallback or invisible placeholder
  if (!isReady) {
    return <span className="invisible">{fallback ?? tKey}</span>
  }

  return <>{t.common[tKey]}</>
}
