import { Crown, Shield, Users, BookOpen, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { BookNowButton } from './BookNowButton'
import { LanguageToggle } from './LanguageToggle'
import { MobileMenuButton } from './MobileMenu'
import UserMenu from './UserMenu'

// Static Vietnamese translations for LCP optimization (Server Component)
const headerContent = {
  navigation: [
    { name: 'Trang chủ', href: '/', icon: Crown },
    { name: 'Dịch vụ', href: '/services', icon: Shield },
    { name: 'Hướng dẫn', href: '/guides', icon: BookOpen },
    { name: 'Liên minh', href: '/alliance', icon: Users }
  ]
}

export default function Header() {
  return (
    <header className="nav-glassmorphism sticky top-0 z-50 transition-all duration-300">
      <nav
        aria-label="Global"
        className="container-max flex items-center justify-between p-4 lg:px-8"
      >
        {/* Logo - Server rendered */}
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

        {/* Mobile menu button - Client component */}
        <MobileMenuButton />

        {/* Desktop navigation - Server rendered with static text */}
        <div className="hidden lg:flex lg:gap-x-8">
          {headerContent.navigation.map(item => (
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

        {/* Desktop actions - Mix of server and client components */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <LanguageToggle />
          <UserMenu />
          <BookNowButton />
        </div>
      </nav>
    </header>
  )
}
