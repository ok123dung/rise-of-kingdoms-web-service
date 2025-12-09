'use client'

import { useEffect, useState } from 'react'

import { trackCTAClick, trackContactForm } from '@/components/analytics/GoogleAnalytics'
import { clientLogger } from '@/lib/client-logger'

// Test all conversion elements
export function ConversionTesting() {
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const runTests = () => {
      const results: string[] = []

      // Test 1: Urgency elements
      const urgencyElements = document.querySelectorAll('[class*="animate-pulse"]')
      if (urgencyElements.length > 0) {
        results.push('✅ Urgency elements found: ' + urgencyElements.length)
      } else {
        results.push('❌ No urgency elements found')
      }

      // Test 2: CTA buttons
      const ctaButtons = document.querySelectorAll(
        'a[href="/contact"], a[href*="discord"], button[type="submit"]'
      )
      if (ctaButtons.length >= 5) {
        results.push('✅ Multiple CTAs found: ' + ctaButtons.length)
      } else {
        results.push('⚠️ Limited CTAs found: ' + ctaButtons.length)
      }

      // Test 3: Social proof elements
      const testimonials = document.querySelectorAll(
        '[class*="testimonial"], [class*="case-study"]'
      )
      const statsElements = document.querySelectorAll(
        '[class*="font-bold"][class*="text-"][class*="-600"]'
      )
      if (testimonials.length > 0 || statsElements.length > 0) {
        results.push('✅ Social proof elements found')
      } else {
        results.push('❌ No social proof elements found')
      }

      // Test 4: Risk reduction elements
      const guaranteeElements = document.querySelectorAll('*')
      let hasGuarantee = false
      guaranteeElements.forEach(el => {
        if (el.textContent?.includes('hoàn tiền') || el.textContent?.includes('đảm bảo')) {
          hasGuarantee = true
        }
      })
      if (hasGuarantee) {
        results.push('✅ Risk reduction elements found')
      } else {
        results.push('❌ No risk reduction elements found')
      }

      // Test 5: Pricing display
      const pricingElements = document.querySelectorAll('*')
      let hasPricing = false
      pricingElements.forEach(el => {
        if (
          el.textContent?.includes('750.000') ||
          el.textContent?.includes('900.000') ||
          el.textContent?.includes('1.200.000')
        ) {
          hasPricing = true
        }
      })
      if (hasPricing) {
        results.push('✅ VNĐ pricing found')
      } else {
        results.push('❌ VNĐ pricing not found')
      }

      // Test 6: Mobile sticky actions
      const stickyActions = document.querySelector('[class*="fixed"][class*="bottom-0"]')
      if (stickyActions) {
        results.push('✅ Mobile sticky actions found')
      } else {
        results.push('❌ Mobile sticky actions not found')
      }

      // Test 7: Vietnamese payment methods
      const paymentElements = document.querySelectorAll('*')
      let hasVietnamesePayments = false
      paymentElements.forEach(el => {
        if (
          el.textContent?.includes('MoMo') ||
          el.textContent?.includes('ZaloPay') ||
          el.textContent?.includes('VNPay')
        ) {
          hasVietnamesePayments = true
        }
      })
      if (hasVietnamesePayments) {
        results.push('✅ Vietnamese payment methods found')
      } else {
        results.push('❌ Vietnamese payment methods not found')
      }

      setTestResults(results)
    }

    // Run tests after page load
    setTimeout(runTests, 1000)
  }, [])

  // Only show in development (not in tests)
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return null
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 max-w-xs rounded-lg bg-black bg-opacity-90 p-4 text-xs text-white">
      <div aria-level={3} className="mb-2 font-bold" role="heading">
        🧪 Conversion Tests
      </div>
      <div className="space-y-1">
        {testResults.map((result, index) => (
          <div key={index} className="text-xs">
            {result}
          </div>
        ))}
      </div>
    </div>
  )
}

// CTA click tracking hook
export function useTrackCTAClicks() {
  useEffect(() => {
    const handleCTAClick = (event: Event) => {
      const target = event.target as HTMLElement
      const ctaText = target.textContent ?? ''
      const href = target.getAttribute('href') ?? ''

      // Track different types of CTAs
      if (ctaText.includes('tư vấn') || ctaText.includes('liên hệ')) {
        trackCTAClick(ctaText, 'consultation_cta')
      } else if (href.includes('discord')) {
        trackCTAClick(ctaText, 'discord_cta')
      } else if (ctaText.includes('gọi') || href.includes('tel:')) {
        trackCTAClick(ctaText, 'phone_cta')
      }
    }

    // Add click tracking to all CTAs
    const ctaElements = document.querySelectorAll(
      'a[href="/contact"], a[href*="discord"], a[href*="tel:"], button[type="submit"]'
    )
    ctaElements.forEach(element => {
      element.addEventListener('click', handleCTAClick)
    })

    return () => {
      ctaElements.forEach(element => {
        element.removeEventListener('click', handleCTAClick)
      })
    }
  }, [])
}

// Form submission tracking hook
export function useTrackFormSubmissions() {
  useEffect(() => {
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement
      const formData = new FormData(form)
      const serviceType = (formData.get('service') as string) || 'unknown'

      trackContactForm(serviceType)

      // Prevent actual submission in demo
      event.preventDefault()

      // Show success message
      // eslint-disable-next-line no-alert
      alert('🎉 Form submitted successfully! In production, this would send to our team.')
    }

    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      form.addEventListener('submit', handleFormSubmit)
    })

    return () => {
      forms.forEach(form => {
        form.removeEventListener('submit', handleFormSubmit)
      })
    }
  }, [])
}

// Conversion rate optimization hooks
export function useConversionOptimization() {
  useTrackCTAClicks()
  useTrackFormSubmissions()

  useEffect(() => {
    // Add urgency to CTAs after page load
    setTimeout(() => {
      const ctaButtons = document.querySelectorAll('a[href="/contact"], button[type="submit"]')
      ctaButtons.forEach(button => {
        if (!button.textContent?.includes('⚡')) {
          button.textContent = '⚡ ' + (button.textContent || '')
        }
      })
    }, 2000)

    // Add scarcity indicators
    setTimeout(() => {
      const pricingCards = document.querySelectorAll('[class*="card"]')
      pricingCards.forEach((card, index) => {
        if (index === 1) {
          // Pro package
          const badge = document.createElement('div')
          badge.className =
            'absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse'
          badge.textContent = 'Chỉ còn 3 slot'
          const htmlCard = card as HTMLElement
          htmlCard.style.position = 'relative'
          card.appendChild(badge)
        }
      })
    }, 3000)
  }, [])
}

// Revenue tracking hook
export function useTrackRevenuePotential() {
  useEffect(() => {
    const calculateRevenue = () => {
      const pricing = {
        basic: 750000,
        pro: 900000,
        premium: 1200000
      }

      const estimatedCustomers = {
        basic: 15, // Conservative estimate
        pro: 8,
        premium: 4
      }

      const monthlyRevenue =
        pricing.basic * estimatedCustomers.basic +
        pricing.pro * estimatedCustomers.pro +
        pricing.premium * estimatedCustomers.premium

      clientLogger.info('💰 Revenue Potential Analysis:')
      clientLogger.info(
        `Basic (${estimatedCustomers.basic} customers): ${(pricing.basic * estimatedCustomers.basic).toLocaleString()} VNĐ`
      )
      clientLogger.info(
        `Pro (${estimatedCustomers.pro} customers): ${(pricing.pro * estimatedCustomers.pro).toLocaleString()} VNĐ`
      )
      clientLogger.info(
        `Premium (${estimatedCustomers.premium} customers): ${(pricing.premium * estimatedCustomers.premium).toLocaleString()} VNĐ`
      )
      clientLogger.info(`Total Monthly Revenue: ${monthlyRevenue.toLocaleString()} VNĐ`)
      clientLogger.info(`Annual Revenue Potential: ${(monthlyRevenue * 12).toLocaleString()} VNĐ`)
    }

    calculateRevenue()
  }, [])
}
