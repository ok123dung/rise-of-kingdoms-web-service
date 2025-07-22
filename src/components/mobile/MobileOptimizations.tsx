'use client'

import { useEffect, useState } from 'react'
import { Phone, MessageCircle, Zap } from 'lucide-react'
import Link from 'next/link'

// Mobile-first sticky action bar
export function MobileStickyActions() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-50 md:hidden">
      <div className="flex space-x-2">
        <Link 
          href="tel:+84123456789"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center flex items-center justify-center space-x-2 transition-colors"
        >
          <Phone className="h-4 w-4" />
          <span>Gọi ngay</span>
        </Link>
        <Link 
          href="https://discord.gg/rokservices"
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg text-center flex items-center justify-center space-x-2 transition-colors"
          target="_blank"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Discord</span>
        </Link>
        <Link 
          href="/contact"
          className="flex-1 bg-accent-600 hover:bg-accent-700 text-white font-semibold py-3 px-4 rounded-lg text-center flex items-center justify-center space-x-2 transition-colors"
        >
          <Zap className="h-4 w-4" />
          <span>Tư vấn</span>
        </Link>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">⚡ Phản hồi trong 5 phút</p>
    </div>
  )
}

// Mobile-optimized pricing cards
export function MobilePricingCard({ 
  title, 
  price, 
  features, 
  popular = false,
  ctaText = "Chọn gói này",
  ctaLink = "/contact"
}: {
  title: string
  price: string
  features: string[]
  popular?: boolean
  ctaText?: string
  ctaLink?: string
}) {
  return (
    <div className={`
      bg-white rounded-xl shadow-lg p-6 relative
      ${popular ? 'ring-2 ring-primary-500 scale-105' : ''}
    `}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Phổ biến nhất
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-3xl font-bold text-primary-600 mb-4">{price}</div>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-bold py-4 px-6 rounded-lg text-center block transition-all duration-200 transform hover:scale-105"
      >
        {ctaText}
      </Link>
    </div>
  )
}

// Mobile-optimized testimonial
export function MobileTestimonial({
  name,
  kingdom,
  result,
  comment,
  avatar = "👨‍🎮"
}: {
  name: string
  kingdom: string
  result: string
  comment: string
  avatar?: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative">
      {/* Result badge */}
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
        {result}
      </div>

      <div className="flex items-start space-x-4 mb-4">
        <div className="text-3xl">{avatar}</div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{kingdom}</p>
        </div>
      </div>

      <blockquote className="text-gray-600 italic leading-relaxed">
        "{comment}"
      </blockquote>

      <div className="flex text-yellow-400 mt-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        ))}
      </div>
    </div>
  )
}

// Mobile-optimized FAQ
export function MobileFAQ({
  question,
  answer
}: {
  question: string
  answer: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 pr-4">{question}</h3>
          <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-4 bg-gray-50">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

// Mobile speed optimization hook
export function useMobileOptimization() {
  const [isMobile, setIsMobile] = useState(false)
  const [isSlowConnection, setIsSlowConnection] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Detect slow connection
    const checkConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setIsSlowConnection(connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')
      }
    }

    checkMobile()
    checkConnection()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isSlowConnection }
}
