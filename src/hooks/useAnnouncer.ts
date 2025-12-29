'use client'

import { useCallback, useEffect, useRef } from 'react'

/**
 * useAnnouncer Hook
 * Provides screen reader announcements using aria-live regions
 * WCAG 2.1 AA: 4.1.3 Status Messages
 */

type Politeness = 'polite' | 'assertive'

interface AnnouncerOptions {
  /** Default politeness level */
  defaultPoliteness?: Politeness
  /** Delay before clearing the announcement (ms) */
  clearDelay?: number
}

let politeRegion: HTMLElement | null = null
let assertiveRegion: HTMLElement | null = null

function getOrCreateRegion(politeness: Politeness): HTMLElement {
  const existing = politeness === 'polite' ? politeRegion : assertiveRegion

  if (existing && document.body.contains(existing)) {
    return existing
  }

  const region = document.createElement('div')
  region.setAttribute('role', 'status')
  region.setAttribute('aria-live', politeness)
  region.setAttribute('aria-atomic', 'true')
  region.className = 'sr-only'
  region.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `
  document.body.appendChild(region)

  if (politeness === 'polite') {
    politeRegion = region
  } else {
    assertiveRegion = region
  }

  return region
}

export function useAnnouncer(options: AnnouncerOptions = {}) {
  const { defaultPoliteness = 'polite', clearDelay = 1000 } = options
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = useCallback(
    (message: string, politeness: Politeness = defaultPoliteness) => {
      if (!message) return

      const region = getOrCreateRegion(politeness)

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Clear the region first to ensure the message is announced
      region.textContent = ''

      // Use requestAnimationFrame to ensure the clear is processed
      requestAnimationFrame(() => {
        region.textContent = message

        // Clear after delay to prevent stale announcements
        timeoutRef.current = setTimeout(() => {
          region.textContent = ''
        }, clearDelay)
      })
    },
    [defaultPoliteness, clearDelay]
  )

  const announcePolite = useCallback(
    (message: string) => announce(message, 'polite'),
    [announce]
  )

  const announceAssertive = useCallback(
    (message: string) => announce(message, 'assertive'),
    [announce]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    announce,
    announcePolite,
    announceAssertive,
  }
}

/**
 * Global announcer function for use outside of React components
 */
export function announceToScreenReader(
  message: string,
  politeness: Politeness = 'polite'
) {
  if (typeof window === 'undefined') return

  const region = getOrCreateRegion(politeness)
  region.textContent = ''

  requestAnimationFrame(() => {
    region.textContent = message
    setTimeout(() => {
      region.textContent = ''
    }, 1000)
  })
}
