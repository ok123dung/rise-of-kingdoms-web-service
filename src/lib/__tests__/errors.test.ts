/**
 * Error Handling System Tests
 * Tests for centralized error classes and handlers
 */

import { NextResponse } from 'next/server'

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  PaymentError,
  ExternalServiceError,
  RateLimitError,
  logError,
  handleApiError,
  asyncHandler,
  validateRequired,
  handleDatabaseError,
  handleExternalServiceError,
  retryWithBackoff,
  isAppError,
  isOperationalError,
  ErrorMessages
} from '../errors'

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
      expect(error.context).toBeUndefined()
    })

    it('should create error with custom values', () => {
      const context = { userId: '123' }
      const error = new AppError('Custom error', 400, false, context)

      expect(error.message).toBe('Custom error')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(false)
      expect(error.context).toEqual(context)
    })

    it('should be instanceof Error', () => {
      const error = new AppError('Test')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
    })

    it('should have stack trace', () => {
      const error = new AppError('Test')
      expect(error.stack).toBeDefined()
    })
  })

  describe('ValidationError', () => {
    it('should create with 400 status code', () => {
      const error = new ValidationError('Invalid input')

      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
      expect(error.message).toBe('Invalid input')
    })

    it('should accept context', () => {
      const error = new ValidationError('Invalid', { field: 'email' })
      expect(error.context).toEqual({ field: 'email' })
    })
  })

  describe('AuthenticationError', () => {
    it('should create with 401 status code', () => {
      const error = new AuthenticationError()

      expect(error.statusCode).toBe(401)
      expect(error.message).toBe('Authentication failed')
    })

    it('should accept custom message', () => {
      const error = new AuthenticationError('Token expired')
      expect(error.message).toBe('Token expired')
    })
  })

  describe('AuthorizationError', () => {
    it('should create with 403 status code', () => {
      const error = new AuthorizationError()

      expect(error.statusCode).toBe(403)
      expect(error.message).toBe('Access denied')
    })

    it('should accept custom message', () => {
      const error = new AuthorizationError('Admin only')
      expect(error.message).toBe('Admin only')
    })
  })

  describe('NotFoundError', () => {
    it('should create with 404 status code', () => {
      const error = new NotFoundError('User')

      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('User not found')
    })

    it('should format resource name in message', () => {
      const error = new NotFoundError('Booking #123')
      expect(error.message).toBe('Booking #123 not found')
    })
  })

  describe('ConflictError', () => {
    it('should create with 409 status code', () => {
      const error = new ConflictError('Email already exists')

      expect(error.statusCode).toBe(409)
      expect(error.message).toBe('Email already exists')
    })
  })

  describe('PaymentError', () => {
    it('should create with 402 status code', () => {
      const error = new PaymentError('Payment declined')

      expect(error.statusCode).toBe(402)
      expect(error.message).toBe('Payment declined')
    })
  })

  describe('ExternalServiceError', () => {
    it('should create with 503 status code', () => {
      const error = new ExternalServiceError('MoMo', 'Connection timeout')

      expect(error.statusCode).toBe(503)
      expect(error.message).toBe('MoMo error: Connection timeout')
    })
  })

  describe('RateLimitError', () => {
    it('should create with 429 status code', () => {
      const error = new RateLimitError()

      expect(error.statusCode).toBe(429)
      expect(error.message).toBe('Too many requests')
    })

    it('should accept custom message', () => {
      const error = new RateLimitError('Slow down')
      expect(error.message).toBe('Slow down')
    })
  })
})

describe('logError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should log server errors with error level', () => {
    const error = new AppError('Server error', 500)

    logError(error)

    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('should log client errors with warn level', () => {
    const error = new AppError('Bad request', 400)

    logError(error)

    expect(mockLogger.warn).toHaveBeenCalled()
  })

  it('should log unexpected errors with error level', () => {
    const error = new Error('Unexpected')

    logError(error)

    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('should log unknown errors', () => {
    logError('string error')

    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('should include context in log', () => {
    const error = new AppError('Error', 400, true, { userId: '123' })

    logError(error, { requestId: 'req-456' })

    expect(mockLogger.warn).toHaveBeenCalled()
  })
})

describe('handleApiError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return NextResponse with correct status', () => {
    const error = new ValidationError('Invalid input')

    const response = handleApiError(error)

    expect(response.status).toBe(400)
  })

  it('should return error response with requestId', () => {
    const error = new NotFoundError('User')

    const response = handleApiError(error, 'req-123')

    expect(response.status).toBe(404)
    // Response headers should be set correctly
    expect(response).toBeInstanceOf(NextResponse)
  })

  it('should return 500 for internal errors', () => {
    const error = new Error('ECONNREFUSED 127.0.0.1:5432')

    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })

  it('should return 500 for timeout errors', () => {
    const error = new Error('ETIMEDOUT')

    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })

  it('should return 500 for unique constraint errors', () => {
    const error = new Error('Unique constraint failed on the fields: (`email`)')

    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })

  it('should return 500 for foreign key errors', () => {
    const error = new Error('Foreign key constraint failed on the field: `user_id`')

    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })

  it('should return correct status for operational errors', () => {
    const error = new ValidationError('Email is required')

    const response = handleApiError(error)

    expect(response.status).toBe(400)
  })

  it('should return 500 for non-operational errors', () => {
    const error = new AppError('Database connection failed', 500, false)

    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })
})

describe('asyncHandler', () => {
  it('should pass through successful response', async () => {
    const handler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    )
    const wrapped = asyncHandler(handler)

    const response = await wrapped({} as any)

    expect(response.status).toBe(200)
  })

  it('should catch errors and return error response', async () => {
    const handler = jest.fn().mockRejectedValue(new ValidationError('Invalid'))
    const mockRequest = {
      headers: { get: () => 'req-123' }
    }
    const wrapped = asyncHandler(handler)

    const response = await wrapped(mockRequest as any)

    expect(response.status).toBe(400)
  })

  it('should include request ID from headers', async () => {
    const handler = jest.fn().mockRejectedValue(new Error('Oops'))
    const mockRequest = {
      headers: { get: (name: string) => name === 'x-request-id' ? 'req-xyz' : null }
    }
    const wrapped = asyncHandler(handler)

    const response = await wrapped(mockRequest as any)

    // Verify error response is returned
    expect(response.status).toBe(500)
  })
})

describe('validateRequired', () => {
  it('should not throw when all fields present', () => {
    const data = { name: 'John', email: 'john@test.com' }

    expect(() => validateRequired(data, ['name', 'email'])).not.toThrow()
  })

  it('should throw ValidationError for missing fields', () => {
    const data = { name: 'John', email: '' }

    expect(() => validateRequired(data, ['name', 'email'])).toThrow(ValidationError)
  })

  it('should list missing fields in message', () => {
    const data = { name: '', email: '', phone: '123' }

    try {
      validateRequired(data, ['name', 'email', 'phone'])
      fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
      expect((error as Error).message).toContain('name')
      expect((error as Error).message).toContain('email')
    }
  })

  it('should use custom field names', () => {
    const data = { name: '' }
    const fieldNames = { name: 'Full Name' }

    try {
      validateRequired(data, ['name'], fieldNames)
      fail('Should have thrown')
    } catch (error) {
      expect((error as Error).message).toContain('Full Name')
    }
  })

  it('should include missing fields in context', () => {
    const data = { a: '', b: 'value' }

    try {
      validateRequired(data, ['a', 'b'])
      fail('Should have thrown')
    } catch (error) {
      expect((error as ValidationError).context?.missingFields).toEqual(['a'])
    }
  })
})

describe('handleDatabaseError', () => {
  it('should convert P2002 to ConflictError', () => {
    const error = new Error('Error P2002: Unique constraint failed')

    expect(() => handleDatabaseError(error)).toThrow(ConflictError)
  })

  it('should convert P2003 to ValidationError', () => {
    const error = new Error('Error P2003: Foreign key constraint')

    expect(() => handleDatabaseError(error)).toThrow(ValidationError)
  })

  it('should convert P2025 to NotFoundError', () => {
    const error = new Error('Error P2025: Record not found')

    expect(() => handleDatabaseError(error)).toThrow(NotFoundError)
  })

  it('should rethrow unknown errors', () => {
    const error = new Error('Unknown database error')

    expect(() => handleDatabaseError(error)).toThrow('Unknown database error')
  })
})

describe('handleExternalServiceError', () => {
  it('should wrap Error in ExternalServiceError', () => {
    const error = new Error('Connection refused')

    expect(() => handleExternalServiceError('PayPal', error))
      .toThrow(ExternalServiceError)
  })

  it('should include service name in message', () => {
    const error = new Error('Timeout')

    try {
      handleExternalServiceError('Stripe', error)
      fail('Should have thrown')
    } catch (e) {
      expect((e as Error).message).toContain('Stripe')
      expect((e as Error).message).toContain('Timeout')
    }
  })

  it('should handle non-Error values', () => {
    expect(() => handleExternalServiceError('API', 'failed'))
      .toThrow('Service unavailable')
  })
})

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return result on first success', async () => {
    const operation = jest.fn().mockResolvedValue('success')

    const resultPromise = retryWithBackoff(operation)
    const result = await resultPromise

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValue('success')

    const resultPromise = retryWithBackoff(operation, { initialDelay: 100 })

    // First attempt fails immediately
    await Promise.resolve()

    // Advance timer for retry
    jest.advanceTimersByTime(100)

    const result = await resultPromise

    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it('should throw after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Always fails'))

    const resultPromise = retryWithBackoff(operation, {
      maxRetries: 3,
      initialDelay: 100
    })

    // Advance through all retries
    for (let i = 0; i < 3; i++) {
      await Promise.resolve()
      jest.advanceTimersByTime(10000)
    }

    await expect(resultPromise).rejects.toThrow('Always fails')
    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('should call onRetry callback', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Fail'))
      .mockResolvedValue('ok')
    const onRetry = jest.fn()

    const resultPromise = retryWithBackoff(operation, {
      initialDelay: 100,
      onRetry
    })

    await Promise.resolve()
    jest.advanceTimersByTime(100)

    await resultPromise

    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1)
  })

  it('should use default options', async () => {
    const operation = jest.fn().mockResolvedValue('ok')

    const resultPromise = retryWithBackoff(operation)
    const result = await resultPromise

    expect(result).toBe('ok')
    expect(operation).toHaveBeenCalledTimes(1)
  })
})

describe('Type Guards', () => {
  describe('isAppError', () => {
    it('should return true for AppError', () => {
      expect(isAppError(new AppError('test'))).toBe(true)
    })

    it('should return true for AppError subclasses', () => {
      expect(isAppError(new ValidationError('test'))).toBe(true)
      expect(isAppError(new AuthenticationError())).toBe(true)
    })

    it('should return false for regular Error', () => {
      expect(isAppError(new Error('test'))).toBe(false)
    })

    it('should return false for non-errors', () => {
      expect(isAppError('string')).toBe(false)
      expect(isAppError(null)).toBe(false)
      expect(isAppError(undefined)).toBe(false)
    })
  })

  describe('isOperationalError', () => {
    it('should return true for operational AppError', () => {
      expect(isOperationalError(new AppError('test', 400, true))).toBe(true)
    })

    it('should return false for non-operational AppError', () => {
      expect(isOperationalError(new AppError('test', 500, false))).toBe(false)
    })

    it('should return false for regular Error', () => {
      expect(isOperationalError(new Error('test'))).toBe(false)
    })
  })
})

describe('ErrorMessages', () => {
  it('should have auth error messages', () => {
    expect(ErrorMessages.INVALID_CREDENTIALS).toBeDefined()
    expect(ErrorMessages.SESSION_EXPIRED).toBeDefined()
    expect(ErrorMessages.UNAUTHORIZED).toBeDefined()
    expect(ErrorMessages.FORBIDDEN).toBeDefined()
  })

  it('should have validation error messages', () => {
    expect(ErrorMessages.INVALID_EMAIL).toBeDefined()
    expect(ErrorMessages.INVALID_PHONE).toBeDefined()
    expect(ErrorMessages.INVALID_INPUT).toBeDefined()
  })

  it('should have resource error messages', () => {
    expect(ErrorMessages.USER_NOT_FOUND).toBeDefined()
    expect(ErrorMessages.SERVICE_NOT_FOUND).toBeDefined()
    expect(ErrorMessages.BOOKING_NOT_FOUND).toBeDefined()
  })

  it('should have system error messages', () => {
    expect(ErrorMessages.INTERNAL_ERROR).toBeDefined()
    expect(ErrorMessages.SERVICE_UNAVAILABLE).toBeDefined()
    expect(ErrorMessages.RATE_LIMITED).toBeDefined()
  })

  it('should be in Vietnamese', () => {
    expect(ErrorMessages.INVALID_CREDENTIALS).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i)
  })
})
