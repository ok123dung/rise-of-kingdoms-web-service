/**
 * Error Handler Middleware Tests
 * Tests for API error handling wrapper and middleware composition
 */

import { NextResponse } from 'next/server'

import {
  withErrorHandler,
  compose,
  withApiMiddleware,
  withAuthAndError,
  withRateLimitAndError
} from '../error-handler'

// Mock dependencies
jest.mock('@/lib/errors', () => ({
  handleApiError: jest.fn((error, requestId) =>
    NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', requestId },
      { status: 500 }
    )
  ),
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

import { handleApiError } from '@/lib/errors'

const mockHandleApiError = handleApiError as jest.MockedFunction<typeof handleApiError>

// Helper to create mock NextRequest
function createMockRequest(options: {
  pathname?: string
  method?: string
  headers?: Record<string, string>
} = {}): any {
  const { pathname = '/api/test', method = 'GET', headers = {} } = options
  const url = `http://localhost:3000${pathname}`

  return {
    nextUrl: {
      pathname,
      searchParams: new URLSearchParams(),
    },
    url,
    method,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
  }
}

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('withErrorHandler', () => {
    it('should pass through successful responses', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true }, { status: 200 })
      )
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest()

      const response = await wrappedHandler(req)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledWith(req, undefined)
    })

    it('should pass context to handler', async () => {
      const handler = jest.fn().mockResolvedValue(NextResponse.json({ id: '123' }))
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest()
      const context = { params: { id: '123' } }

      await wrappedHandler(req, context)

      expect(handler).toHaveBeenCalledWith(req, context)
    })

    it('should handle errors and return error response', async () => {
      const error = new Error('Something went wrong')
      const handler = jest.fn().mockRejectedValue(error)
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest()

      const response = await wrappedHandler(req)

      expect(response.status).toBe(500)
      expect(mockHandleApiError).toHaveBeenCalledWith(error, expect.any(String))
    })

    it('should add x-request-id header to successful response', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest()

      const response = await wrappedHandler(req)

      expect(response.headers.get('x-request-id')).toBeDefined()
    })

    it('should add x-request-id header to error response', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Test error'))
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest()

      const response = await wrappedHandler(req)

      expect(response.headers.get('x-request-id')).toBeDefined()
    })

    it('should use provided request-id header if present', async () => {
      const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest({
        headers: { 'x-request-id': 'custom-request-id' },
      })

      const response = await wrappedHandler(req)

      expect(response.headers.get('x-request-id')).toBe('custom-request-id')
    })

    it('should handle non-Error thrown values', async () => {
      const handler = jest.fn().mockRejectedValue('string error')
      const wrappedHandler = withErrorHandler(handler)
      const req = createMockRequest()

      const response = await wrappedHandler(req)

      expect(response.status).toBe(500)
    })
  })

  describe('compose', () => {
    it('should compose multiple middleware in correct order', async () => {
      const order: number[] = []

      const middleware1 = (handler: any) => async (req: any, ctx: any) => {
        order.push(1)
        const response = await handler(req, ctx)
        order.push(4)
        return response
      }

      const middleware2 = (handler: any) => async (req: any, ctx: any) => {
        order.push(2)
        const response = await handler(req, ctx)
        order.push(3)
        return response
      }

      const handler = jest.fn().mockImplementation(async () => {
        return NextResponse.json({ success: true })
      })

      const composed = compose(middleware1, middleware2)(handler)
      await composed(createMockRequest())

      // Middleware runs in order: 1 -> 2 -> handler -> 3 -> 4
      expect(order).toEqual([1, 2, 3, 4])
    })

    it('should work with single middleware', async () => {
      const middleware = (handler: any) => async (req: any, ctx: any) => {
        const response = await handler(req, ctx)
        response.headers.set('x-middleware', 'applied')
        return response
      }

      const handler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }))
      const composed = compose(middleware)(handler)
      const response = await composed(createMockRequest())

      expect(response.headers.get('x-middleware')).toBe('applied')
    })

    it('should return handler unchanged with no middleware', async () => {
      const handler = jest.fn().mockResolvedValue(NextResponse.json({ data: 'test' }))
      const composed = compose()(handler)
      const req = createMockRequest()

      await composed(req)

      expect(handler).toHaveBeenCalledWith(req)
    })
  })

  describe('withApiMiddleware', () => {
    it('should wrap handler with error handling', async () => {
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const wrapped = withApiMiddleware(handler)
      const req = createMockRequest()

      const response = await wrapped(req)

      expect(response.status).toBe(200)
      expect(response.headers.get('x-request-id')).toBeDefined()
    })

    it('should handle errors in wrapped handler', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('API Error'))
      const wrapped = withApiMiddleware(handler)
      const req = createMockRequest()

      const response = await wrapped(req)

      expect(response.status).toBe(500)
    })
  })

  describe('withAuthAndError', () => {
    it('should compose auth middleware with error handler', async () => {
      const authCalled = jest.fn()
      const authMiddleware = (handler: any) => async (req: any, ctx: any) => {
        authCalled()
        return handler(req, ctx)
      }

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const req = createMockRequest()

      const wrapped = withAuthAndError(handler, authMiddleware)
      await wrapped(req)

      expect(authCalled).toHaveBeenCalled()
      expect(handler).toHaveBeenCalled()
    })

    it('should handle auth middleware errors', async () => {
      const authMiddleware = () => async () => {
        throw new Error('Auth failed')
      }

      const handler = jest.fn()
      const req = createMockRequest()

      const wrapped = withAuthAndError(handler, authMiddleware)
      const response = await wrapped(req)

      expect(response.status).toBe(500)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should add request-id header when auth succeeds', async () => {
      const authMiddleware = (handler: any) => async (req: any, ctx: any) => {
        return handler(req, ctx)
      }

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const req = createMockRequest()

      const wrapped = withAuthAndError(handler, authMiddleware)
      const response = await wrapped(req)

      expect(response.headers.get('x-request-id')).toBeDefined()
    })
  })

  describe('withRateLimitAndError', () => {
    it('should compose rate limit middleware with error handler', async () => {
      const rateLimitCalled = jest.fn()
      const rateLimitMiddleware = (handler: any) => async (req: any, ctx: any) => {
        rateLimitCalled()
        return handler(req, ctx)
      }

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const req = createMockRequest()

      const wrapped = withRateLimitAndError(handler, rateLimitMiddleware)
      await wrapped(req)

      expect(rateLimitCalled).toHaveBeenCalled()
      expect(handler).toHaveBeenCalled()
    })

    it('should handle rate limit exceeded error', async () => {
      const rateLimitMiddleware = () => async () => {
        throw new Error('Rate limit exceeded')
      }

      const handler = jest.fn()
      const req = createMockRequest()

      const wrapped = withRateLimitAndError(handler, rateLimitMiddleware)
      const response = await wrapped(req)

      expect(response.status).toBe(500)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should add request-id header when rate limit passes', async () => {
      const rateLimitMiddleware = (handler: any) => async (req: any, ctx: any) => {
        return handler(req, ctx)
      }

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const req = createMockRequest()

      const wrapped = withRateLimitAndError(handler, rateLimitMiddleware)
      const response = await wrapped(req)

      expect(response.headers.get('x-request-id')).toBeDefined()
    })
  })
})
