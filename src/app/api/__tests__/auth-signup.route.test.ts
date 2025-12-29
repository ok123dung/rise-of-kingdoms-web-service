/**
 * @jest-environment node
 */

/**
 * Signup API Route Tests
 * Tests for /api/auth/signup endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
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

jest.mock('@/lib/csrf-protection', () => ({
  validateCSRF: jest.fn().mockReturnValue({ valid: true }),
}))

jest.mock('@/lib/security-audit', () => ({
  securityAudit: {
    rateLimited: jest.fn(),
    csrfViolation: jest.fn(),
  },
  getClientInfo: jest.fn().mockReturnValue({ ip: '127.0.0.1', userAgent: 'test' }),
}))

jest.mock('@/lib/validation', () => ({
  signupSchema: {
    parse: jest.fn((data) => data),
  },
  sanitizeInput: jest.fn((input) => input),
}))

jest.mock('@/lib/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/errors', () => ({
  ConflictError: class ConflictError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ConflictError'
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ValidationError'
    }
  },
  handleDatabaseError: jest.fn((error) => {
    throw error
  }),
  handleApiError: jest.fn((error, _requestId) => {
    const { NextResponse } = require('next/server')
    if (error.name === 'ConflictError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 })
    }
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
import { validateCSRF } from '@/lib/csrf-protection'
import { signupSchema } from '@/lib/validation'
import { POST } from '../auth/signup/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockRateLimiter = rateLimiters.auth as jest.Mocked<typeof rateLimiters.auth>
const mockValidateCSRF = validateCSRF as jest.MockedFunction<typeof validateCSRF>
const mockSignupSchema = signupSchema as jest.Mocked<typeof signupSchema>

describe('Signup API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimiter.isAllowed.mockResolvedValue({ allowed: true })
    mockValidateCSRF.mockReturnValue({ valid: true })
    mockSignupSchema.parse.mockImplementation((data) => data)
  })

  const mockNewUser = {
    id: 'new-user-123',
    full_name: 'New User',
    email: 'newuser@example.com',
    phone: '0912345678',
    created_at: new Date(),
  }

  describe('POST /api/auth/signup', () => {
    it('should return 403 when CSRF validation fails', async () => {
      mockValidateCSRF.mockReturnValue({ valid: false, reason: 'Invalid token' })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(403)
      expect(data.error).toContain('Invalid request')
    })

    it('should return 429 when rate limited', async () => {
      mockRateLimiter.isAllowed.mockResolvedValue({ allowed: false, retryAfter: 60 })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(429)
    })

    it('should return 409 when email already exists', async () => {
      mockPrisma.users.findUnique.mockResolvedValue({ id: 'existing-user' } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'existing@example.com',
          password: 'Password123!',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(409)
    })

    it('should return 409 when phone already exists', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.findFirst.mockResolvedValue({ id: 'existing-user' } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'newuser@example.com',
          phone: '0912345678',
          password: 'Password123!',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(409)
    })

    it('should create user successfully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.findFirst.mockResolvedValue(null)
      mockPrisma.users.create.mockResolvedValue(mockNewUser as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('newuser@example.com')
    })

    it('should create user with phone number', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.findFirst.mockResolvedValue(null)
      mockPrisma.users.create.mockResolvedValue(mockNewUser as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'newuser@example.com',
          phone: '0912345678',
          password: 'Password123!',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })

    it('should return 400 for validation errors', async () => {
      const { z } = await import('zod')
      mockSignupSchema.parse.mockImplementation(() => {
        throw new z.ZodError([
          {
            code: 'too_small',
            minimum: 8,
            type: 'string',
            inclusive: true,
            exact: false,
            path: ['password'],
            message: 'Password must be at least 8 characters',
          },
        ])
      })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signup',
        body: {
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'short',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })
})
