/**
 * API Error Handler and Wrapper
 * Integrates with centralized error system and response helpers
 */

import { type NextRequest, type NextResponse } from 'next/server'

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  PaymentError,
  logError
} from '@/lib/errors'
import { errorResponse, errors, type ApiResponse } from './response'

// Re-export error classes for convenience
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  PaymentError
}

type RouteHandler = (
  req: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>

/**
 * Wraps API route handlers with error handling
 * Automatically catches errors and returns standardized responses
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?) => {
    const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID()

    try {
      return await handler(req, context)
    } catch (error) {
      logError(error, { requestId, path: req.nextUrl.pathname })

      if (error instanceof AppError) {
        return mapAppErrorToResponse(error)
      }

      // Zod validation errors
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as { flatten?: () => unknown }
        return errors.validation(zodError.flatten?.() ?? error.message)
      }

      // Prisma errors
      if (error instanceof Error) {
        if (error.message.includes('P2002')) {
          return errors.conflict('Bản ghi đã tồn tại')
        }
        if (error.message.includes('P2025')) {
          return errors.notFound('Bản ghi')
        }
      }

      // Unknown errors - don't expose internals
      console.error('Unhandled API error:', error)
      return errors.internal()
    }
  }
}

/**
 * Maps AppError instances to API responses
 */
function mapAppErrorToResponse(error: AppError): NextResponse<ApiResponse> {
  switch (true) {
    case error instanceof ValidationError:
      return errors.validation(error.context)
    case error instanceof AuthenticationError:
      return errors.unauthorized(error.message)
    case error instanceof AuthorizationError:
      return errors.forbidden(error.message)
    case error instanceof NotFoundError:
      return errorResponse('NOT_FOUND', error.message, 404)
    case error instanceof RateLimitError:
      return errors.rateLimited()
    case error instanceof PaymentError:
      return errors.paymentFailed(error.message)
    default:
      if (error.statusCode >= 500) {
        return errors.internal()
      }
      return errorResponse(
        'APP_ERROR',
        error.isOperational ? error.message : 'Có lỗi xảy ra',
        error.statusCode,
        error.isOperational ? error.context : undefined
      )
  }
}

/**
 * Validates request JSON body with Zod schema
 */
export async function validateBody<T>(
  req: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  const body = await req.json().catch(() => ({}))
  return schema.parse(body)
}

/**
 * Validates query params with Zod schema
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: { parse: (data: unknown) => T }
): T {
  const params = Object.fromEntries(req.nextUrl.searchParams)
  return schema.parse(params)
}

/**
 * Gets auth token from request headers
 */
export function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

/**
 * Requires auth token or throws AuthenticationError
 */
export function requireAuthToken(req: NextRequest): string {
  const token = getAuthToken(req)
  if (!token) {
    throw new AuthenticationError('Token không hợp lệ')
  }
  return token
}
