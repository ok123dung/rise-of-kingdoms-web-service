'use client'

import { useEffect, useState } from 'react'

interface RevenueMetrics {
  pricingAccuracy: boolean
  leadGenerationReady: boolean
  paymentMethodsVisible: boolean
  seoOptimized: boolean
  conversionElementsActive: boolean
  mobileOptimized: boolean
}

export function RevenueValidation() {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    pricingAccuracy: false,
    leadGenerationReady: false,
    paymentMethodsVisible: false,
    seoOptimized: false,
    conversionElementsActive: false,
    mobileOptimized: false
  })

  const [revenueProjection, setRevenueProjection] = useState({
    monthly: 0,
    annual: 0,
    customers: { basic: 0, pro: 0, premium: 0 }
  })

  useEffect(() => {
    const validateRevenue = () => {
      const newMetrics: RevenueMetrics = {
        pricingAccuracy: false,
        leadGenerationReady: false,
        paymentMethodsVisible: false,
        seoOptimized: false,
        conversionElementsActive: false,
        mobileOptimized: false
      }

      // Check pricing accuracy
      const pricingElements = document.querySelectorAll('*')
      pricingElements.forEach(el => {
        const text = el.textContent || ''
        if (text.includes('750.000') || text.includes('750,000')) {
          newMetrics.pricingAccuracy = true
        }
      })

      // Check lead generation forms
      const forms = document.querySelectorAll('form')
      const contactLinks = document.querySelectorAll('a[href="/contact"], a[href*="discord"]')
      if (forms.length > 0 && contactLinks.length > 0) {
        newMetrics.leadGenerationReady = true
      }

      // Check Vietnamese payment methods
      const paymentElements = document.querySelectorAll('*')
      paymentElements.forEach(el => {
        const text = el.textContent || ''
        if (text.includes('MoMo') || text.includes('ZaloPay') || text.includes('Banking')) {
          newMetrics.paymentMethodsVisible = true
        }
      })

      // Check SEO elements
      const title = document.title
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      if (title.includes('Rise of Kingdoms') && metaDescription.includes('dịch vụ')) {
        newMetrics.seoOptimized = true
      }

      // Check conversion elements
      const urgencyElements = document.querySelectorAll('[class*="animate-pulse"]')
      const ctaButtons = document.querySelectorAll('a[href="/contact"], button[type="submit"]')
      if (urgencyElements.length > 0 && ctaButtons.length >= 3) {
        newMetrics.conversionElementsActive = true
      }

      // Check mobile optimization
      const stickyActions = document.querySelector('[class*="fixed"][class*="bottom-0"]')
      const viewport = document.querySelector('meta[name="viewport"]')
      if (stickyActions && viewport) {
        newMetrics.mobileOptimized = true
      }

      setMetrics(newMetrics)

      // Calculate revenue projection
      const pricing = {
        basic: 750000,
        pro: 900000,
        premium: 1200000
      }

      // Conservative estimates based on Vietnamese gaming market
      const estimatedCustomers = {
        basic: 12, // Entry-level users
        pro: 6,    // Serious players
        premium: 3 // Top players
      }

      const monthlyRevenue = 
        (pricing.basic * estimatedCustomers.basic) +
        (pricing.pro * estimatedCustomers.pro) +
        (pricing.premium * estimatedCustomers.premium)

      setRevenueProjection({
        monthly: monthlyRevenue,
        annual: monthlyRevenue * 12,
        customers: estimatedCustomers
      })
    }

    // Run validation after page load
    setTimeout(validateRevenue, 2000)
  }, [])

  const allMetricsPassed = Object.values(metrics).every(metric => metric)
  const readinessScore = Object.values(metrics).filter(metric => metric).length

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-3 text-green-600">💰 Revenue Readiness</h3>
      
      <div className="space-y-2 mb-4">
        <div className={`flex items-center space-x-2 ${metrics.pricingAccuracy ? 'text-green-600' : 'text-red-600'}`}>
          <span>{metrics.pricingAccuracy ? '✅' : '❌'}</span>
          <span>VNĐ Pricing Display</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${metrics.leadGenerationReady ? 'text-green-600' : 'text-red-600'}`}>
          <span>{metrics.leadGenerationReady ? '✅' : '❌'}</span>
          <span>Lead Generation Ready</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${metrics.paymentMethodsVisible ? 'text-green-600' : 'text-red-600'}`}>
          <span>{metrics.paymentMethodsVisible ? '✅' : '❌'}</span>
          <span>VN Payment Methods</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${metrics.seoOptimized ? 'text-green-600' : 'text-red-600'}`}>
          <span>{metrics.seoOptimized ? '✅' : '❌'}</span>
          <span>SEO Optimized</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${metrics.conversionElementsActive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{metrics.conversionElementsActive ? '✅' : '❌'}</span>
          <span>Conversion Elements</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${metrics.mobileOptimized ? 'text-green-600' : 'text-red-600'}`}>
          <span>{metrics.mobileOptimized ? '✅' : '❌'}</span>
          <span>Mobile Optimized</span>
        </div>
      </div>

      <div className="border-t pt-3 mb-3">
        <div className={`font-bold ${allMetricsPassed ? 'text-green-600' : 'text-orange-600'}`}>
          Readiness: {readinessScore}/6 ({Math.round((readinessScore/6)*100)}%)
        </div>
      </div>

      <div className="border-t pt-3 text-xs">
        <div className="font-bold text-blue-600 mb-2">Revenue Projection:</div>
        <div>Monthly: {revenueProjection.monthly.toLocaleString()} VNĐ</div>
        <div>Annual: {revenueProjection.annual.toLocaleString()} VNĐ</div>
        <div className="mt-2 text-gray-600">
          <div>Basic: {revenueProjection.customers.basic} customers</div>
          <div>Pro: {revenueProjection.customers.pro} customers</div>
          <div>Premium: {revenueProjection.customers.premium} customers</div>
        </div>
      </div>

      {allMetricsPassed && (
        <div className="mt-3 p-2 bg-green-100 rounded text-green-800 font-bold text-center">
          🚀 READY FOR REVENUE!
        </div>
      )}
    </div>
  )
}

// Revenue tracking utilities
export function trackRevenueMetrics() {
  useEffect(() => {
    // Track pricing page views
    const trackPricingViews = () => {
      if (window.gtag) {
        window.gtag('event', 'pricing_page_view', {
          event_category: 'revenue',
          event_label: 'pricing_engagement',
          value: 1
        })
      }
    }

    // Track service interest
    const trackServiceInterest = (serviceType: string) => {
      if (window.gtag) {
        window.gtag('event', 'service_interest', {
          event_category: 'revenue',
          event_label: serviceType,
          value: 1
        })
      }
    }

    // Track high-value actions
    const trackHighValueActions = () => {
      const premiumButtons = document.querySelectorAll('*')
      premiumButtons.forEach(button => {
        if (button.textContent?.includes('1.200.000') || button.textContent?.includes('Premium')) {
          button.addEventListener('click', () => {
            if (window.gtag) {
              window.gtag('event', 'premium_interest', {
                event_category: 'revenue',
                event_label: 'high_value_service',
                value: 1200000
              })
            }
          })
        }
      })
    }

    trackPricingViews()
    trackHighValueActions()

    // Track time spent on pricing sections
    const pricingSection = document.querySelector('[id*="pricing"]')
    if (pricingSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (window.gtag) {
                window.gtag('event', 'pricing_section_engagement', {
                  event_category: 'revenue',
                  event_label: 'extended_viewing',
                  value: 1
                })
              }
            }, 10000) // 10 seconds viewing
          }
        })
      })
      observer.observe(pricingSection)
    }
  }, [])
}

// Lead quality scoring
export function calculateLeadQuality(formData: FormData): number {
  let score = 0
  
  // Service type scoring
  const service = formData.get('service') as string
  if (service === 'premium') score += 40
  else if (service === 'pro') score += 30
  else if (service === 'basic') score += 20
  
  // Contact method scoring
  const phone = formData.get('phone') as string
  if (phone && phone.length >= 10) score += 20
  
  // Account info scoring
  const accountInfo = formData.get('account_info') as string
  if (accountInfo && accountInfo.length > 50) score += 20
  
  // Urgency indicators
  if (accountInfo?.includes('urgent') || accountInfo?.includes('ngay')) score += 10
  
  return Math.min(score, 100)
}
