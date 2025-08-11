import { clientLogger } from '@/lib/client-logger'
import type { PerformanceEntryWithTransferSize } from '@/types/performance'

// Performance budget monitoring
export function monitorPerformanceBudget() {
  if (typeof window === 'undefined') return

  // Monitor bundle size
  const checkBundleSize = () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        let totalSize = 0

        entries.forEach((entry) => {
          const perfEntry = entry as PerformanceEntryWithTransferSize
          if (perfEntry.transferSize) {
            totalSize += perfEntry.transferSize
          }
        })

        // Alert if bundle size exceeds 500KB (mobile-friendly threshold)
        if (totalSize > 500000 && window.gtag) {
          window.gtag('event', 'performance_budget_exceeded', {
            event_category: 'performance',
            value: Math.round(totalSize / 1024), // KB
            custom_parameter_1: 'bundle_size_warning'
          })
        }
      })

      try {
        observer.observe({ entryTypes: ['resource'] })
      } catch (e) {
        clientLogger.warn('Resource observer not supported')
      }
    }
  }

  checkBundleSize()
}