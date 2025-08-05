'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
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
    const errorId = Math.random().toString(36).substring(7)
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our monitoring system
    logError(error, errorInfo)
    
    // Log additional context
    getLogger().error('React Error Boundary triggered', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      errorId: this.state.errorId,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Our team has been notified and is working to fix this issue.
              </p>

              {errorId && (
                <div className="bg-gray-100 rounded-md p-3 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Error ID:</span> {errorId}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              {(isDevelopment || this.props.showDetails) && error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    <Bug className="w-4 h-4 inline mr-1" />
                    Error Details
                  </summary>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-auto max-h-40">
                      {error.name}: {error.message}
                      {error.stack && '\n\n' + error.stack}
                      {errorInfo?.componentStack && '\n\nComponent Stack:' + errorInfo.componentStack}
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
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specific error boundary for RSC hydration issues
export function RSCErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Hydration Error</span>
          </div>
          <p className="text-sm text-yellow-700">
            Trang đang được tải lại để khắc phục sự cố hydration.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-yellow-800 underline hover:no-underline"
          >
            Tải lại trang
          </button>
        </div>
      }
      onError={(error) => {
        // Check if it's a hydration error
        if (error.message.includes('Hydration') || error.message.includes('hydration')) {
          console.warn('RSC Hydration error detected:', error)
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
    const error = new Error(event.reason?.message || 'Unhandled promise rejection')
    const errorId = Math.random().toString(36).substring(7)
    
    // Log the error
    getLogger().error('Unhandled promise rejection', error, {
      reason: event.reason,
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
    logError(error, errorInfo)
    
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
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <div className="mt-2">
                <p className="text-sm text-red-700">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    logError(error, errorInfo)
    
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
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {featureName} Unavailable
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {fallbackMessage}
              </p>
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