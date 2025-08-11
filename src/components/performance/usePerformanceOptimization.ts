'use client'

import { useEffect } from 'react'
import type { ExtendedNavigator } from '@/types/performance'

// Hook for performance-aware components
export function usePerformanceOptimization() {
  useEffect(() => {
    if (typeof window === 'undefined') return

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
      const nav = navigator as ExtendedNavigator
      if ('connection' in nav && nav.connection) {
        const { connection } = nav

        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          // Reduce image quality for slow connections
          const images = document.querySelectorAll('img')
          images.forEach(img => {
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