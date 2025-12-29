'use client'

import { useState } from 'react'
import { Menu, X, Crown, Shield, Users, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useLanguage } from '@/contexts/LanguageContext'

// Static navigation for server render, dynamic text comes from useLanguage
const navIcons = {
  home: Crown,
  services: Shield,
  guides: BookOpen,
  alliance: Users
}

export function MobileMenuButton() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t, language, setLanguage } = useLanguage()

  const navigation = [
    { name: t.common.home, href: '/', icon: navIcons.home },
    { name: t.common.services, href: '/services', icon: navIcons.services },
    { name: t.common.guides, href: '/guides', icon: navIcons.guides },
    { name: t.common.alliance, href: '/alliance', icon: navIcons.alliance }
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  return (
    <>
      {/* Mobile menu button - visible only on mobile */}
      <div className="flex lg:hidden">
        <button
          className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 transition-colors duration-200 hover:bg-white/50"
          type="button"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Mở menu chính</span>
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <button
            className="fixed inset-0 z-50 h-full w-full cursor-default bg-black/20 backdrop-blur-sm"
            type="button"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="glassmorphism fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-white/20 px-6 py-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Link className="-m-1.5 flex items-center space-x-3 p-1.5" href="/">
                <Image priority alt="RoK Services Logo" height={40} src="/logo.png" width={40} />
                <span className="font-heading text-xl font-bold text-slate-800">RoK Services</span>
              </Link>
              <button
                className="-m-2.5 rounded-xl p-2.5 text-slate-700 transition-colors duration-200 hover:bg-white/20"
                type="button"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Đóng menu</span>
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-3 py-6">
                  {navigation.map(item => (
                    <Link
                      key={item.name}
                      className="-mx-3 flex items-center space-x-4 rounded-2xl px-4 py-3 text-base font-semibold leading-7 text-slate-800 transition-all duration-300 hover:bg-white/20"
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-6 w-6 text-amber-600" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    className="-mx-3 flex w-full items-center space-x-4 rounded-2xl px-4 py-3 text-base font-semibold leading-7 text-slate-800 transition-all duration-300 hover:bg-white/20"
                    onClick={() => {
                      toggleLanguage()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <span className="text-xl">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
                    <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                  </button>
                </div>
                <div className="space-y-3 py-6">
                  <Link
                    className="-mx-3 block rounded-2xl px-4 py-3 text-base font-semibold leading-7 text-slate-800 transition-all duration-300 hover:bg-white/20"
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.common.login}
                  </Link>
                  <Link
                    className="-mx-3 block rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 px-4 py-3 text-center text-base font-semibold leading-7 text-white transition-all duration-300 hover:from-amber-600 hover:to-amber-700"
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.common.bookNow}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
