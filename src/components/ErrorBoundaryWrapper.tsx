'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showDetails?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryWrapperProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Component wrapper for declarative use
export function ErrorBoundaryWrapper({
  children,
  fallback,
  showDetails,
  onError
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      showDetails={showDetails}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  )
}

// Page-level error boundary with custom styling
export function PageErrorBoundary({
  children,
  pageName
}: {
  children: React.ReactNode
  pageName?: string
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
            <p className="text-lg text-muted-foreground">
              {pageName ? `Error loading ${pageName}` : 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  )
}

// Section-level error boundary with inline styling
export function SectionErrorBoundary({
  children,
  sectionName,
  className = ''
}: {
  children: React.ReactNode
  sectionName?: string
  className?: string
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className={`p-4 border border-destructive/20 rounded-md bg-destructive/5 ${className}`}>
          <p className="text-sm text-destructive">
            {sectionName ? `Error in ${sectionName}` : 'Failed to load this section'}
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Async component error boundary
export function AsyncBoundary({
  children,
  fallback,
  errorFallback
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
}) {
  return (
    <React.Suspense fallback={fallback || <div className="animate-pulse">Loading...</div>}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </React.Suspense>
  )
}