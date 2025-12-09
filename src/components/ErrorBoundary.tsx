'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'

import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

import { clientLogger } from '@/lib/client-logger'
import { logError, getLogger } from '@/lib/monitoring/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Capture error to Sentry and get event ID
    const sentryId = Sentry.captureException(error, {
      tags: {
        component: 'ErrorBoundary',
        type: 'react_error'
      }
    })

    const errorId =
      typeof sentryId === 'string' ? sentryId : Math.random().toString(36).substring(7)

    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our monitoring system
    logError(error, {
      componentStack: errorInfo.componentStack ?? undefined
    })

    // Send additional context to Sentry
    Sentry.withScope(scope => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
      })
      scope.setLevel('error')
      scope.setTag('error.boundary', true)
      Sentry.captureException(error)
    })

    // Log additional context
    getLogger().error('React Error Boundary triggered', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    })

    this.setState({
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, errorId } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="text-center">
              <h1 className="mb-2 text-xl font-semibold text-gray-900">
                Oops! Something went wrong
              </h1>
              <p className="mb-6 text-gray-600">
                We encountered an unexpected error. Our team has been notified and is working to fix
                this issue.
              </p>

              {errorId && (
                <div className="mb-6 rounded-md bg-gray-100 p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Error ID:</span> {errorId}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  onClick={this.handleRetry}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </button>

                <button
                  className="flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                  onClick={this.handleGoHome}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </button>
              </div>

              {(isDevelopment || this.props.showDetails) && error && (
                <details className="mt-6 text-left">
                  <summary className="mb-2 cursor-pointer text-sm font-medium text-gray-700">
                    <Bug className="mr-1 inline h-4 w-4" />
                    Error Details
                  </summary>
                  <div className="rounded-md border border-red-200 bg-red-50 p-3">
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-red-800">
                      {error.name}: {error.message}
                      {error.stack && '\n\n' + error.stack}
                      {errorInfo?.componentStack &&
                        '\n\nComponent Stack:' + errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponentType: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponentType {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponentType.displayName ?? WrappedComponentType.name})`

  return WithErrorBoundaryComponent
}

// Specific error boundary for RSC hydration issues
export function RSCErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Hydration Error</span>
          </div>
          <p className="text-sm text-yellow-700">
            Trang đang được tải lại để khắc phục sự cố hydration.
          </p>
          <button
            className="mt-2 text-sm text-yellow-800 underline hover:no-underline"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      }
      onError={error => {
        // Check if it's a hydration error
        if (error.message.includes('Hydration') || error.message.includes('hydration')) {
          clientLogger.warn('RSC Hydration error detected:', error)
          // Auto-reload after a short delay for hydration errors
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason as { message?: string } | undefined
    const error = new Error(reason?.message ?? 'Unhandled promise rejection')
    const errorId = Math.random().toString(36).substring(7)

    // Log the error
    getLogger().error('Unhandled promise rejection', error, {
      reason: String(event.reason),
      errorId,
      url: window.location.href
    })

    this.setState({
      hasError: true,
      error,
      errorInfo: null,
      errorId
    })

    // Prevent the default browser error handling
    event.preventDefault()
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = Math.random().toString(36).substring(7)
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack ?? undefined
    })

    getLogger().error('Async Error Boundary triggered', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'async',
      errorId: this.state.errorId
    })

    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
                <div className="mt-2">
                  <p className="text-sm text-red-700">
                    {this.state.error?.message ?? 'An unexpected error occurred'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logError(error, {
      componentStack: errorInfo?.componentStack ?? undefined
    })

    // In development, re-throw to trigger error boundary
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
  }
}

// Error boundary for specific features
export function FeatureErrorBoundary({
  children,
  featureName,
  fallbackMessage = 'This feature is temporarily unavailable'
}: Props & { featureName: string; fallbackMessage?: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{featureName} Unavailable</h3>
              <p className="mt-1 text-sm text-yellow-700">{fallbackMessage}</p>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        getLogger().error(`Feature error in ${featureName}`, error, {
          feature: featureName,
          componentStack: errorInfo.componentStack
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
