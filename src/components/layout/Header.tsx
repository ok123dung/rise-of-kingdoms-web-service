'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Crown, Shield, Users, BookOpen } from 'lucide-react'

const navigation = [
  { name: 'Trang chủ', href: '/', icon: Crown },
  { name: 'Dịch vụ', href: '/services', icon: Shield },
  { name: 'Hướng dẫn', href: '/guides', icon: BookOpen },
  { name: 'Liên minh', href: '/alliance', icon: Users },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="container-max flex items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <Crown className="h-8 w-8 text-primary-600" />
            <span className="font-heading font-bold text-xl text-gray-900">
              RoK Services
            </span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
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
              className="flex items-center space-x-1 text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors duration-200"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600">
            Đăng nhập
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Đăng ký
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                <Crown className="h-8 w-8 text-primary-600" />
                <span className="font-heading font-bold text-xl text-gray-900">
                  RoK Services
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Đóng menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 flex items-center space-x-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-2">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-primary-600 hover:bg-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
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
