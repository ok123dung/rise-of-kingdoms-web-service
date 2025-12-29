'use client'

import { useState, useEffect } from 'react'

import { Home, ArrowLeft, Search, Crown, Shield, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Popular services suggestions
  const popularServices = [
    {
      name: 'Tư vấn chiến thuật',
      href: '/services/strategy-consulting',
      icon: Shield,
      description: 'Phân tích và tối ưu chiến thuật'
    },
    {
      name: 'Quản lý liên minh',
      href: '/services/alliance-management',
      icon: Crown,
      description: 'Hỗ trợ quản lý liên minh'
    },
    {
      name: 'VIP Support 24/7',
      href: '/services/vip-support',
      icon: Star,
      description: 'Hỗ trợ ưu tiên mọi lúc'
    }
  ]

  // Quick navigation links
  const quickLinks = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Dịch vụ', href: '/services', icon: Zap },
    { name: 'Liên hệ', href: '/contact', icon: Search },
    { name: 'Về chúng tôi', href: '/about', icon: Shield }
  ]

  useEffect(() => {
    if (countdown > 0 && !isRedirecting) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !isRedirecting) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Redirect trigger
      setIsRedirecting(true)
      router.push('/')
    }
  }, [countdown, isRedirecting, router])

  const stopCountdown = () => {
    setIsRedirecting(true)
    setCountdown(0)
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
        <div className="container-max section-padding text-center">
          {/* Main Error Section */}
          <div className="animate-fadeInUp mx-auto max-w-2xl">
            {/* 404 Animation */}
            <div className="relative mb-8">
              <div className="animate-bounce bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-8xl font-bold text-transparent md:text-9xl">
                404
              </div>
              <div className="absolute -right-4 -top-4 h-12 w-12 animate-ping rounded-full bg-amber-500 opacity-75" />
              <div className="absolute -bottom-2 -left-4 h-8 w-8 animate-pulse rounded-full bg-blue-500" />
            </div>

            {/* Error Message */}
            <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Oops! Trang không tồn tại
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-slate-600">
              Có vẻ như bạn đã đi lạc trong kingdom. Đừng lo, chúng tôi sẽ giúp bạn tìm đường về
              nhà! 🏰
            </p>

            {/* Countdown Timer */}
            {!isRedirecting && (
              <div className="mb-8 rounded-xl border border-amber-200 bg-white/60 p-6 backdrop-blur">
                <p className="mb-4 text-slate-700">
                  Tự động chuyển về trang chủ trong:{' '}
                  <span className="text-xl font-bold text-amber-600">{countdown}</span> giây
                </p>
                <button
                  className="text-sm font-medium text-amber-600 hover:text-amber-700"
                  onClick={stopCountdown}
                >
                  Hủy tự động chuyển trang
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-lg"
                href="/"
                onClick={stopCountdown}
              >
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Link>

              <button
                className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 text-lg"
                onClick={() => {
                  stopCountdown()
                  router.back()
                }}
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Quay lại</span>
              </button>
            </div>
          </div>

          {/* Popular Services */}
          <div className="mx-auto mb-16 max-w-5xl">
            <h2 className="mb-8 text-2xl font-bold text-slate-900">Có thể bạn đang tìm kiếm?</h2>

            <div className="grid gap-6 md:grid-cols-3">
              {popularServices.map((service, index) => (
                <Link
                  key={index}
                  className="card hover-lift group text-left"
                  href={service.href}
                  onClick={stopCountdown}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-amber-100 p-3 transition-colors group-hover:bg-amber-200">
                      <service.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-600">{service.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Điều hướng nhanh</h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  className="group rounded-xl bg-white/60 p-4 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white/80 hover:shadow-lg"
                  href={link.href}
                  onClick={stopCountdown}
                >
                  <link.icon className="mx-auto mb-2 h-6 w-6 text-slate-600 transition-colors group-hover:text-amber-600" />
                  <div className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">
                    {link.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="card bg-linear-to-r from-blue-500 to-purple-600 text-center text-white">
              <h3 className="mb-4 text-xl font-bold">🤔 Vẫn không tìm thấy những gì bạn cần?</h3>
              <p className="mb-6 opacity-90">
                Đội ngũ hỗ trợ 24/7 của chúng tôi luôn sẵn sàng giúp đỡ bạn!
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/30"
                  href="/contact"
                  onClick={stopCountdown}
                >
                  <Search className="h-4 w-4" />
                  <span>Liên hệ hỗ trợ</span>
                </Link>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-medium text-white transition-colors hover:bg-white/30"
                  href="https://discord.gg/UPuFYCw4JG"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span>💬</span>
                  <span>Chat Discord</span>
                </a>
              </div>
            </div>
          </div>

          {/* Easter Egg */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-400">
              💡 <strong>Pro tip:</strong> Bookmark trang chủ để không bị lạc lần sau nhé!
              <Link
                className="ml-1 text-amber-600 hover:text-amber-700"
                href="/"
                onClick={stopCountdown}
              >
                rokdbot.com
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
