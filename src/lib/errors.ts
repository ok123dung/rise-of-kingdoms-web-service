// Centralized error handling system for RoK Services

import { NextResponse } from 'next/server'

import { getLogger, type LogContext } from '@/lib/monitoring/logger'

// Base error class with proper typing
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', context?: Record<string, unknown>) {
    super(message, 401, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', context?: Record<string, unknown>) {
    super(message, 403, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, true, context)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, true, context)
  }
}

export class PaymentError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 402, true, context)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(`${service} error: ${message}`, 503, true, context)
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', context?: Record<string, unknown>) {
    super(message, 429, true, context)
  }
}

// Error response formatter
export interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    statusCode: number
    timestamp: string
    requestId?: string
  }
}

// Safe error message for client
function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AppError && error.isOperational) {
    return error.message
  }

  if (error instanceof Error) {
    // Don't expose system errors to client
    if (
      error.message.includes('ECONNREFUSED') ??
      error.message.includes('ETIMEDOUT') ??
      error.message.includes('ENOTFOUND')
    ) {
      return 'Service temporarily unavailable'
    }

    if (error.message.includes('Unique constraint failed')) {
      return 'This record already exists'
    }

    if (error.message.includes('Foreign key constraint failed')) {
      return 'Related record not found'
    }
  }

  return 'An unexpected error occurred'
}

// Log error with context
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const logger = getLogger()

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      const logContext: LogContext = {
        statusCode: String(error.statusCode),
        isOperational: String(error.isOperational),
        ...(error.context &&
          Object.fromEntries(
            Object.entries(error.context).map(([k, v]) => [k, v != null ? String(v) : ''])
          )),
        ...(context &&
          Object.fromEntries(
            Object.entries(context).map(([k, v]) => [k, v != null ? String(v) : ''])
          ))
      }
      logger.error('Application error', error, logContext)
    } else {
      const logContext: LogContext = {
        message: error.message,
        statusCode: String(error.statusCode),
        ...(error.context &&
          Object.fromEntries(
            Object.entries(error.context).map(([k, v]) => [k, v != null ? String(v) : ''])
          )),
        ...(context &&
          Object.fromEntries(
            Object.entries(context).map(([k, v]) => [k, v != null ? String(v) : ''])
          ))
      }
      logger.warn('Client error', logContext)
    }
  } else if (error instanceof Error) {
    logger.error('Unexpected error', error, context as LogContext | undefined)
  } else {
    logger.error('Unknown error', new Error(String(error)), context as LogContext | undefined)
  }
}

// API error response handler
export function handleApiError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  logError(error, { requestId })

  const statusCode = error instanceof AppError ? error.statusCode : 500
  const message = getSafeErrorMessage(error)

  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        requestId
      }
    },
    { status: statusCode }
  )
}

// Async error wrapper for API routes
export function asyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      const [request] = args as unknown as [Request]
      const requestId = request?.headers?.get('x-request-id') ?? undefined
      return handleApiError(error, requestId)
    }
  }) as T
}

// Validation helper
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[],
  fieldNames?: Record<keyof T, string>
): void {
  const missing: string[] = []

  for (const field of fields) {
    if (!data[field]) {
      const fieldName = fieldNames?.[field] ?? String(field)
      missing.push(fieldName)
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`, {
      missingFields: missing
    })
  }
}

// Database error handler
export function handleDatabaseError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message.includes('P2002')) {
      throw new ConflictError('This record already exists')
    }
    if (error.message.includes('P2003')) {
      throw new ValidationError('Related record not found')
    }
    if (error.message.includes('P2025')) {
      throw new NotFoundError('Record')
    }
  }

  throw error
}

// External service error handler
export function handleExternalServiceError(service: string, error: unknown): never {
  if (error instanceof Error) {
    throw new ExternalServiceError(service, error.message, {
      originalError: error.message
    })
  }

  throw new ExternalServiceError(service, 'Service unavailable')
}

// Retry mechanism for external services
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    factor?: number
    onRetry?: (error: unknown, attempt: number) => void
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, factor = 2, onRetry } = options

  let lastError: unknown

  // Retries must be sequential with delays between attempts
  // eslint-disable-next-line no-await-in-loop
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt < maxRetries - 1) {
        const delay = Math.min(initialDelay * Math.pow(factor, attempt), maxDelay)

        if (onRetry) {
          onRetry(error, attempt + 1)
        }

        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Type guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isOperationalError(error: unknown): boolean {
  return error instanceof AppError && error.isOperational
}

// Error message templates
export const ErrorMessages = {
  // Auth
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn',
  UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện thao tác này',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',

  // Validation
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_INPUT: 'Thông tin nhập vào không hợp lệ',

  // Resources
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  SERVICE_NOT_FOUND: 'Không tìm thấy dịch vụ',
  BOOKING_NOT_FOUND: 'Không tìm thấy booking',
  PAYMENT_NOT_FOUND: 'Không tìm thấy thông tin thanh toán',

  // Operations
  BOOKING_FAILED: 'Không thể tạo booking. Vui lòng thử lại',
  PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại',
  EMAIL_FAILED: 'Không thể gửi email. Vui lòng thử lại',

  // System
  INTERNAL_ERROR: 'Có lỗi xảy ra. Vui lòng thử lại sau',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng',
  RATE_LIMITED: 'Quá nhiều yêu cầu. Vui lòng thử lại sau'
} as const
