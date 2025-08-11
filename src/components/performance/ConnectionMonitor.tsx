'use client'

import { useEffect } from 'react'
import type { ExtendedNavigator } from '@/types/performance'

interface ConnectionMonitorProps {
  onConnectionChange?: (info: {
    effectiveType: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }) => void
}

export function ConnectionMonitor({ onConnectionChange }: ConnectionMonitorProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const nav = navigator as ExtendedNavigator
    if (!('connection' in nav) || !nav.connection) return

    const { connection } = nav

    // Initial connection info
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

    onConnectionChange?.({
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    })

    // Listen for connection changes
    const handleConnectionChange = () => {
      onConnectionChange?.({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      })
    }

    connection.addEventListener('change', handleConnectionChange)

    return () => {
      connection.removeEventListener('change', handleConnectionChange)
    }
  }, [onConnectionChange])

  return null
}