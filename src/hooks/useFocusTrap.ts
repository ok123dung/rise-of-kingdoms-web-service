'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * useFocusTrap Hook
 * Traps keyboard focus within a container element
 * WCAG 2.1 AA: 2.4.3 Focus Order, 2.1.2 No Keyboard Trap
 */

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
].join(',')

interface UseFocusTrapOptions {
  /** Whether the trap is active */
  enabled?: boolean
  /** Element to return focus to when trap is deactivated */
  returnFocusOnDeactivate?: boolean
  /** Initial focus element selector or the first focusable element */
  initialFocus?: string | HTMLElement | null
  /** Callback when escape key is pressed */
  onEscape?: () => void
}

export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions = {}
) {
  const {
    enabled = true,
    returnFocusOnDeactivate = true,
    initialFocus,
    onEscape,
  } = options

  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTORS
    )
    return Array.from(elements).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    )
  }, [])

  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    if (initialFocus) {
      if (typeof initialFocus === 'string') {
        const element = containerRef.current?.querySelector<HTMLElement>(
          initialFocus
        )
        if (element) {
          element.focus()
          return
        }
      } else if (initialFocus instanceof HTMLElement) {
        initialFocus.focus()
        return
      }
    }

    focusableElements[0]?.focus()
  }, [getFocusableElements, initialFocus])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current) return

      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift+Tab on first element -> go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
        return
      }

      // Tab on last element -> go to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
        return
      }
    },
    [enabled, getFocusableElements, onEscape]
  )

  // Set up the trap
  useEffect(() => {
    if (!enabled) return

    // Store the currently focused element
    previousActiveElement.current = document.activeElement

    // Focus the first element
    const timeoutId = setTimeout(() => {
      focusFirstElement()
    }, 0)

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('keydown', handleKeyDown)

      // Return focus to the previously focused element
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        const previousElement = previousActiveElement.current as HTMLElement
        if (typeof previousElement.focus === 'function') {
          previousElement.focus()
        }
      }
    }
  }, [enabled, focusFirstElement, handleKeyDown, returnFocusOnDeactivate])

  return {
    containerRef,
    focusFirstElement,
    getFocusableElements,
  }
}
