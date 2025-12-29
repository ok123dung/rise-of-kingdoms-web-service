/**
 * Login API Route Tests
 * Tests authentication flow including rate limiting and account lockout
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

import { createMockRequest, parseResponse } from '../../utils/test-helpers'

// Mock dependencies before importing route
// Use factory functions for middleware wrappers to ensure they work at module load time
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}))
jest.mock('@/lib/auth/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
}))
jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    auth: {
      isAllowed: jest.fn().mockResolvedValue({ allowed: true }),
    },
  },
}))
jest.mock('@/lib/account-lockout', () => ({
  isAccountLocked: jest.fn().mockResolvedValue({ isLocked: false, failedAttempts: 0, attemptsRemaining: 5 }),
  recordFailedAttempt: jest.fn().mockResolvedValue({ isLocked: false, attemptsRemaining: 4 }),
  clearLockout: jest.fn().mockResolvedValue(undefined),
  formatLockoutDuration: jest.fn().mockReturnValue('5 minutes'),
}))
jest.mock('@/lib/monitoring', () => ({
  trackRequest: jest.fn(() => (handler: unknown) => handler),
}))
// Logger mock - stable object that persists across test runs
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}
jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger,
}))
jest.mock('@/lib/api/db-middleware', () => ({
  withDatabaseConnection: jest.fn((handler: unknown) => handler),
}))
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// Import after mocks
import { POST } from '@/app/api/auth/login/route'
import { prismaAdmin } from '@/lib/db'
import { generateToken } from '@/lib/auth/jwt'
import { rateLimiters } from '@/lib/rate-limit'
import { isAccountLocked, recordFailedAttempt, clearLockout, formatLockoutDuration } from '@/lib/account-lockout'
import { trackRequest } from '@/lib/monitoring'
import { getLogger } from '@/lib/monitoring/logger'
import { withDatabaseConnection } from '@/lib/api/db-middleware'
import { compare } from 'bcryptjs'

// Cast mocks to jest functions - access from imported modules
const mockFindUnique = prismaAdmin.users.findUnique as jest.Mock
const mockCompare = compare as jest.Mock
const mockIsAllowed = rateLimiters.auth.isAllowed as jest.Mock
const mockIsAccountLocked = isAccountLocked as jest.Mock
const mockRecordFailedAttempt = recordFailedAttempt as jest.Mock
const mockClearLockout = clearLockout as jest.Mock

describe('POST /api/auth/login', () => {
  const validUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    full_name: 'Test User',
    email_verified: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock implementations for each test
    mockIsAllowed.mockResolvedValue({ allowed: true })
    mockIsAccountLocked.mockResolvedValue({ isLocked: false, failedAttempts: 0, attemptsRemaining: 5 })
    mockRecordFailedAttempt.mockResolvedValue({ isLocked: false, attemptsRemaining: 4 })
    mockClearLockout.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Successful Login', () => {
    it.skip('should return 200 with token for valid credentials', async () => {
      mockFindUnique.mockResolvedValue(validUser)
      mockCompare.mockResolvedValue(true)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'ValidPassword123!',
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{
        success: boolean
        token: string
        user: { id: string; email: string }
      }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.token).toBe('mock-jwt-token')
      expect(data.user.email).toBe('test@example.com')
    })

    it('should normalize email to lowercase', async () => {
      mockFindUnique.mockResolvedValue(validUser)
      mockCompare.mockResolvedValue(true)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'TEST@EXAMPLE.COM',
          password: 'ValidPassword123!',
        },
      })

      await POST(request)

      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'test@example.com' },
        })
      )
    })
  })

  describe('Invalid Credentials', () => {
    it('should return 401 for non-existent user', async () => {
      mockFindUnique.mockResolvedValue(null)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(mockRecordFailedAttempt).toHaveBeenCalledWith('nonexistent@example.com')
    })

    it('should return 401 for incorrect password', async () => {
      mockFindUnique.mockResolvedValue(validUser)
      mockCompare.mockResolvedValue(false)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'WrongPassword123!',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(mockRecordFailedAttempt).toHaveBeenCalledWith('test@example.com')
    })

    it('should return 401 for user without password', async () => {
      mockFindUnique.mockResolvedValue({
        ...validUser,
        password: null,
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'SomePassword123!',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })
  })

  describe('Input Validation', () => {
    it('should return 400 for invalid email format', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'not-an-email',
          password: 'ValidPassword123!',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 for empty password', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'test@example.com',
          password: '',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })

  describe('Rate Limiting', () => {
    it.skip('should return 429 when rate limit exceeded', async () => {
      mockIsAllowed.mockResolvedValue({
        allowed: false,
        retryAfter: 60,
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'ValidPassword123!',
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{ error: string; retryAfter: number }>(response)

      expect(response.status).toBe(429)
      expect(data.retryAfter).toBe(60)
    })
  })

  describe('Account Lockout', () => {
    it.skip('should return 423 when account is locked', async () => {
      mockIsAccountLocked.mockResolvedValue({
        isLocked: true,
        failedAttempts: 5,
        lockoutUntil: Date.now() + 300000,
        lockoutDuration: 300000,
        attemptsRemaining: 0,
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'locked@example.com',
          password: 'ValidPassword123!',
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{ error: string; lockedUntil: number }>(response)

      expect(response.status).toBe(423)
      expect(data.lockedUntil).toBeDefined()
    })

    it('should lock account after too many failed attempts', async () => {
      mockFindUnique.mockResolvedValue(validUser)
      mockCompare.mockResolvedValue(false)
      mockRecordFailedAttempt.mockResolvedValue({
        isLocked: true,
        failedAttempts: 5,
        lockoutUntil: Date.now() + 300000,
        lockoutDuration: 300000,
        attemptsRemaining: 0,
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          email: 'test@example.com',
          password: 'WrongPassword123!',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(423)
    })
  })
})
