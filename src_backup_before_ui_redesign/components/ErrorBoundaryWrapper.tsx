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
    <ErrorBoundary fallback={fallback} showDetails={showDetails} onError={onError}>
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
      showDetails={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="space-y-4 p-8 text-center">
            <h1 className="text-destructive text-4xl font-bold">Oops!</h1>
            <p className="text-muted-foreground text-lg">
              {pageName ? `Error loading ${pageName}` : 'Something went wrong'}
            </p>
            <button
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
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
        <div
          className={`border-destructive/20 bg-destructive/5 rounded-md border p-4 ${className}`}
        >
          <p className="text-destructive text-sm">
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
      <ErrorBoundary fallback={errorFallback}>{children}</ErrorBoundary>
    </React.Suspense>
  )
}
