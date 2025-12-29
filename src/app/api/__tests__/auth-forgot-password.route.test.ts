/**
 * @jest-environment node
 */

/**
 * Forgot Password API Route Tests
 * Tests for /api/auth/forgot-password endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      findUnique: jest.fn(),
    },
    password_reset_tokens: {
      deleteMany: jest.fn(),
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

jest.mock('@/lib/email', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/validation', () => ({
  sanitizeInput: jest.fn((input) => input),
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

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-token'),
}))

import { prismaAdmin as prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email'
import { POST } from '../auth/forgot-password/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockRateLimiter = rateLimiters.auth as jest.Mocked<typeof rateLimiters.auth>
const mockSendEmail = sendPasswordResetEmail as jest.MockedFunction<typeof sendPasswordResetEmail>

describe('Forgot Password API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRateLimiter.isAllowed.mockResolvedValue({ allowed: true })
    mockSendEmail.mockResolvedValue(true)
  })

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    full_name: 'Test User',
  }

  describe('POST /api/auth/forgot-password', () => {
    it('should return 429 when rate limited', async () => {
      mockRateLimiter.isAllowed.mockResolvedValue({ allowed: false, retryAfter: 60 })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/forgot-password',
        body: { email: 'user@example.com' },
      })

      const response = await POST(req)

      expect(response.status).toBe(429)
    })

    it('should return success even for non-existent email (prevent enumeration)', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/forgot-password',
        body: { email: 'nonexistent@example.com' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSendEmail).not.toHaveBeenCalled()
    })

    it('should send reset email for existing user', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.password_reset_tokens.deleteMany.mockResolvedValue({ count: 0 })
      mockPrisma.password_reset_tokens.create.mockResolvedValue({} as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/forgot-password',
        body: { email: 'user@example.com' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSendEmail).toHaveBeenCalledWith('user@example.com', 'mock-uuid-token')
    })

    it('should delete existing tokens before creating new one', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.password_reset_tokens.deleteMany.mockResolvedValue({ count: 1 })
      mockPrisma.password_reset_tokens.create.mockResolvedValue({} as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/forgot-password',
        body: { email: 'user@example.com' },
      })

      await POST(req)

      expect(mockPrisma.password_reset_tokens.deleteMany).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
      })
    })

    it('should return 500 when email fails to send', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.password_reset_tokens.deleteMany.mockResolvedValue({ count: 0 })
      mockPrisma.password_reset_tokens.create.mockResolvedValue({} as any)
      mockSendEmail.mockResolvedValue(false)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/forgot-password',
        body: { email: 'user@example.com' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should return 400 for invalid email format', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/forgot-password',
        body: { email: 'invalid-email' },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })
})
