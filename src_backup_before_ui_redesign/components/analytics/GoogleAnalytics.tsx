'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              'custom_parameter_1': 'service_type',
              'custom_parameter_2': 'user_type'
            }
          });
        `}
      </Script>
    </>
  )
}

// Analytics tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (window?.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: parameters?.label || '',
      value: parameters?.value || 0,
      ...parameters
    })
  }
}

export const trackServiceView = (serviceName: string) => {
  trackEvent('service_view', {
    event_category: 'services',
    event_label: serviceName,
    service_type: serviceName
  })
}

export const trackPricingView = (pricingTier: string) => {
  trackEvent('pricing_view', {
    event_category: 'pricing',
    event_label: pricingTier,
    pricing_tier: pricingTier
  })
}

export const trackContactForm = (formType: string) => {
  trackEvent('contact_form_submit', {
    event_category: 'conversion',
    event_label: formType,
    form_type: formType
  })
}

export const trackCTAClick = (ctaText: string, location: string) => {
  trackEvent('cta_click', {
    event_category: 'conversion',
    event_label: ctaText,
    cta_location: location
  })
}

// gtag is already declared in src/types/performance.d.ts
