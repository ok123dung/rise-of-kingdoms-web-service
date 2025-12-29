/**
 * @jest-environment node
 */

/**
 * Login API Route Tests
 * Tests for /api/auth/login endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/api/db-middleware', () => ({
  withDatabaseConnection: (handler: any) => handler,
}))

jest.mock('@/lib/monitoring', () => ({
  trackRequest: () => (handler: any) => handler,
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    auth: {
      isAllowed: jest.fn().mockResolvedValue({ allowed: true }),
    },
  },
}))

jest.mock('@/lib/account-lockout', () => ({
  isAccountLocked: jest.fn().mockResolvedValue({ isLocked: false }),
  recordFailedAttempt: jest.fn().mockResolvedValue({ isLocked: false, attemptsRemaining: 4 }),
  clearLockout: jest.fn().mockResolvedValue(undefined),
  formatLockoutDuration: jest.fn().mockReturnValue('15 phút'),
}))

jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
}))

jest.mock('@/lib/security-audit', () => ({
  securityAudit: {
    rateLimited: jest.fn(),
    loginBlocked: jest.fn(),
    loginFailed: jest.fn(),
    loginSuccess: jest.fn(),
    accountLocked: jest.fn(),
  },
  getClientInfo: jest.fn().mockReturnValue({ ip: '127.0.0.1', userAgent: 'test' }),
}))

jest.mock('@/lib/validation', () => ({
  sanitizeInput: jest.fn((input) => input),
}))

jest.mock('@/lib/errors', () => ({
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AuthenticationError'
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ValidationError'
    }
  },
  handleApiError: jest.fn((error, _requestId) => {
    const { NextResponse } = require('next/server')
    if (error.name === 'AuthenticationError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
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
  compare: jest.fn(),
}))

import { prismaAdmin as prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { isAccountLocked, recordFailedAttempt } from '@/lib/account-lockout'
import { compare } from 'bcryptjs'
import { POST } from '../auth/login/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockCompare = compare as jest.MockedFunction<typeof compare>
const mockRateLimiter = rateLimiters.auth as jest.Mocked<typeof rateLimiters.auth>
const mockIsAccountLocked = isAccountLocked as jest.MockedFunction<typeof isAccountLocked>
const mockRecordFailedAttempt = recordFailedAttempt as jest.MockedFunction<typeof recordFailedAttempt>

describe('Login API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimiter.isAllowed.mockResolvedValue({ allowed: true })
    mockIsAccountLocked.mockResolvedValue({ isLocked: false })
  })

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    password: '$2a$14$hashedpassword',
    full_name: 'Test User',
    email_verified: true,
  }

  describe('POST /api/auth/login', () => {
    it('should return 429 when rate limited', async () => {
      mockRateLimiter.isAllowed.mockResolvedValue({ allowed: false, retryAfter: 60 })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'user@example.com', password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(429)
      expect(data.retryAfter).toBe(60)
    })

    it('should return 423 when account is locked', async () => {
      mockIsAccountLocked.mockResolvedValue({
        isLocked: true,
        lockoutUntil: new Date(Date.now() + 900000),
        lockoutDuration: 900,
      })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'locked@example.com', password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(423)
      expect(data.error).toContain('khóa')
      expect(data.lockedUntil).toBeDefined()
    })

    it('should return 401 for invalid credentials', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(false as never)
      mockRecordFailedAttempt.mockResolvedValue({ isLocked: false, attemptsRemaining: 4 })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'user@example.com', password: 'wrongpassword' },
      })

      const response = await POST(req)

      expect(response.status).toBe(401)
      expect(mockRecordFailedAttempt).toHaveBeenCalledWith('user@example.com')
    })

    it('should return 401 for non-existent user', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'nonexistent@example.com', password: 'password123' },
      })

      const response = await POST(req)

      expect(response.status).toBe(401)
    })

    it('should login successfully with valid credentials', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(true as never)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'user@example.com', password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe('user-123')
      expect(data.token).toBe('mock-jwt-token')
    })

    it('should lock account after too many failed attempts', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(false as never)
      mockRecordFailedAttempt.mockResolvedValue({
        isLocked: true,
        lockoutDuration: 900,
        lockoutUntil: new Date(Date.now() + 900000),
      })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'user@example.com', password: 'wrongpassword' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(423)
      expect(data.error).toContain('khóa')
    })

    it('should return 400 for invalid email format', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email: 'invalid-email', password: 'password123' },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })
})
