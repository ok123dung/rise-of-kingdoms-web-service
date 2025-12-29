'use client'

import { useEffect } from 'react'

import type { FirstInputEntry, LayoutShiftEntry } from '@/types/performance'

interface WebVitalsMonitorProps {
  onMetric?: (metric: { name: string; value: number }) => void
}

export function WebVitalsMonitor({ onMetric }: WebVitalsMonitorProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    let clsValue = 0

    // Monitor Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        if (lastEntry) {
          const value = Math.round(lastEntry.startTime)
          onMetric?.({ name: 'LCP', value })

          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'LCP',
              value,
              custom_parameter_1: 'core_web_vitals'
            })
          }
        }
      })

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (_e) {
      // LCP observer not supported
    }

    // Monitor First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries() as FirstInputEntry[]
        entries.forEach(entry => {
          const value = Math.round(entry.processingStart - entry.startTime)
          onMetric?.({ name: 'FID', value })

          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'FID',
              value,
              custom_parameter_1: 'core_web_vitals'
            })
          }
        })
      })

      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (_e) {
      // FID observer not supported
    }

    // Monitor Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries() as LayoutShiftEntry[]
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
      })

      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (_e) {
      // CLS observer not supported
    }

    // Send CLS on page unload
    const handleUnload = () => {
      if (clsValue > 0) {
        const value = Math.round(clsValue * 1000)
        onMetric?.({ name: 'CLS', value })

        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'performance',
            event_label: 'CLS',
            value,
            custom_parameter_1: 'core_web_vitals'
          })
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [onMetric])

  return null
}
