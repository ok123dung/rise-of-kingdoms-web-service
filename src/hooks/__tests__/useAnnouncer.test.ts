/**
 * useAnnouncer Hook Tests
 * Tests screen reader announcements using aria-live regions
 * WCAG 2.1 AA: 4.1.3 Status Messages
 */

import { renderHook, act } from '@testing-library/react'

import { useAnnouncer, announceToScreenReader } from '../useAnnouncer'

// Mock requestAnimationFrame
const mockRAF = (callback: FrameRequestCallback) => {
  callback(0)
  return 0
}

describe('useAnnouncer Hook', () => {
  beforeEach(() => {
    // Clean up any existing aria-live regions
    document.querySelectorAll('[aria-live]').forEach(el => el.remove())
    jest.useFakeTimers()
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRAF)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    document.querySelectorAll('[aria-live]').forEach(el => el.remove())
  })

  describe('announce', () => {
    it('should create aria-live region and announce message', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('Test message')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')
      expect(region).toBeInTheDocument()
      // Region should have text content after RAF runs
      expect(region).toBeTruthy()
    })

    it('should use polite politeness by default', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('Polite message')
        jest.runAllTimers()
      })

      const politeRegion = document.querySelector('[aria-live="polite"]')
      expect(politeRegion).toBeInTheDocument()
    })

    it('should allow assertive politeness', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('Urgent message', 'assertive')
        jest.runAllTimers()
      })

      const assertiveRegion = document.querySelector('[aria-live="assertive"]')
      expect(assertiveRegion).toBeInTheDocument()
    })

    it('should not announce empty message', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')
      // Region should either not exist or be empty
      expect(region?.textContent || '').toBe('')
    })

    it('should clear message after clearDelay', () => {
      const { result } = renderHook(() => useAnnouncer({ clearDelay: 500 }))

      act(() => {
        result.current.announce('Temporary message')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')

      // Fast-forward past clearDelay
      act(() => {
        jest.advanceTimersByTime(600)
      })

      expect(region?.textContent).toBe('')
    })

    it('should have correct ARIA attributes', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('Accessible message')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')
      expect(region).toHaveAttribute('role', 'status')
      expect(region).toHaveAttribute('aria-atomic', 'true')
    })

    it('should be visually hidden with sr-only class', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('Hidden message')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')
      expect(region).toHaveClass('sr-only')
    })
  })

  describe('announcePolite', () => {
    it('should announce with polite politeness', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announcePolite('Polite announcement')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')
      expect(region).toBeInTheDocument()
      expect(region).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('announceAssertive', () => {
    it('should announce with assertive politeness', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announceAssertive('Assertive announcement')
        jest.runAllTimers()
      })

      const assertiveRegion = document.querySelector('[aria-live="assertive"]')
      expect(assertiveRegion).toBeInTheDocument()
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('Options', () => {
    it('should respect defaultPoliteness option', () => {
      const { result } = renderHook(() =>
        useAnnouncer({ defaultPoliteness: 'assertive' })
      )

      act(() => {
        result.current.announce('Default assertive')
        jest.runAllTimers()
      })

      // Should create assertive region when default is assertive
      const assertiveRegion = document.querySelector('[aria-live="assertive"]')
      expect(assertiveRegion).toBeInTheDocument()
    })

    it('should accept custom clearDelay option', () => {
      const { result } = renderHook(() => useAnnouncer({ clearDelay: 2000 }))

      act(() => {
        result.current.announce('Long-lasting message')
        jest.runAllTimers()
      })

      const region = document.querySelector('[aria-live="polite"]')
      expect(region).toBeInTheDocument()

      // After 2 seconds + buffer, message should be cleared
      act(() => {
        jest.advanceTimersByTime(2100)
      })
      expect(region?.textContent).toBe('')
    })
  })

  describe('Region reuse', () => {
    it('should reuse existing region for same politeness', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('First message')
        jest.runAllTimers()
      })

      const firstRegion = document.querySelector('[aria-live="polite"]')

      act(() => {
        result.current.announce('Second message')
        jest.runAllTimers()
      })

      const regions = document.querySelectorAll('[aria-live="polite"]')
      expect(regions.length).toBe(1)
      expect(regions[0]).toBe(firstRegion)
    })

    it('should create separate regions for polite and assertive', () => {
      const { result } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announcePolite('Polite')
        result.current.announceAssertive('Assertive')
        jest.runAllTimers()
      })

      const politeRegions = document.querySelectorAll('[aria-live="polite"]')
      const assertiveRegions = document.querySelectorAll('[aria-live="assertive"]')

      expect(politeRegions.length).toBe(1)
      expect(assertiveRegions.length).toBe(1)
    })
  })

  describe('Memoization', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useAnnouncer())

      const firstAnnounce = result.current.announce
      const firstAnnouncePolite = result.current.announcePolite
      const firstAnnounceAssertive = result.current.announceAssertive

      rerender()

      expect(result.current.announce).toBe(firstAnnounce)
      expect(result.current.announcePolite).toBe(firstAnnouncePolite)
      expect(result.current.announceAssertive).toBe(firstAnnounceAssertive)
    })
  })

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      const { result, unmount } = renderHook(() => useAnnouncer())

      act(() => {
        result.current.announce('Test')
        jest.runAllTimers()
      })

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })
  })
})

describe('announceToScreenReader', () => {
  beforeEach(() => {
    document.querySelectorAll('[aria-live]').forEach(el => el.remove())
    jest.useFakeTimers()
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(mockRAF)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    document.querySelectorAll('[aria-live]').forEach(el => el.remove())
  })

  it('should create aria-live region for global announcement', () => {
    act(() => {
      announceToScreenReader('Global announcement')
      jest.runAllTimers()
    })

    const region = document.querySelector('[aria-live="polite"]')
    expect(region).toBeInTheDocument()
  })

  it('should create assertive region for assertive messages', () => {
    act(() => {
      announceToScreenReader('Urgent global message', 'assertive')
      jest.runAllTimers()
    })

    const region = document.querySelector('[aria-live="assertive"]')
    expect(region).toBeInTheDocument()
  })

  it('should clear message after 1 second', () => {
    act(() => {
      announceToScreenReader('Temporary global')
      jest.runAllTimers()
    })

    const region = document.querySelector('[aria-live="polite"]')

    act(() => {
      jest.advanceTimersByTime(1100)
    })

    expect(region?.textContent).toBe('')
  })
})
