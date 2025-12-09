// Performance-related type definitions

// Network Information API types
interface NetworkInformation extends EventTarget {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
  downlinkMax?: number
}

// Extended Navigator interface
interface ExtendedNavigator extends Navigator {
  connection?: NetworkInformation
  deviceMemory?: number
}

// Performance Entry types
interface PerformanceEntryWithTransferSize extends PerformanceEntry {
  transferSize?: number
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: DOMHighResTimeStamp
  startTime: DOMHighResTimeStamp
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

// Global window extension
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventNameOrDate: string | Date,
      parameters?: {
        event_category?: string
        event_label?: string
        value?: number
        custom_parameter_1?: string
        [key: string]: unknown
      }
    ) => void
  }
}

export type {
  NetworkInformation,
  ExtendedNavigator,
  PerformanceEntryWithTransferSize,
  FirstInputEntry,
  LayoutShiftEntry
}
