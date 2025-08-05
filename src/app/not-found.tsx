'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ArrowLeft, Search, Crown, Shield, Star, Zap } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-blue-50/30 flex items-center justify-center">
        <div className="container-max section-padding text-center">
          
          {/* Main Error Section */}
          <div className="max-w-2xl mx-auto animate-fadeInUp">
            {/* 404 Animation */}
            <div className="relative mb-8">
              <div className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text animate-bounce">
                404
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-500 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Oops! Trang không tồn tại
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Có vẻ như bạn đã đi lạc trong kingdom. Đừng lo, chúng tôi sẽ giúp bạn tìm đường về nhà! 🏰
            </p>

            {/* Countdown Timer */}
            {!isRedirecting && (
              <div className="bg-white/60 backdrop-blur rounded-xl p-6 mb-8 border border-amber-200">
                <p className="text-slate-700 mb-4">
                  Tự động chuyển về trang chủ trong:{' '}
                  <span className="font-bold text-amber-600 text-xl">{countdown}</span> giây
                </p>
                <button
                  onClick={stopCountdown}
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                >
                  Hủy tự động chuyển trang
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/"
                className="btn-primary flex items-center justify-center gap-2 text-lg py-4 px-8"
                onClick={stopCountdown}
              >
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Link>
              
              <button
                onClick={() => {
                  stopCountdown()
                  router.back()
                }}
                className="btn-secondary flex items-center justify-center gap-2 text-lg py-4 px-8"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Quay lại</span>
              </button>
            </div>
          </div>

          {/* Popular Services */}
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Có thể bạn đang tìm kiếm?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {popularServices.map((service, index) => (
                <Link
                  key={index}
                  href={service.href}
                  className="card hover-lift group text-left"
                  onClick={stopCountdown}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 group-hover:bg-amber-200 p-3 rounded-xl transition-colors">
                      <service.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Điều hướng nhanh
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="bg-white/60 backdrop-blur hover:bg-white/80 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  onClick={stopCountdown}
                >
                  <link.icon className="h-6 w-6 text-slate-600 group-hover:text-amber-600 mx-auto mb-2 transition-colors" />
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {link.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="max-w-2xl mx-auto mt-16">
            <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
              <h3 className="text-xl font-bold mb-4">
                🤔 Vẫn không tìm thấy những gì bạn cần?
              </h3>
              <p className="mb-6 opacity-90">
                Đội ngũ hỗ trợ 24/7 của chúng tôi luôn sẵn sàng giúp đỡ bạn!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                  onClick={stopCountdown}
                >
                  <Search className="h-4 w-4" />
                  <span>Liên hệ hỗ trợ</span>
                </Link>
                <a
                  href="https://discord.gg/rokservices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Chat Discord</span>
                </a>
              </div>
            </div>
          </div>

          {/* Easter Egg */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
              💡 <strong>Pro tip:</strong> Bookmark trang chủ để không bị lạc lần sau nhé! 
              <Link href="/" className="text-amber-600 hover:text-amber-700 ml-1" onClick={stopCountdown}>
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