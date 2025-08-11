'use client'

import { useEffect } from 'react'

interface PageLoadMonitorProps {
  onMetric?: (metric: { name: string; value: number }) => void
}

export function PageLoadMonitor({ onMetric }: PageLoadMonitorProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleLoad = () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming

        if (navigation) {
          // Page load time
          const loadTime = navigation.loadEventEnd - navigation.fetchStart
          onMetric?.({ name: 'pageLoadTime', value: Math.round(loadTime) })
          
          if (window.gtag) {
            window.gtag('event', 'page_load_time', {
              event_category: 'performance',
              value: Math.round(loadTime),
              custom_parameter_1: 'page_performance'
            })
          }

          // Time to First Byte (TTFB)
          const ttfb = navigation.responseStart - navigation.fetchStart
          onMetric?.({ name: 'TTFB', value: Math.round(ttfb) })
          
          if (window.gtag) {
            window.gtag('event', 'ttfb', {
              event_category: 'performance',
              value: Math.round(ttfb),
              custom_parameter_1: 'server_performance'
            })
          }

          // DOM Content Loaded
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
          onMetric?.({ name: 'domContentLoaded', value: Math.round(domContentLoaded) })
          
          if (window.gtag) {
            window.gtag('event', 'dom_content_loaded', {
              event_category: 'performance',
              value: Math.round(domContentLoaded),
              custom_parameter_1: 'page_performance'
            })
          }
        }
      }, 0)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [onMetric])

  return null
}