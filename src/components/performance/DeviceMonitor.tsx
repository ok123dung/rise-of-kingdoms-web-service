'use client'

import { useEffect } from 'react'

import type { ExtendedNavigator } from '@/types/performance'

interface DeviceMonitorProps {
  onDeviceInfo?: (info: {
    isMobile: boolean
    deviceMemory?: number
    hardwareConcurrency?: number
    isSlowDevice: boolean
  }) => void
}

export function DeviceMonitor({ onDeviceInfo }: DeviceMonitorProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = window.innerWidth < 768
    const nav = navigator as ExtendedNavigator
    const { deviceMemory } = nav
    const { hardwareConcurrency } = navigator
    const isSlowDevice = 'deviceMemory' in nav && deviceMemory !== undefined && deviceMemory < 4

    const deviceInfo = {
      isMobile,
      deviceMemory,
      hardwareConcurrency,
      isSlowDevice
    }

    onDeviceInfo?.(deviceInfo)

    if (window.gtag) {
      // Track device type
      window.gtag('event', 'device_type', {
        event_category: 'performance',
        event_label: isMobile ? 'mobile' : 'desktop',
        custom_parameter_1: 'device_info'
      })

      // Track low memory devices
      if (isSlowDevice) {
        window.gtag('event', 'low_memory_device', {
          event_category: 'performance',
          value: deviceMemory,
          custom_parameter_1: 'device_constraints'
        })
      }
    }

    // Monitor Vietnamese gaming hours performance
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
  }, [onDeviceInfo])

  return null
}
