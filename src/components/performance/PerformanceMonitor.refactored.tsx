'use client'

import { useState, useCallback } from 'react'
import { WebVitalsMonitor } from './WebVitalsMonitor'
import { PageLoadMonitor } from './PageLoadMonitor'
import { ConnectionMonitor } from './ConnectionMonitor'
import { DeviceMonitor } from './DeviceMonitor'
import { ScrollDepthMonitor } from './ScrollDepthMonitor'
import { usePerformanceOptimization } from './usePerformanceOptimization'

interface PerformanceMetrics {
  webVitals: Record<string, number>
  pageLoad: Record<string, number>
  connection?: {
    effectiveType: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }
  device?: {
    isMobile: boolean
    deviceMemory?: number
    hardwareConcurrency?: number
    isSlowDevice: boolean
  }
  scrollDepth: number[]
}

export function PerformanceMonitor() {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return null

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    webVitals: {},
    pageLoad: {},
    scrollDepth: []
  })

  const handleWebVital = useCallback((metric: { name: string; value: number }) => {
    setMetrics(prev => ({
      ...prev,
      webVitals: { ...prev.webVitals, [metric.name]: metric.value }
    }))
  }, [])

  const handlePageLoadMetric = useCallback((metric: { name: string; value: number }) => {
    setMetrics(prev => ({
      ...prev,
      pageLoad: { ...prev.pageLoad, [metric.name]: metric.value }
    }))
  }, [])

  const handleConnectionChange = useCallback((info: PerformanceMetrics['connection']) => {
    setMetrics(prev => ({ ...prev, connection: info }))
  }, [])

  const handleDeviceInfo = useCallback((info: PerformanceMetrics['device']) => {
    setMetrics(prev => ({ ...prev, device: info }))
  }, [])

  const handleScrollMilestone = useCallback((depth: number) => {
    setMetrics(prev => ({
      ...prev,
      scrollDepth: [...prev.scrollDepth, depth]
    }))
  }, [])

  // Use performance optimization hook
  usePerformanceOptimization()

  return (
    <>
      <WebVitalsMonitor onMetric={handleWebVital} />
      <PageLoadMonitor onMetric={handlePageLoadMetric} />
      <ConnectionMonitor onConnectionChange={handleConnectionChange} />
      <DeviceMonitor onDeviceInfo={handleDeviceInfo} />
      <ScrollDepthMonitor onMilestone={handleScrollMilestone} />
    </>
  )
}

// Export the hook separately for use in other components
export { usePerformanceOptimization } from './usePerformanceOptimization'

// Export performance budget monitoring function
export { monitorPerformanceBudget } from './performanceBudget'