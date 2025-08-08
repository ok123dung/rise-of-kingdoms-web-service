'use client'

import { useEffect } from 'react'
import { clientLogger } from '@/lib/client-logger'

// Core Web Vitals monitoring for Vietnamese users
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          
          if (lastEntry && window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'LCP',
              value: Math.round(lastEntry.startTime),
              custom_parameter_1: 'core_web_vitals'
            })
          }
        })
        
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          clientLogger.warn('LCP observer not supported')
        }

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                event_category: 'performance',
                event_label: 'FID',
                value: Math.round(entry.processingStart - entry.startTime),
                custom_parameter_1: 'core_web_vitals'
              })
            }
          })
        })

        try {
          fidObserver.observe({ entryTypes: ['first-input'] })
        } catch (e) {
          clientLogger.warn('FID observer not supported')
        }

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
        })

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          clientLogger.warn('CLS observer not supported')
        }

        // Send CLS on page unload
        window.addEventListener('beforeunload', () => {
          if (window.gtag && clsValue > 0) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: 'CLS',
              value: Math.round(clsValue * 1000),
              custom_parameter_1: 'core_web_vitals'
            })
          }
        })
      }
    }

    // Monitor page load performance
    const monitorPageLoad = () => {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          if (navigation && window.gtag) {
            // Page load time
            const loadTime = navigation.loadEventEnd - navigation.fetchStart
            window.gtag('event', 'page_load_time', {
              event_category: 'performance',
              value: Math.round(loadTime),
              custom_parameter_1: 'page_performance'
            })

            // Time to First Byte (TTFB)
            const ttfb = navigation.responseStart - navigation.fetchStart
            window.gtag('event', 'ttfb', {
              event_category: 'performance', 
              value: Math.round(ttfb),
              custom_parameter_1: 'server_performance'
            })

            // DOM Content Loaded
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
            window.gtag('event', 'dom_content_loaded', {
              event_category: 'performance',
              value: Math.round(domContentLoaded),
              custom_parameter_1: 'page_performance'
            })
          }
        }, 0)
      })
    }

    // Monitor connection quality (for Vietnamese users)
    const monitorConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        
        if (connection && window.gtag) {
          window.gtag('event', 'connection_type', {
            event_category: 'performance',
            event_label: connection.effectiveType,
            custom_parameter_1: 'connection_quality'
          })

          // Monitor slow connections (common in Vietnam)
          if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
            window.gtag('event', 'slow_connection_detected', {
              event_category: 'performance',
              event_label: connection.effectiveType,
              custom_parameter_1: 'connection_issues'
            })
          }
        }
      }
    }

    // Monitor mobile performance (90% of RoK players)
    const monitorMobilePerformance = () => {
      const isMobile = window.innerWidth < 768
      const isSlowDevice = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4

      if (window.gtag) {
        window.gtag('event', 'device_type', {
          event_category: 'performance',
          event_label: isMobile ? 'mobile' : 'desktop',
          custom_parameter_1: 'device_info'
        })

        if (isSlowDevice) {
          window.gtag('event', 'low_memory_device', {
            event_category: 'performance',
            value: (navigator as any).deviceMemory,
            custom_parameter_1: 'device_constraints'
          })
        }
      }
    }

    // Monitor Vietnamese gaming hours performance
    const monitorGamingHours = () => {
      const hour = new Date().getHours()
      const isGamingHours = hour >= 18 && hour <= 23 // 6PM - 11PM Vietnam peak gaming time
      
      if (window.gtag) {
        window.gtag('event', 'access_time', {
          event_category: 'performance',
          event_label: isGamingHours ? 'peak_gaming_hours' : 'off_peak_hours',
          value: hour,
          custom_parameter_1: 'gaming_patterns'
        })
      }
    }

    // Initialize all monitoring
    observeWebVitals()
    monitorPageLoad()
    monitorConnection()
    monitorMobilePerformance()
    monitorGamingHours()

    // Monitor scroll depth (engagement metric)
    let maxScrollDepth = 0
    const monitorScrollDepth = () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollDepth) && window.gtag) {
          window.gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: `${scrollDepth}%`,
            value: scrollDepth,
            custom_parameter_1: 'user_engagement'
          })
        }
      }
    }

    window.addEventListener('scroll', monitorScrollDepth, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', monitorScrollDepth)
    }
  }, [])

  return null // This component doesn't render anything
}

// Hook for performance-aware components
export function usePerformanceOptimization() {
  useEffect(() => {
    // Preload critical resources for Vietnamese users
    const preloadCriticalResources = () => {
      // Preload Discord invite (most common action)
      const discordLink = document.createElement('link')
      discordLink.rel = 'dns-prefetch'
      discordLink.href = 'https://discord.gg'
      document.head.appendChild(discordLink)

      // Preload Google Fonts for Vietnamese characters
      const fontLink = document.createElement('link')
      fontLink.rel = 'preconnect'
      fontLink.href = 'https://fonts.googleapis.com'
      document.head.appendChild(fontLink)

      // Preload analytics
      const analyticsLink = document.createElement('link')
      analyticsLink.rel = 'dns-prefetch'
      analyticsLink.href = 'https://www.google-analytics.com'
      document.head.appendChild(analyticsLink)
    }

    // Optimize for slow connections
    const optimizeForSlowConnections = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          // Reduce image quality for slow connections
          const images = document.querySelectorAll('img')
          images.forEach((img) => {
            if (img.src && !img.src.includes('w_auto')) {
              // Add Cloudflare image optimization parameters
              img.src = img.src.replace(/\.(jpg|jpeg|png|webp)/, '_w_400.$1')
            }
          })
        }
      }
    }

    preloadCriticalResources()
    optimizeForSlowConnections()
  }, [])
}

// Performance budget monitoring
export function monitorPerformanceBudget() {
  if (typeof window === 'undefined') return

  // Monitor bundle size
  const checkBundleSize = () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let totalSize = 0
        
        entries.forEach((entry: any) => {
          if (entry.transferSize) {
            totalSize += entry.transferSize
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
