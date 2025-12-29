'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

/**
 * AriaLiveRegion Component and Context
 * Provides accessible announcements for screen readers
 * WCAG 2.1 AA: 4.1.3 Status Messages
 */

type Politeness = 'polite' | 'assertive'

interface Announcement {
  message: string
  politeness: Politeness
  id: number
}

interface AriaLiveContextValue {
  announce: (message: string, politeness?: Politeness) => void
  announcePolite: (message: string) => void
  announceAssertive: (message: string) => void
}

const AriaLiveContext = createContext<AriaLiveContextValue | null>(null)

let announcementId = 0

interface AriaLiveProviderProps {
  children: ReactNode
}

export function AriaLiveProvider({ children }: AriaLiveProviderProps) {
  const [politeAnnouncement, setPoliteAnnouncement] = useState<Announcement | null>(null)
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState<Announcement | null>(null)

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const announcement: Announcement = {
      message,
      politeness,
      id: ++announcementId,
    }

    if (politeness === 'assertive') {
      setAssertiveAnnouncement(announcement)
      // Clear after announcement is processed
      setTimeout(() => setAssertiveAnnouncement(null), 1000)
    } else {
      setPoliteAnnouncement(announcement)
      setTimeout(() => setPoliteAnnouncement(null), 1000)
    }
  }, [])

  const announcePolite = useCallback(
    (message: string) => announce(message, 'polite'),
    [announce]
  )

  const announceAssertive = useCallback(
    (message: string) => announce(message, 'assertive'),
    [announce]
  )

  return (
    <AriaLiveContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}
      {/* Polite announcements */}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        role="status"
      >
        {politeAnnouncement?.message}
      </div>
      {/* Assertive announcements for urgent updates */}
      <div
        aria-atomic="true"
        aria-live="assertive"
        className="sr-only"
        role="alert"
      >
        {assertiveAnnouncement?.message}
      </div>
    </AriaLiveContext.Provider>
  )
}

export function useAriaLive() {
  const context = useContext(AriaLiveContext)
  if (!context) {
    throw new Error('useAriaLive must be used within an AriaLiveProvider')
  }
  return context
}

/**
 * Standalone AriaLiveRegion component for local announcements
 */
interface AriaLiveRegionProps {
  message: string
  politeness?: Politeness
  role?: 'status' | 'alert' | 'log'
  atomic?: boolean
  className?: string
}

export function AriaLiveRegion({
  message,
  politeness = 'polite',
  role = 'status',
  atomic = true,
  className = 'sr-only',
}: AriaLiveRegionProps) {
  return (
    <div
      aria-atomic={atomic}
      aria-live={politeness}
      className={className}
      role={role}
    >
      {message}
    </div>
  )
}
