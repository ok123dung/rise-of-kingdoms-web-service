import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import ClientOnly, { useClientOnly } from '@/components/ClientOnly'

describe('ClientOnly', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders fallback initially', () => {
    const fallback = <div>Loading...</div>
    
    render(
      <ClientOnly fallback={fallback}>
        <div>Client content</div>
      </ClientOnly>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Client content')).not.toBeInTheDocument()
  })

  it('renders children after mounting', async () => {
    render(
      <ClientOnly fallback={<div>Loading...</div>}>
        <div>Client content</div>
      </ClientOnly>
    )

    // Initially shows fallback
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // After mounting, shows children
    await waitFor(() => {
      expect(screen.getByText('Client content')).toBeInTheDocument()
    })

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('renders null fallback by default', () => {
    const { container } = render(
      <ClientOnly>
        <div>Client content</div>
      </ClientOnly>
    )

    // Initially renders nothing
    expect(container.firstChild).toBeNull()
  })

  it('handles complex children correctly', async () => {
    const ComplexChild = () => (
      <div>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Button</button>
      </div>
    )

    render(
      <ClientOnly fallback={<div>Loading complex...</div>}>
        <ComplexChild />
      </ClientOnly>
    )

    // Initially shows fallback
    expect(screen.getByText('Loading complex...')).toBeInTheDocument()

    // After mounting, shows complex children
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Paragraph')).toBeInTheDocument()
      expect(screen.getByText('Button')).toBeInTheDocument()
    })
  })

  it('works with fragments as children', async () => {
    render(
      <ClientOnly fallback={<div>Loading fragment...</div>}>
        <>
          <div>First</div>
          <div>Second</div>
        </>
      </ClientOnly>
    )

    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  it('prevents hydration mismatches for dynamic content', async () => {
    // This would normally cause hydration mismatch
    const DynamicContent = () => (
      <div>
        {typeof window !== 'undefined' ? 'Client-side' : 'Server-side'}
      </div>
    )

    render(
      <ClientOnly>
        <DynamicContent />
      </ClientOnly>
    )

    await waitFor(() => {
      expect(screen.getByText('Client-side')).toBeInTheDocument()
    })
  })

  it('handles errors in children gracefully', async () => {
    const ErrorChild = () => {
      throw new Error('Child component error')
    }

    // Suppress error boundary console logs for this test
    const originalError = console.error
    console.error = jest.fn()

    expect(() => {
      render(
        <ClientOnly>
          <ErrorChild />
        </ClientOnly>
      )
    }).not.toThrow()

    console.error = originalError
  })
})

describe('useClientOnly hook', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useClientOnly())
    
    expect(result.current).toBe(false)
  })

  it('returns true after mounting', async () => {
    const { result } = renderHook(() => useClientOnly())
    
    // Initially false
    expect(result.current).toBe(false)
    
    // Should become true after effect runs
    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('can be used for conditional rendering', async () => {
    const TestComponent = () => {
      const hasMounted = useClientOnly()
      
      return (
        <div>
          {hasMounted ? 'Mounted on client' : 'Server rendering'}
        </div>
      )
    }

    render(<TestComponent />)
    
    // Initially shows server content
    expect(screen.getByText('Server rendering')).toBeInTheDocument()
    
    // After mounting, shows client content
    await waitFor(() => {
      expect(screen.getByText('Mounted on client')).toBeInTheDocument()
    })
  })

  it('prevents hydration issues with browser APIs', async () => {
    const TestComponent = () => {
      const hasMounted = useClientOnly()
      
      return (
        <div>
          {hasMounted && typeof window !== 'undefined' ? (
            <div>Window size: {window.innerWidth}x{window.innerHeight}</div>
          ) : (
            <div>Loading dimensions...</div>
          )}
        </div>
      )
    }

    render(<TestComponent />)
    
    // Initially shows loading
    expect(screen.getByText('Loading dimensions...')).toBeInTheDocument()
    
    // After mounting, can access window
    await waitFor(() => {
      expect(screen.getByText(/Window size:/)).toBeInTheDocument()
    })
  })

  it('works correctly with multiple hook instances', async () => {
    const TestComponent = () => {
      const hasMounted1 = useClientOnly()
      const hasMounted2 = useClientOnly()
      
      return (
        <div>
          <div>Hook 1: {hasMounted1 ? 'mounted' : 'not mounted'}</div>
          <div>Hook 2: {hasMounted2 ? 'mounted' : 'not mounted'}</div>
        </div>
      )
    }

    render(<TestComponent />)
    
    // Both should start as false
    expect(screen.getByText('Hook 1: not mounted')).toBeInTheDocument()
    expect(screen.getByText('Hook 2: not mounted')).toBeInTheDocument()
    
    // Both should become true
    await waitFor(() => {
      expect(screen.getByText('Hook 1: mounted')).toBeInTheDocument()
      expect(screen.getByText('Hook 2: mounted')).toBeInTheDocument()
    })
  })

  it('maintains state after re-renders', async () => {
    const TestComponent = ({ count }: { count: number }) => {
      const hasMounted = useClientOnly()
      
      return (
        <div>
          <div>Count: {count}</div>
          <div>Mounted: {hasMounted ? 'yes' : 'no'}</div>
        </div>
      )
    }

    const { rerender } = render(<TestComponent count={0} />)
    
    // Wait for initial mount
    await waitFor(() => {
      expect(screen.getByText('Mounted: yes')).toBeInTheDocument()
    })
    
    // Re-render with different props
    rerender(<TestComponent count={1} />)
    
    // Should still be mounted
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
    expect(screen.getByText('Mounted: yes')).toBeInTheDocument()
  })
})