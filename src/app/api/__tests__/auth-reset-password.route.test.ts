/**
 * @jest-environment node
 */

/**
 * Reset Password API Route Tests
 * Tests for /api/auth/reset-password endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      update: jest.fn(),
    },
    password_reset_tokens: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('@/lib/api/db-middleware', () => ({
  withDatabaseConnection: (handler: any) => handler,
}))

jest.mock('@/lib/monitoring', () => ({
  trackRequest: () => (handler: any) => handler,
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    auth: {
      isAllowed: jest.fn().mockResolvedValue({ allowed: true }),
    },
  },
}))

jest.mock('@/lib/errors', () => ({
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ValidationError'
    }
  },
  handleApiError: jest.fn((error, _requestId) => {
    const { NextResponse } = require('next/server')
    if (error.name === 'ValidationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }),
  ErrorMessages: {
    INVALID_INPUT: 'Invalid input',
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$14$hashedpassword'),
}))

import { prismaAdmin as prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { POST } from '../auth/reset-password/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockRateLimiter = rateLimiters.auth as jest.Mocked<typeof rateLimiters.auth>

describe('Reset Password API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimiter.isAllowed.mockResolvedValue({ allowed: true })
  })

  const validToken = {
    id: 'token-123',
    token: 'valid-reset-token',
    user_id: 'user-123',
    created_at: new Date(), // Recent token
    users: { id: 'user-123', email: 'user@example.com' },
  }

  describe('POST /api/auth/reset-password', () => {
    it('should return 429 when rate limited', async () => {
      mockRateLimiter.isAllowed.mockResolvedValue({ allowed: false, retryAfter: 60 })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/reset-password',
        body: {
          token: 'valid-token',
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(429)
    })

    it('should return 400 for invalid/missing token', async () => {
      mockPrisma.password_reset_tokens.findUnique.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/reset-password',
        body: {
          token: 'invalid-token',
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return 400 for expired token', async () => {
      const expiredToken = {
        ...validToken,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      }
      mockPrisma.password_reset_tokens.findUnique.mockResolvedValue(expiredToken as any)
      mockPrisma.password_reset_tokens.delete.mockResolvedValue({} as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/reset-password',
        body: {
          token: 'expired-token',
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toContain('hết hạn')
    })

    it('should reset password successfully with valid token', async () => {
      mockPrisma.password_reset_tokens.findUnique.mockResolvedValue(validToken as any)
      mockPrisma.$transaction.mockResolvedValue([{}, {}])

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/reset-password',
        body: {
          token: 'valid-reset-token',
          password: 'newpassword123',
          confirmPassword: 'newpassword123',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should return 400 when passwords do not match', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/reset-password',
        body: {
          token: 'valid-token',
          password: 'newpassword123',
          confirmPassword: 'differentpassword',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    it('should return 400 for password too short', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/reset-password',
        body: {
          token: 'valid-token',
          password: 'short',
          confirmPassword: 'short',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })
})
