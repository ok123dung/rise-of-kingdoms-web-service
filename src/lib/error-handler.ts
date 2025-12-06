// Sentry error handling integration
// Re-exports error classes from centralized errors.ts

import * as Sentry from '@sentry/nextjs'

import { getLogger } from '@/lib/monitoring/logger'

// Re-export from centralized errors
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  handleApiError,
  handleDatabaseError,
  logError,
  isAppError,
  isOperationalError,
  ErrorMessages
} from '@/lib/errors'

import { type AppError, isAppError } from '@/lib/errors'

export interface ErrorContext {
  user_id?: string
  action?: string
  metadata?: Record<string, unknown>
  tags?: Record<string, string>
}

// Enhanced error handler with Sentry integration
export function handleErrorWithSentry(error: Error | AppError, context?: ErrorContext): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('Error:', error)
    if (context) {
      // eslint-disable-next-line no-console
      console.error('Context:', context)
    }
  }

  // Log to monitoring
  getLogger().error(
    error.message,
    error,
    context
      ? {
          user_id: context.user_id,
          action: context.action
        }
      : undefined
  )

  // Send to Sentry with context
  if (isAppError(error)) {
    const appError = error
    // Operational errors
    if (appError.isOperational) {
      // Only send to Sentry if it's a server error
      if (appError.statusCode >= 500) {
        Sentry.captureException(error, {
          level: 'error',
          contexts: {
            app: {
              statusCode: appError.statusCode,
              isOperational: appError.isOperational
            }
          },
          tags: {
            type: 'operational',
            statusCode: appError.statusCode.toString(),
            ...context?.tags
          },
          user: context?.user_id ? { id: context.user_id } : undefined,
          extra: context?.metadata
        })
      }
    } else {
      // Programming errors - always send to Sentry
      Sentry.captureException(error, {
        level: 'fatal',
        contexts: {
          app: {
            statusCode: appError.statusCode,
            isOperational: appError.isOperational
          }
        },
        tags: {
          type: 'programming',
          statusCode: appError.statusCode.toString(),
          ...context?.tags
        },
        user: context?.user_id ? { id: context.user_id } : undefined,
        extra: context?.metadata
      })
    }
  } else {
    // Unknown errors - always send to Sentry
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        type: 'unknown',
        ...context?.tags
      },
      user: context?.user_id ? { id: context.user_id } : undefined,
      extra: context?.metadata
    })
  }
}

// Error response helper with Sentry trace
export function createErrorResponse(error: Error | AppError): {
  error: string
  message?: string
  statusCode: number
  timestamp: string
  requestId?: string
} {
  const statusCode = isAppError(error) ? error.statusCode : 500
  const message = error.message || 'Internal server error'

  // Don't expose internal errors in production
  const safeMessage =
    process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal server error' : message

  return {
    error: error.name || 'Error',
    message: safeMessage,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: Sentry.getActiveSpan()?.spanContext().traceId
  }
}

// Express-style error handler for API routes
export function apiErrorHandler(error: Error | AppError, request: Request): Response {
  const context: ErrorContext = {
    action: `${request.method} ${new URL(request.url).pathname}`,
    metadata: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    }
  }

  handleErrorWithSentry(error, context)

  const response = createErrorResponse(error)

  return new Response(JSON.stringify(response), {
    status: response.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': response.requestId ?? ''
    }
  })
}
