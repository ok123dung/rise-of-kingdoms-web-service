/**
 * ErrorBoundary Component Tests
 * Tests error catching, fallback UI, and recovery
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import {
  ErrorBoundary,
  withErrorBoundary,
  FeatureErrorBoundary,
  RSCErrorBoundary
} from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div data-testid="child-content">Content rendered</div>
}

// Suppress console.error for these tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary Component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Normal rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Child Content</div>
        </ErrorBoundary>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    it('should not show error UI when no error', () => {
      render(
        <ErrorBoundary>
          <div>Normal Content</div>
        </ErrorBoundary>
      )

      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error catching', () => {
    it('should catch errors and show default error UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument()
    })

    it('should display error ID', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Error ID:/)).toBeInTheDocument()
    })

    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Error UI</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument()
    })

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(onError.mock.calls[0][0].message).toBe('Test error message')
    })
  })

  describe('Error recovery', () => {
    it('should have Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('should have Go Home button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })

    it('should reset error state when Try Again is clicked', async () => {
      let shouldThrow = true

      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div data-testid="recovered">Recovered</div>
      }

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      )

      // Error UI should be shown
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

      // Fix the error
      shouldThrow = false

      // Click retry
      fireEvent.click(screen.getByRole('button', { name: /try again/i }))

      // Should render content again
      await waitFor(() => {
        expect(screen.getByTestId('recovered')).toBeInTheDocument()
      })
    })
  })

  describe('Error details', () => {
    it('should show error details when showDetails is true', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Look for error details section
      const details = screen.getByText('Error Details')
      expect(details).toBeInTheDocument()
    })

    it('should display error message in details', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/Test error message/)).toBeInTheDocument()
    })
  })
})

describe('withErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div data-testid="wrapped">Wrapped Component</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent />)

    expect(screen.getByTestId('wrapped')).toBeInTheDocument()
  })

  it('should catch errors from wrapped component', () => {
    const FailingComponent = () => {
      throw new Error('Wrapped component error')
    }
    const WrappedComponent = withErrorBoundary(FailingComponent)

    render(<WrappedComponent />)

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
  })

  it('should set displayName correctly', () => {
    const TestComponent = () => <div>Test</div>
    TestComponent.displayName = 'TestComponent'

    const WrappedComponent = withErrorBoundary(TestComponent)

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
  })
})

describe('FeatureErrorBoundary', () => {
  it('should show feature-specific error message', () => {
    const FailingFeature = () => {
      throw new Error('Feature error')
    }

    render(
      <FeatureErrorBoundary featureName="Payment">
        <FailingFeature />
      </FeatureErrorBoundary>
    )

    expect(screen.getByText('Payment Unavailable')).toBeInTheDocument()
  })

  it('should show custom fallback message', () => {
    const FailingFeature = () => {
      throw new Error('Feature error')
    }

    render(
      <FeatureErrorBoundary featureName="Chat" fallbackMessage="Chat is currently offline">
        <FailingFeature />
      </FeatureErrorBoundary>
    )

    expect(screen.getByText('Chat is currently offline')).toBeInTheDocument()
  })

  it('should render children when no error', () => {
    render(
      <FeatureErrorBoundary featureName="Dashboard">
        <div data-testid="feature">Dashboard Feature</div>
      </FeatureErrorBoundary>
    )

    expect(screen.getByTestId('feature')).toBeInTheDocument()
  })
})

describe('RSCErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <RSCErrorBoundary>
        <div data-testid="rsc-content">RSC Content</div>
      </RSCErrorBoundary>
    )

    expect(screen.getByTestId('rsc-content')).toBeInTheDocument()
  })

  it('should show hydration-specific fallback on error', () => {
    const FailingComponent = () => {
      throw new Error('Hydration failed')
    }

    render(
      <RSCErrorBoundary>
        <FailingComponent />
      </RSCErrorBoundary>
    )

    expect(screen.getByText('Hydration Error')).toBeInTheDocument()
  })
})
