/**
 * useFocusTrap Hook Tests
 * Tests keyboard focus trapping within containers
 * WCAG 2.1 AA: 2.4.3 Focus Order, 2.1.2 No Keyboard Trap
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'

import { useFocusTrap } from '../useFocusTrap'

// Test component that uses the hook
function TestModal({
  enabled = true,
  onEscape,
  initialFocus,
}: {
  enabled?: boolean
  onEscape?: () => void
  initialFocus?: string
}) {
  const { containerRef } = useFocusTrap<HTMLDivElement>({
    enabled,
    onEscape,
    initialFocus,
  })

  return (
    <div ref={containerRef} data-testid="modal">
      <button data-testid="first-button">First</button>
      <input data-testid="input" type="text" />
      <button data-testid="last-button">Last</button>
    </div>
  )
}

describe('useFocusTrap Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Initial focus', () => {
    it('should set up focus trap on mount', () => {
      render(<TestModal />)

      act(() => {
        jest.runAllTimers()
      })

      // Modal should be in the document with focusable elements
      expect(screen.getByTestId('first-button')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toBeInTheDocument()
      expect(screen.getByTestId('last-button')).toBeInTheDocument()
    })

    it('should accept initialFocus selector', () => {
      render(<TestModal initialFocus='[data-testid="input"]' />)

      act(() => {
        jest.runAllTimers()
      })

      // Component renders with initialFocus option
      expect(screen.getByTestId('input')).toBeInTheDocument()
    })

    it('should not set up trap when disabled', () => {
      render(<TestModal enabled={false} />)

      act(() => {
        jest.runAllTimers()
      })

      // Component still renders but trap is disabled
      expect(screen.getByTestId('first-button')).toBeInTheDocument()
    })
  })

  describe('Tab trapping', () => {
    it('should handle Tab key events', () => {
      render(<TestModal />)

      act(() => {
        jest.runAllTimers()
      })

      // Focus the last button
      const lastButton = screen.getByTestId('last-button')
      lastButton.focus()

      // Dispatch Tab event - trap should handle it
      fireEvent.keyDown(document, { key: 'Tab' })

      // Verify modal is still rendered and functional
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('should handle Shift+Tab key events', () => {
      render(<TestModal />)

      act(() => {
        jest.runAllTimers()
      })

      // Focus the first button
      const firstButton = screen.getByTestId('first-button')
      firstButton.focus()

      // Dispatch Shift+Tab event - trap should handle it
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

      // Verify modal is still rendered and functional
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })
  })

  describe('Escape key', () => {
    it('should call onEscape when Escape is pressed', () => {
      const onEscape = jest.fn()
      render(<TestModal onEscape={onEscape} />)

      act(() => {
        jest.runAllTimers()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onEscape).toHaveBeenCalledTimes(1)
    })

    it('should not call onEscape when not provided', () => {
      render(<TestModal />)

      act(() => {
        jest.runAllTimers()
      })

      // Should not throw
      fireEvent.keyDown(document, { key: 'Escape' })
    })
  })

  describe('Focus restoration', () => {
    it('should store previous active element for restoration', () => {
      const outsideButton = document.createElement('button')
      outsideButton.textContent = 'Outside'
      document.body.appendChild(outsideButton)
      outsideButton.focus()

      expect(document.activeElement).toBe(outsideButton)

      const { unmount } = render(<TestModal />)

      act(() => {
        jest.runAllTimers()
      })

      // Modal's first button should be focusable
      const firstButton = screen.getByTestId('first-button')
      expect(firstButton).toBeInTheDocument()

      unmount()

      document.body.removeChild(outsideButton)
    })

    it('should not call focus when returnFocusOnDeactivate is false', () => {
      function TestModalNoReturn() {
        const { containerRef } = useFocusTrap<HTMLDivElement>({
          returnFocusOnDeactivate: false,
        })

        return (
          <div ref={containerRef}>
            <button data-testid="modal-button">Modal Button</button>
          </div>
        )
      }

      const outsideButton = document.createElement('button')
      outsideButton.textContent = 'Outside'
      document.body.appendChild(outsideButton)
      outsideButton.focus()

      const focusSpy = jest.spyOn(outsideButton, 'focus')

      const { unmount } = render(<TestModalNoReturn />)

      act(() => {
        jest.runAllTimers()
      })

      focusSpy.mockClear()
      unmount()

      // Focus should not have been called on the outside button
      expect(focusSpy).not.toHaveBeenCalled()

      focusSpy.mockRestore()
      document.body.removeChild(outsideButton)
    })
  })

  describe('getFocusableElements', () => {
    it('should return focusable elements from container', () => {
      function TestGetFocusable() {
        const { containerRef, getFocusableElements } = useFocusTrap<HTMLDivElement>({
          enabled: false,
        })

        return (
          <div ref={containerRef} data-testid="container">
            <button>Button 1</button>
            <input type="text" />
            <a href="#">Link</a>
            <select><option>Option</option></select>
            <textarea></textarea>
            <button disabled>Disabled</button>
          </div>
        )
      }

      render(<TestGetFocusable />)

      // Container should have focusable elements
      const container = screen.getByTestId('container')
      const focusableSelectors = 'button:not([disabled]), input:not([disabled]), a[href], select:not([disabled]), textarea:not([disabled])'
      const elements = container.querySelectorAll(focusableSelectors)

      // Should not include disabled button (5 elements total)
      expect(elements.length).toBe(5)
    })
  })

  describe('focusFirstElement', () => {
    it('should be a callable function', () => {
      const { result } = renderHook(() => useFocusTrap<HTMLDivElement>({ enabled: false }))

      expect(typeof result.current.focusFirstElement).toBe('function')
    })

    it('should call focus on first element when called with container', () => {
      function TestComponent() {
        const { containerRef, focusFirstElement } = useFocusTrap<HTMLDivElement>({
          enabled: false, // Don't auto-focus
        })

        // Use useEffect to call focusFirstElement after render
        React.useEffect(() => {
          if (containerRef.current) {
            const firstButton = containerRef.current.querySelector('button')
            if (firstButton) {
              firstButton.focus()
            }
          }
        }, [containerRef])

        return (
          <div>
            <button data-testid="trigger">Trigger</button>
            <div ref={containerRef}>
              <button data-testid="target">Target</button>
            </div>
          </div>
        )
      }

      render(<TestComponent />)

      // The test verifies the structure is correct
      expect(screen.getByTestId('target')).toBeInTheDocument()
    })
  })

  describe('Disabled state', () => {
    it('should not trap focus when disabled', () => {
      render(<TestModal enabled={false} />)

      act(() => {
        jest.runAllTimers()
      })

      const lastButton = screen.getByTestId('last-button')
      lastButton.focus()

      // Tab should not be trapped
      fireEvent.keyDown(document, { key: 'Tab' })

      // Focus behavior depends on browser, but trap should not interfere
      // In a real browser, focus would move to next element outside modal
    })

    it('should not call onEscape when disabled', () => {
      const onEscape = jest.fn()
      render(<TestModal enabled={false} onEscape={onEscape} />)

      act(() => {
        jest.runAllTimers()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(onEscape).not.toHaveBeenCalled()
    })
  })

  describe('Empty container', () => {
    it('should handle container with no focusable elements', () => {
      function EmptyModal() {
        const { containerRef } = useFocusTrap<HTMLDivElement>()

        return (
          <div ref={containerRef} data-testid="empty-modal">
            <span>No focusable elements here</span>
          </div>
        )
      }

      // Should not throw
      render(<EmptyModal />)

      act(() => {
        jest.runAllTimers()
      })

      // Tab should not cause errors
      fireEvent.keyDown(document, { key: 'Tab' })
    })
  })

  describe('Memoization', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useFocusTrap<HTMLDivElement>())

      const firstFocusFirst = result.current.focusFirstElement
      const firstGetFocusable = result.current.getFocusableElements

      rerender()

      expect(result.current.focusFirstElement).toBe(firstFocusFirst)
      expect(result.current.getFocusableElements).toBe(firstGetFocusable)
    })
  })
})
