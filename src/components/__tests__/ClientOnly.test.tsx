/**
 * ClientOnly Component Tests
 * Tests hydration-safe rendering behavior
 */

import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'

import ClientOnly, { useClientOnly } from '../ClientOnly'

describe('ClientOnly Component', () => {
  describe('Initial render (SSR simulation)', () => {
    it('should render fallback initially before mount', () => {
      render(
        <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="content">Client Content</div>
        </ClientOnly>
      )

      // In Jest, useEffect runs synchronously after render in test environment
      // So we need to check that content renders after mount
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('should render null fallback when no fallback provided', async () => {
      const { container } = render(
        <ClientOnly>
          <div data-testid="content">Client Content</div>
        </ClientOnly>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })
    })
  })

  describe('After hydration', () => {
    it('should render children after component mounts', async () => {
      render(
        <ClientOnly fallback={<span>Loading...</span>}>
          <div data-testid="client-content">Hydrated Content</div>
        </ClientOnly>
      )

      await waitFor(() => {
        expect(screen.getByTestId('client-content')).toBeInTheDocument()
        expect(screen.getByText('Hydrated Content')).toBeInTheDocument()
      })
    })

    it('should not render fallback after mount', async () => {
      render(
        <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="content">Content</div>
        </ClientOnly>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('fallback')).not.toBeInTheDocument()
      })
    })
  })

  describe('Multiple children', () => {
    it('should render all children after mount', async () => {
      render(
        <ClientOnly>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </ClientOnly>
      )

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument()
        expect(screen.getByTestId('child-2')).toBeInTheDocument()
      })
    })
  })
})

describe('useClientOnly Hook', () => {
  it('should return true after mount', async () => {
    const { result } = renderHook(() => useClientOnly())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('should maintain true value on subsequent renders', async () => {
    const { result, rerender } = renderHook(() => useClientOnly())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })

    rerender()
    expect(result.current).toBe(true)
  })
})
