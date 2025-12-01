'use client'

import { SessionProvider } from 'next-auth/react'

import PWAProvider from '@/components/PWAProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <PWAProvider>{children}</PWAProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
