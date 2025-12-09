'use client'

import { useEffect, useState } from 'react'

import { Phone, MessageCircle, Zap } from 'lucide-react'
import Link from 'next/link'

/**
 * MobileStickyActions - Thanh hành động dính ở bottom màn hình mobile
 *
 * Features:
 * - Chỉ hiển thị sau khi scroll 300px
 * - Ẩn trên desktop (md:hidden)
 * - Touch targets >= 48px (WCAG 2.1 compliant)
 * - Safe area padding cho iPhone notch
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */
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

  // Return empty div instead of null for SSR consistency
  if (!isVisible) {
    return <div aria-hidden="true" className="hidden" />
  }

  return (
    <div
      aria-label="Liên hệ nhanh"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 pb-[env(safe-area-inset-bottom,12px)] pt-3 shadow-lg md:hidden"
      data-testid="mobile-sticky-actions"
      role="navigation"
    >
      {/* Action buttons - min touch target 48px (WCAG compliant) */}
      <div className="flex gap-2">
        {/* Phone button */}
        <Link
          aria-label="Gọi điện thoại ngay"
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-center font-semibold text-white shadow-md transition-all active:scale-95"
          href="tel:+84123456789"
        >
          <Phone className="h-5 w-5" />
          <span className="text-sm">Gọi ngay</span>
        </Link>

        {/* Discord button */}
        <Link
          aria-label="Tham gia Discord"
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-3 py-3 text-center font-semibold text-white shadow-md transition-all active:scale-95"
          href="https://discord.gg/rokservices"
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">Discord</span>
        </Link>

        {/* Consultation button */}
        <Link
          aria-label="Yêu cầu tư vấn"
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-accent-600 px-3 py-3 text-center font-semibold text-white shadow-md transition-all active:scale-95"
          href="/contact"
        >
          <Zap className="h-5 w-5" />
          <span className="text-sm">Tư vấn</span>
        </Link>
      </div>

      {/* Response time indicator */}
      <p className="mt-2 text-center text-xs text-gray-500">⚡ Phản hồi trong 5 phút</p>
    </div>
  )
}

// Mobile-optimized pricing cards
export function MobilePricingCard({
  title,
  price,
  features,
  popular = false,
  ctaText = 'Chọn gói này',
  ctaLink = '/contact'
}: {
  title: string
  price: string
  features: string[]
  popular?: boolean
  ctaText?: string
  ctaLink?: string
}) {
  return (
    <div
      className={`
      relative rounded-xl bg-white p-6 shadow-lg
      ${popular ? 'scale-105 ring-2 ring-primary-500' : ''}
    `}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
          <span className="rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
            Phổ biến nhất
          </span>
        </div>
      )}

      <div className="mb-6 text-center">
        <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
        <div className="mb-4 text-3xl font-bold text-primary-600">{price}</div>
      </div>

      <ul className="mb-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
            <span className="text-sm leading-relaxed text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        className="block w-full transform rounded-lg bg-gradient-to-r from-accent-600 to-accent-700 px-6 py-4 text-center font-bold text-white transition-all duration-200 hover:scale-105 hover:from-accent-700 hover:to-accent-800"
        href={ctaLink}
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
  avatar = '👨‍🎮'
}: {
  name: string
  kingdom: string
  result: string
  comment: string
  avatar?: string
}) {
  return (
    <div className="relative rounded-xl bg-white p-6 shadow-lg">
      {/* Result badge */}
      <div className="absolute -right-3 -top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
        {result}
      </div>

      <div className="mb-4 flex items-start space-x-4">
        <div className="text-3xl">{avatar}</div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{kingdom}</p>
        </div>
      </div>

      <blockquote className="italic leading-relaxed text-gray-600">
        &ldquo;{comment}&rdquo;
      </blockquote>

      <div className="mt-4 flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    </div>
  )
}

// Mobile-optimized FAQ
export function MobileFAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <button
        className="w-full bg-white px-6 py-4 text-left transition-colors hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <h3 className="pr-4 font-semibold text-gray-900">{question}</h3>
          <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <svg
              className="h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="bg-gray-50 px-6 pb-4">
          <p className="leading-relaxed text-gray-600">{answer}</p>
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
        const { connection } = navigator as { connection?: { effectiveType?: string } }
        setIsSlowConnection(
          connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g'
        )
      }
    }

    checkMobile()
    checkConnection()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isSlowConnection }
}
