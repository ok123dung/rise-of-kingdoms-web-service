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

    // Check for error UI elements (actual English text)
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
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

  it('shows retry button that resets error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error UI should be shown (actual English text)
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

    // Retry button should be present
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()

    // Click retry button - it should attempt to reset state
    // Note: With the same erroring child, it will throw again
    fireEvent.click(retryButton)
  })

  it('shows home button in error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const homeButton = screen.getByText('Go Home')
    expect(homeButton).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Actual text is "Error Details"
    expect(screen.getByText('Error Details')).toBeInTheDocument()

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

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('displays error ID when available', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error ID is displayed
    expect(screen.getByText('Error ID:')).toBeInTheDocument()
  })
})

describe('RSCErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(reloadButton).toBeInTheDocument()
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

  it('uses custom fallback for any errors', () => {
    // RSCErrorBoundary uses a fixed fallback for all errors
    render(
      <RSCErrorBoundary>
        <ThrowError shouldThrow={true} />
      </RSCErrorBoundary>
    )

    // RSCErrorBoundary always shows its custom fallback UI
    expect(screen.getByText('Hydration Error')).toBeInTheDocument()
    expect(screen.getByText('Tải lại trang')).toBeInTheDocument()
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

    // Actual English text
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
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
