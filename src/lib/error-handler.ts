import * as Sentry from '@sentry/nextjs'
import { getLogger } from '@/lib/monitoring/logger'

export interface ErrorContext {
  userId?: string
  action?: string
  metadata?: Record<string, any>
  tags?: Record<string, string>
}

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public context?: ErrorContext

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 400, true, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: ErrorContext) {
    super(message, 401, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: ErrorContext) {
    super(message, 403, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: ErrorContext) {
    super(message, 404, true, context)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', context?: ErrorContext) {
    super(message, 409, true, context)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', context?: ErrorContext) {
    super(message, 429, true, context)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: ErrorContext) {
    super(`${service} error: ${message}`, 502, true, context)
  }
}

// Enhanced error handler with Sentry
export function handleError(error: Error | AppError, context?: ErrorContext): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
    if (context) {
      console.error('Context:', context)
    }
  }

  // Log to monitoring
  getLogger().error(error.message, error, context)

  // Send to Sentry with context
  if (error instanceof AppError) {
    // Operational errors
    if (error.isOperational) {
      // Only send to Sentry if it's a server error
      if (error.statusCode >= 500) {
        Sentry.captureException(error, {
          level: 'error',
          contexts: {
            app: {
              statusCode: error.statusCode,
              isOperational: error.isOperational,
              ...error.context,
            },
          },
          tags: {
            type: 'operational',
            statusCode: error.statusCode.toString(),
            ...error.context?.tags,
          },
          user: error.context?.userId ? { id: error.context.userId } : undefined,
          extra: error.context?.metadata,
        })
      }
    } else {
      // Programming errors - always send to Sentry
      Sentry.captureException(error, {
        level: 'fatal',
        contexts: {
          app: {
            statusCode: error.statusCode,
            isOperational: error.isOperational,
            ...error.context,
          },
        },
        tags: {
          type: 'programming',
          statusCode: error.statusCode.toString(),
          ...error.context?.tags,
        },
        user: error.context?.userId ? { id: error.context.userId } : undefined,
        extra: error.context?.metadata,
      })
    }
  } else {
    // Unknown errors - always send to Sentry
    Sentry.captureException(error, {
      level: 'error',
      contexts: {
        app: context,
      },
      tags: {
        type: 'unknown',
        ...context?.tags,
      },
      user: context?.userId ? { id: context.userId } : undefined,
      extra: context?.metadata,
    })
  }
}

// Error response helper
export function createErrorResponse(error: Error | AppError): {
  error: string
  message?: string
  statusCode: number
  timestamp: string
  requestId?: string
} {
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const message = error.message || 'Internal server error'
  
  // Don't expose internal errors in production
  const safeMessage = 
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : message

  return {
    error: error.name || 'Error',
    message: safeMessage,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: Sentry.getCurrentHub().getScope()?.getTransaction()?.traceId,
  }
}

// Async error wrapper
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error as Error, context)
      throw error
    }
  }) as T
}

// Express-style error handler for API routes
export async function apiErrorHandler(
  error: Error | AppError,
  request: Request
): Promise<Response> {
  const context: ErrorContext = {
    action: `${request.method} ${new URL(request.url).pathname}`,
    metadata: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    },
  }

  handleError(error, context)

  const response = createErrorResponse(error)
  
  return new Response(JSON.stringify(response), {
    status: response.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': response.requestId || '',
    },
  })
}