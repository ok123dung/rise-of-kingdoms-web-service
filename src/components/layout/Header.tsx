'use client'

import { useState } from 'react'

import { Menu, X, Crown, Shield, Users, BookOpen, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { useLanguage } from '@/contexts/LanguageContext'

import UserMenu from './UserMenu'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t, language, setLanguage } = useLanguage()

  const navigation = [
    { name: t.common.home, href: '/', icon: Crown },
    { name: t.common.services, href: '/services', icon: Shield },
    { name: t.common.guides, href: '/guides', icon: BookOpen },
    { name: t.common.alliance, href: '/alliance', icon: Users }
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  return (
    <header className="nav-glassmorphism sticky top-0 z-50 transition-all duration-300">
      <nav
        aria-label="Global"
        className="container-max flex items-center justify-between p-4 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link className="group -m-1.5 flex items-center space-x-3 p-1.5" href="/">
            <div className="relative">
              <Image
                priority
                alt="RoK Services Logo"
                className="transition-all duration-300 group-hover:scale-110"
                height={48}
                src="/logo.png"
                width={48}
              />
              <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-amber-400" />
            </div>
            <div>
              <span className="bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text font-heading text-2xl font-bold text-transparent">
                RoK Services
              </span>
              <div className="-mt-1 text-xs font-medium text-amber-600">Professional Gaming</div>
            </div>
          </Link>
        </div>

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

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map(item => (
            <Link
              key={item.name}
              className="group relative flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-semibold leading-6 text-slate-700 transition-all duration-300 hover:bg-white/50 hover:text-amber-600"
              href={item.href}
            >
              <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <span>{item.name}</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 rounded-full bg-linear-to-r from-amber-400 to-amber-600 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
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

          <UserMenu />

          <Link
            className="rounded-full bg-linear-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 hover:shadow-amber-500/30"
            href="/booking"
          >
            {t.common.bookNow}
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
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
    </header>
  )
}
