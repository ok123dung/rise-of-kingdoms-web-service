import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, RSCErrorBoundary } from '@/components/ErrorBoundary'

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeEach(() => {
  console.error = jest.fn()
})

afterEach(() => {
  console.error = originalError
})

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Test component for hydration errors
const HydrationError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Hydration failed because the initial UI does not match')
  }
  return <div>No hydration error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Check for error UI elements
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByText(/Thử lại|Retry/i)).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Có lỗi xảy ra')).not.toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
  })

  it('shows retry button and can retry', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error UI should be shown
    expect(screen.getByText('Oops! Có lỗi xảy ra')).toBeInTheDocument()

    // Click retry button
    const retryButton = screen.getByText('Thử lại')
    fireEvent.click(retryButton)

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('shows home button that redirects to home page', () => {
    // Mock window.location
    delete (window as any).location
    ;(window as any).location = { href: '' }

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const homeButton = screen.getByText('Về trang chủ')
    fireEvent.click(homeButton)

    expect(window.location.href).toBe('/')
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Chi tiết lỗi (Development)')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Chi tiết lỗi (Development)')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('shows support contact information', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const supportLink = screen.getByText('Liên hệ support')
    expect(supportLink).toBeInTheDocument()
    expect(supportLink).toHaveAttribute('href', 'mailto:support@rokdbot.com')
  })
})

describe('RSCErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: jest.fn() },
      writable: true
    })
  })

  it('renders children when there is no error', () => {
    render(
      <RSCErrorBoundary>
        <div>RSC content</div>
      </RSCErrorBoundary>
    )

    expect(screen.getByText('RSC content')).toBeInTheDocument()
  })

  it('shows hydration error fallback UI', () => {
    render(
      <RSCErrorBoundary>
        <HydrationError shouldThrow={true} />
      </RSCErrorBoundary>
    )

    expect(screen.getByText('Hydration Error')).toBeInTheDocument()
    expect(
      screen.getByText(/Trang đang được tải lại để khắc phục sự cố hydration/)
    ).toBeInTheDocument()
  })

  it('shows reload button for hydration errors', () => {
    render(
      <RSCErrorBoundary>
        <HydrationError shouldThrow={true} />
      </RSCErrorBoundary>
    )

    const reloadButton = screen.getByText('Tải lại trang')
    fireEvent.click(reloadButton)

    expect(window.location.reload).toHaveBeenCalled()
  })

  it('auto-reloads page after 1 second for hydration errors', async () => {
    jest.useFakeTimers()

    render(
      <RSCErrorBoundary>
        <HydrationError shouldThrow={true} />
      </RSCErrorBoundary>
    )

    // Fast-forward time by 1 second
    jest.advanceTimersByTime(1000)

    expect(window.location.reload).toHaveBeenCalled()

    jest.useRealTimers()
  })

  it('detects hydration errors correctly', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <HydrationError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Hydration')
      }),
      expect.any(Object)
    )
  })

  it('handles non-hydration errors normally', () => {
    render(
      <RSCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RSCErrorBoundary>
    )

    // Should fall back to regular error boundary behavior
    expect(screen.getByText('Oops! Có lỗi xảy ra')).toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test Component</div>
    const { withErrorBoundary } = require('@/components/ErrorBoundary')

    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent />)

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('shows error UI when wrapped component throws', () => {
    const { withErrorBoundary } = require('@/components/ErrorBoundary')
    const WrappedComponent = withErrorBoundary(ThrowError)

    render(<WrappedComponent shouldThrow={true} />)

    expect(screen.getByText('Oops! Có lỗi xảy ra')).toBeInTheDocument()
  })

  it('passes props to wrapped component', () => {
    const TestComponent = ({ text }: { text: string }) => <div>{text}</div>
    const { withErrorBoundary } = require('@/components/ErrorBoundary')

    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent text="Passed prop" />)

    expect(screen.getByText('Passed prop')).toBeInTheDocument()
  })

  it('accepts error boundary props', () => {
    const onError = jest.fn()
    const fallback = <div>HOC Custom Fallback</div>
    const { withErrorBoundary } = require('@/components/ErrorBoundary')

    const WrappedComponent = withErrorBoundary(ThrowError, { onError, fallback })

    render(<WrappedComponent shouldThrow={true} />)

    expect(screen.getByText('HOC Custom Fallback')).toBeInTheDocument()
    expect(onError).toHaveBeenCalled()
  })
})
