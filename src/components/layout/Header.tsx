'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Crown, Shield, Users, BookOpen, Sparkles } from 'lucide-react'

const navigation = [
  { name: 'Trang chủ', href: '/', icon: Crown },
  { name: 'Dịch vụ', href: '/services', icon: Shield },
  { name: 'Hướng dẫn', href: '/guides', icon: BookOpen },
  { name: 'Liên minh', href: '/alliance', icon: Users },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="nav-glassmorphism sticky top-0 z-50 transition-all duration-300">
      <nav className="container-max flex items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-3 group">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="RoK Services Logo" 
                width={48} 
                height={48} 
                className="group-hover:scale-110 transition-all duration-300"
                priority
              />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="font-heading font-bold text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                RoK Services
              </span>
              <div className="text-xs text-amber-600 font-medium -mt-1">Professional Gaming</div>
            </div>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 hover:bg-white/50 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Mở menu chính</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center space-x-2 text-sm font-semibold leading-6 text-slate-700 hover:text-amber-600 transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/50 relative"
            >
              <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span>{item.name}</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></div>
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link 
            href="/auth/signin" 
            className="text-sm font-semibold leading-6 text-slate-700 hover:text-amber-600 transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-white/50"
          >
            Đăng nhập
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm px-6">
            <span className="flex items-center space-x-2">
              <span>Đăng ký</span>
              <Sparkles className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto glassmorphism px-6 py-6 sm:max-w-sm border-l border-white/20">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-3">
                <Image 
                  src="/logo.png" 
                  alt="RoK Services Logo" 
                  width={40} 
                  height={40}
                  priority
                />
                <span className="font-heading font-bold text-xl text-slate-800">
                  RoK Services
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-xl p-2.5 text-slate-700 hover:bg-white/20 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Đóng menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-8 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-3 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 flex items-center space-x-4 rounded-2xl px-4 py-3 text-base font-semibold leading-7 text-slate-800 hover:bg-white/20 transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-6 w-6 text-amber-600" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  <Link
                    href="/auth/signin"
                    className="-mx-3 block rounded-2xl px-4 py-3 text-base font-semibold leading-7 text-slate-800 hover:bg-white/20 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="-mx-3 block rounded-2xl px-4 py-3 text-base font-semibold leading-7 text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký ngay
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
