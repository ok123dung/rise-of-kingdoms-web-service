/**
 * @jest-environment node
 */

/**
 * User Profile API Route Tests
 * Tests for /api/user/profile endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth/middleware', () => ({
  getAuthenticatedUser: jest.fn(),
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
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }),
  ErrorMessages: {
    INVALID_INPUT: 'Invalid input',
  },
}))

import { prismaAdmin as prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { GET, PUT } from '../user/profile/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetAuthUser = getAuthenticatedUser as jest.MockedFunction<typeof getAuthenticatedUser>

describe('User Profile API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    full_name: 'Test User',
    phone: '0912345678',
    discord_username: 'testuser#1234',
    rok_player_id: 'ROK123456',
    rok_kingdom: '1001',
    email_verified: true,
    image: null,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-06-01'),
  }

  const mockAuthUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'CUSTOMER',
  }

  describe('GET /api/user/profile', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetAuthUser.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/profile',
      })

      const response = await GET(req)

      expect(response.status).toBe(401)
    })

    it('should return user profile for authenticated user', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/profile',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.id).toBe('user-123')
      expect(data.user.email).toBe('user@example.com')
    })

    it('should return 404 when user not found', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/profile',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
    })

    it('should include all profile fields', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/profile',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(data.user.full_name).toBe('Test User')
      expect(data.user.phone).toBe('0912345678')
      expect(data.user.discord_username).toBe('testuser#1234')
      expect(data.user.rok_player_id).toBe('ROK123456')
      expect(data.user.rok_kingdom).toBe('1001')
      expect(data.user.role).toBe('CUSTOMER')
    })
  })

  describe('PUT /api/user/profile', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetAuthUser.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'PUT',
        url: 'http://localhost:3000/api/user/profile',
        body: { full_name: 'New Name' },
      })

      const response = await PUT(req)

      expect(response.status).toBe(401)
    })

    it('should update user profile successfully', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findFirst.mockResolvedValue(null) // No phone conflict
      mockPrisma.users.update.mockResolvedValue({
        ...mockUser,
        full_name: 'Updated Name',
      } as any)

      const req = createMockRequest({
        method: 'PUT',
        url: 'http://localhost:3000/api/user/profile',
        body: { full_name: 'Updated Name' },
      })

      const response = await PUT(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.full_name).toBe('Updated Name')
    })

    it('should return 409 when phone is already taken', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findFirst.mockResolvedValue({
        id: 'other-user',
        phone: '0987654321',
      } as any)

      const req = createMockRequest({
        method: 'PUT',
        url: 'http://localhost:3000/api/user/profile',
        body: { phone: '0987654321' },
      })

      const response = await PUT(req)
      const data = await getJson(response)

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
    })

    it('should allow updating multiple fields', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findFirst.mockResolvedValue(null)
      mockPrisma.users.update.mockResolvedValue({
        ...mockUser,
        full_name: 'New Name',
        discord_username: 'newuser#5678',
        rok_player_id: 'NEW123',
      } as any)

      const req = createMockRequest({
        method: 'PUT',
        url: 'http://localhost:3000/api/user/profile',
        body: {
          full_name: 'New Name',
          discord_username: 'newuser#5678',
          rok_player_id: 'NEW123',
        },
      })

      const response = await PUT(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            full_name: 'New Name',
            discord_username: 'newuser#5678',
            rok_player_id: 'NEW123',
          }),
        })
      )
    })

    it('should allow setting fields to null', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)
      mockPrisma.users.findFirst.mockResolvedValue(null)
      mockPrisma.users.update.mockResolvedValue({
        ...mockUser,
        phone: null,
      } as any)

      const req = createMockRequest({
        method: 'PUT',
        url: 'http://localhost:3000/api/user/profile',
        body: { phone: null },
      })

      const response = await PUT(req)

      expect(response.status).toBe(200)
    })

    it('should validate phone format', async () => {
      mockGetAuthUser.mockResolvedValue(mockAuthUser as any)

      const req = createMockRequest({
        method: 'PUT',
        url: 'http://localhost:3000/api/user/profile',
        body: { phone: 'invalid-phone' },
      })

      const response = await PUT(req)

      // Should return 400 for validation error
      expect(response.status).toBe(400)
    })
  })
})
