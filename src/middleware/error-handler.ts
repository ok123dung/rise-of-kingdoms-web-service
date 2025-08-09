import { type NextRequest, type NextResponse } from 'next/server'

import { handleApiError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'

// Type for API route handlers
export type ApiHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse> | NextResponse

// Wrapper to handle errors for API routes
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
    const startTime = Date.now()

    try {
      // Add request ID to headers for tracking
      const response = await handler(request, context)

      // Log successful request
      const duration = Date.now() - startTime
      getLogger().info('API request completed', {
        method: request.method,
        url: request.url,
        status: response.status,
        duration,
        requestId
      })

      // Add request ID to response headers
      response.headers.set('x-request-id', requestId)

      return response
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      getLogger().error('API request failed', error as Error, {
        method: request.method,
        url: request.url,
        duration,
        requestId
      })

      // Handle the error and return appropriate response
      const errorResponse = handleApiError(error, requestId)
      errorResponse.headers.set('x-request-id', requestId)

      return errorResponse
    }
  }
}

// Compose multiple middleware functions
export function compose(...middlewares: Array<(handler: ApiHandler) => ApiHandler>) {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler)
  }
}

// Export commonly used compositions
export const withApiMiddleware = (handler: ApiHandler) => compose(withErrorHandler)(handler)

// With auth and error handling
export const withAuthAndError = (
  handler: ApiHandler,
  authMiddleware: (handler: ApiHandler) => ApiHandler
) => compose(withErrorHandler, authMiddleware)(handler)

// With rate limiting and error handling
export const withRateLimitAndError = (
  handler: ApiHandler,
  rateLimitMiddleware: (handler: ApiHandler) => ApiHandler
) => compose(withErrorHandler, rateLimitMiddleware)(handler)
