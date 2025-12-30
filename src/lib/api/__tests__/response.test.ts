/**
 * API Response Tests
 * Tests for standardized API response helpers
 */

// Mock NextResponse before importing the module
jest.mock('next/server', () => {
  class MockNextResponse {
    status: number
    _body: unknown

    constructor(body: unknown, init?: { status?: number }) {
      this._body = body
      this.status = init?.status || 200
    }

    async json() {
      return this._body
    }

    async text() {
      return JSON.stringify(this._body)
    }

    static json(data: unknown, init?: { status?: number }) {
      return new MockNextResponse(data, init)
    }
  }

  return { NextResponse: MockNextResponse }
})

import {
  successResponse,
  paginatedResponse,
  errorResponse,
  errors,
  noContent,
  createdResponse,
  acceptedResponse
} from '../response'

describe('API Response Helpers', () => {
  describe('successResponse', () => {
    it('should create success response with data', async () => {
      const data = { id: '123', name: 'Test' }
      const response = successResponse(data)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
    })

    it('should accept custom status code', async () => {
      const response = successResponse({ value: 'test' }, 201)

      expect(response.status).toBe(201)
    })

    it('should include meta when provided', async () => {
      const response = successResponse(
        { items: [] },
        200,
        { page: 1, limit: 10, total: 100 }
      )

      const body = await response.json()
      expect(body.meta).toEqual({ page: 1, limit: 10, total: 100 })
    })

    it('should handle null data', async () => {
      const response = successResponse(null)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toBeNull()
    })

    it('should handle array data', async () => {
      const data = [{ id: 1 }, { id: 2 }]
      const response = successResponse(data)

      const body = await response.json()
      expect(body.data).toHaveLength(2)
    })
  })

  describe('paginatedResponse', () => {
    it('should create paginated response', async () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const pagination = { page: 1, limit: 10, total: 25 }

      const response = paginatedResponse(items, pagination)

      expect(response.status).toBe(200)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data.items).toEqual(items)
      expect(body.data.pagination.page).toBe(1)
      expect(body.data.pagination.limit).toBe(10)
      expect(body.data.pagination.total).toBe(25)
      expect(body.data.pagination.totalPages).toBe(3)
    })

    it('should calculate hasMore correctly', async () => {
      // First page with more pages
      const response1 = paginatedResponse([], { page: 1, limit: 10, total: 25 })
      const body1 = await response1.json()
      expect(body1.data.pagination.hasMore).toBe(true)

      // Last page
      const response2 = paginatedResponse([], { page: 3, limit: 10, total: 25 })
      const body2 = await response2.json()
      expect(body2.data.pagination.hasMore).toBe(false)
    })

    it('should calculate totalPages correctly', async () => {
      // Exact division
      const response1 = paginatedResponse([], { page: 1, limit: 10, total: 30 })
      const body1 = await response1.json()
      expect(body1.data.pagination.totalPages).toBe(3)

      // With remainder
      const response2 = paginatedResponse([], { page: 1, limit: 10, total: 25 })
      const body2 = await response2.json()
      expect(body2.data.pagination.totalPages).toBe(3)
    })

    it('should handle empty results', async () => {
      const response = paginatedResponse([], { page: 1, limit: 10, total: 0 })

      const body = await response.json()
      expect(body.data.items).toEqual([])
      expect(body.data.pagination.totalPages).toBe(0)
      expect(body.data.pagination.hasMore).toBe(false)
    })

    it('should accept custom status code', async () => {
      const response = paginatedResponse([], { page: 1, limit: 10, total: 0 }, 201)

      expect(response.status).toBe(201)
    })
  })

  describe('errorResponse', () => {
    it('should create error response', async () => {
      const response = errorResponse('TEST_ERROR', 'Test error message')

      expect(response.status).toBe(400)

      const body = await response.json()
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('TEST_ERROR')
      expect(body.error.message).toBe('Test error message')
    })

    it('should accept custom status code', async () => {
      const response = errorResponse('NOT_FOUND', 'Not found', 404)

      expect(response.status).toBe(404)
    })

    it('should include details when provided', async () => {
      const details = { field: 'email', reason: 'invalid format' }
      const response = errorResponse('VALIDATION', 'Invalid', 400, details)

      const body = await response.json()
      expect(body.error.details).toEqual(details)
    })

    it('should handle array details', async () => {
      const details = [
        { field: 'email', error: 'required' },
        { field: 'name', error: 'too short' }
      ]
      const response = errorResponse('VALIDATION', 'Validation failed', 400, details)

      const body = await response.json()
      expect(body.error.details).toHaveLength(2)
    })
  })

  describe('errors factory', () => {
    describe('unauthorized', () => {
      it('should return 401 with default message', async () => {
        const response = errors.unauthorized()

        expect(response.status).toBe(401)

        const body = await response.json()
        expect(body.error.code).toBe('UNAUTHORIZED')
        expect(body.error.message).toBe('Yêu cầu đăng nhập')
      })

      it('should accept custom message', async () => {
        const response = errors.unauthorized('Custom auth message')

        const body = await response.json()
        expect(body.error.message).toBe('Custom auth message')
      })
    })

    describe('forbidden', () => {
      it('should return 403 with default message', async () => {
        const response = errors.forbidden()

        expect(response.status).toBe(403)

        const body = await response.json()
        expect(body.error.code).toBe('FORBIDDEN')
        expect(body.error.message).toBe('Không có quyền truy cập')
      })

      it('should accept custom message', async () => {
        const response = errors.forbidden('Access denied')

        const body = await response.json()
        expect(body.error.message).toBe('Access denied')
      })
    })

    describe('notFound', () => {
      it('should return 404 with resource name', async () => {
        const response = errors.notFound('User')

        expect(response.status).toBe(404)

        const body = await response.json()
        expect(body.error.code).toBe('NOT_FOUND')
        expect(body.error.message).toBe('User không tìm thấy')
      })
    })

    describe('validation', () => {
      it('should return 400 with details', async () => {
        const details = { email: 'Invalid email format' }
        const response = errors.validation(details)

        expect(response.status).toBe(400)

        const body = await response.json()
        expect(body.error.code).toBe('VALIDATION_ERROR')
        expect(body.error.details).toEqual(details)
      })
    })

    describe('conflict', () => {
      it('should return 409', async () => {
        const response = errors.conflict('Email already exists')

        expect(response.status).toBe(409)

        const body = await response.json()
        expect(body.error.code).toBe('CONFLICT')
        expect(body.error.message).toBe('Email already exists')
      })
    })

    describe('internal', () => {
      it('should return 500 with default message', async () => {
        const response = errors.internal()

        expect(response.status).toBe(500)

        const body = await response.json()
        expect(body.error.code).toBe('INTERNAL_ERROR')
        expect(body.error.message).toBe('Có lỗi xảy ra, vui lòng thử lại sau')
      })

      it('should accept custom message', async () => {
        const response = errors.internal('Database error')

        const body = await response.json()
        expect(body.error.message).toBe('Database error')
      })
    })

    describe('rateLimited', () => {
      it('should return 429 without minutes', async () => {
        const response = errors.rateLimited()

        expect(response.status).toBe(429)

        const body = await response.json()
        expect(body.error.code).toBe('RATE_LIMITED')
        expect(body.error.message).toBe('Quá nhiều yêu cầu')
      })

      it('should return 429 with minutes', async () => {
        const response = errors.rateLimited(5)

        const body = await response.json()
        expect(body.error.message).toBe('Quá nhiều yêu cầu. Thử lại sau 5 phút')
      })
    })

    describe('locked', () => {
      it('should return 423 with lockout duration', async () => {
        const response = errors.locked(15)

        expect(response.status).toBe(423)

        const body = await response.json()
        expect(body.error.code).toBe('ACCOUNT_LOCKED')
        expect(body.error.message).toBe('Tài khoản bị khóa. Thử lại sau 15 phút')
      })
    })

    describe('paymentFailed', () => {
      it('should return 402 with default message', async () => {
        const response = errors.paymentFailed()

        expect(response.status).toBe(402)

        const body = await response.json()
        expect(body.error.code).toBe('PAYMENT_FAILED')
        expect(body.error.message).toBe('Thanh toán thất bại')
      })

      it('should accept custom message', async () => {
        const response = errors.paymentFailed('Card declined')

        const body = await response.json()
        expect(body.error.message).toBe('Card declined')
      })
    })

    describe('serviceUnavailable', () => {
      it('should return 503 without service name', async () => {
        const response = errors.serviceUnavailable()

        expect(response.status).toBe(503)

        const body = await response.json()
        expect(body.error.code).toBe('SERVICE_UNAVAILABLE')
        expect(body.error.message).toBe('Dịch vụ không khả dụng')
      })

      it('should return 503 with service name', async () => {
        const response = errors.serviceUnavailable('payment gateway')

        const body = await response.json()
        expect(body.error.message).toBe('Dịch vụ payment gateway không khả dụng')
      })
    })
  })

  describe('noContent', () => {
    it('should return 204 with no body', () => {
      const response = noContent()

      expect(response.status).toBe(204)
    })
  })

  describe('createdResponse', () => {
    it('should return 201 with data', async () => {
      const data = { id: 'new-123', name: 'Created Item' }
      const response = createdResponse(data)

      expect(response.status).toBe(201)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
    })
  })

  describe('acceptedResponse', () => {
    it('should return 202 with data', async () => {
      const data = { jobId: 'job-123', status: 'processing' }
      const response = acceptedResponse(data)

      expect(response.status).toBe(202)

      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
    })
  })
})
