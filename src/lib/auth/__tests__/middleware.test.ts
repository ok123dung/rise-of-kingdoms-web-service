/**
 * Auth Middleware Tests
 * Tests for JWT authentication and role-based authorization middleware
 */

import { NextRequest, NextResponse } from 'next/server'

import {
  getAuthenticatedUser,
  withAuth,
  withRole,
  type AuthenticatedUser
} from '../middleware'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prismaAdmin: {
    users: {
      findUnique: jest.fn()
    }
  }
}))

jest.mock('../jwt', () => ({
  verifyToken: jest.fn()
}))

import { prismaAdmin } from '@/lib/db'
import { verifyToken } from '../jwt'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'

const mockPrismaUsers = prismaAdmin.users as jest.Mocked<typeof prismaAdmin.users>
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>

// Helper to create mock NextRequest
function createMockRequest(options: {
  authorization?: string
} = {}): NextRequest {
  const headers = new Headers()
  if (options.authorization) {
    headers.set('authorization', options.authorization)
  }

  return {
    headers,
    url: 'http://localhost:3000/api/test',
    method: 'GET'
  } as unknown as NextRequest
}

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuthenticatedUser', () => {
    it('should return null when no authorization header', async () => {
      const request = createMockRequest()

      const result = await getAuthenticatedUser(request)

      expect(result).toBeNull()
      expect(mockVerifyToken).not.toHaveBeenCalled()
    })

    it('should return null when authorization header is not Bearer', async () => {
      const request = createMockRequest({
        authorization: 'Basic dXNlcjpwYXNz'
      })

      const result = await getAuthenticatedUser(request)

      expect(result).toBeNull()
      expect(mockVerifyToken).not.toHaveBeenCalled()
    })

    it('should return null when token is invalid', async () => {
      mockVerifyToken.mockReturnValue(null)
      const request = createMockRequest({
        authorization: 'Bearer invalid-token'
      })

      const result = await getAuthenticatedUser(request)

      expect(result).toBeNull()
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token')
    })

    it('should return null when user not found in database', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'customer'
      })
      mockPrismaUsers.findUnique.mockResolvedValue(null)

      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const result = await getAuthenticatedUser(request)

      expect(result).toBeNull()
      expect(mockPrismaUsers.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          full_name: true
        }
      })
    })

    it('should return user data when token is valid and user exists', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'admin'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User'
      } as any)

      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const result = await getAuthenticatedUser(request)

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'admin'
      })
    })

    it('should default role to customer when not in token', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com'
        // role not provided
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: null
      } as any)

      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const result = await getAuthenticatedUser(request)

      expect(result?.role).toBe('customer')
    })

    it('should handle null full_name', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'customer'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: null
      } as any)

      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const result = await getAuthenticatedUser(request)

      expect(result?.full_name).toBeNull()
    })
  })

  describe('withAuth', () => {
    it('should throw AuthenticationError when not authenticated', async () => {
      const handler = jest.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest()

      await expect(wrappedHandler(request)).rejects.toThrow(AuthenticationError)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should throw AuthenticationError with Vietnamese message', async () => {
      const handler = jest.fn()
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest()

      try {
        await wrappedHandler(request)
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError)
        expect((error as Error).message).toBe('Bạn cần đăng nhập để thực hiện thao tác này')
      }
    })

    it('should call handler with user attached when authenticated', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'customer'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User'
      } as any)

      const mockResponse = NextResponse.json({ success: true })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const response = await wrappedHandler(request)

      expect(handler).toHaveBeenCalled()
      const calledRequest = handler.mock.calls[0][0]
      expect(calledRequest.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'customer'
      })
      expect(response).toBe(mockResponse)
    })

    it('should pass through handler response', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'admin'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Admin User'
      } as any)

      const mockResponse = NextResponse.json({ data: 'test' }, { status: 201 })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withAuth(handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const response = await wrappedHandler(request)

      expect(response).toBe(mockResponse)
    })
  })

  describe('withRole', () => {
    beforeEach(() => {
      // Setup valid auth for role tests
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        email: 'test@example.com',
        role: 'customer'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User'
      } as any)
    })

    it('should throw AuthenticationError when not authenticated', async () => {
      mockVerifyToken.mockReturnValue(null)
      const handler = jest.fn()
      const wrappedHandler = withRole(['admin'], handler)
      const request = createMockRequest({
        authorization: 'Bearer invalid-token'
      })

      await expect(wrappedHandler(request)).rejects.toThrow(AuthenticationError)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should throw AuthorizationError when role not allowed', async () => {
      const handler = jest.fn()
      const wrappedHandler = withRole(['admin', 'superadmin'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      await expect(wrappedHandler(request)).rejects.toThrow(AuthorizationError)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should throw AuthorizationError with Vietnamese message', async () => {
      const handler = jest.fn()
      const wrappedHandler = withRole(['admin'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      try {
        await wrappedHandler(request)
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError)
        expect((error as Error).message).toBe('Bạn không có quyền thực hiện thao tác này')
      }
    })

    it('should call handler when role is allowed', async () => {
      const mockResponse = NextResponse.json({ success: true })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withRole(['customer', 'admin'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const response = await wrappedHandler(request)

      expect(handler).toHaveBeenCalled()
      expect(response).toBe(mockResponse)
    })

    it('should allow admin role when in allowed list', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'admin-123',
        email: 'admin@example.com',
        role: 'admin'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        full_name: 'Admin'
      } as any)

      const mockResponse = NextResponse.json({ success: true })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withRole(['admin'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const response = await wrappedHandler(request)

      expect(handler).toHaveBeenCalled()
      const calledRequest = handler.mock.calls[0][0]
      expect(calledRequest.user.role).toBe('admin')
    })

    it('should allow superadmin role when in allowed list', async () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'super-123',
        email: 'super@example.com',
        role: 'superadmin'
      })
      mockPrismaUsers.findUnique.mockResolvedValue({
        id: 'super-123',
        email: 'super@example.com',
        full_name: 'Super Admin'
      } as any)

      const mockResponse = NextResponse.json({ success: true })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withRole(['superadmin'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const response = await wrappedHandler(request)

      expect(handler).toHaveBeenCalled()
    })

    it('should attach user to request when role is allowed', async () => {
      const mockResponse = NextResponse.json({ success: true })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withRole(['customer'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      await wrappedHandler(request)

      const calledRequest = handler.mock.calls[0][0]
      expect(calledRequest.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'customer'
      })
    })

    it('should work with multiple allowed roles', async () => {
      const mockResponse = NextResponse.json({ success: true })
      const handler = jest.fn().mockResolvedValue(mockResponse)
      const wrappedHandler = withRole(['admin', 'superadmin', 'customer'], handler)
      const request = createMockRequest({
        authorization: 'Bearer valid-token'
      })

      const response = await wrappedHandler(request)

      expect(handler).toHaveBeenCalled()
      expect(response).toBe(mockResponse)
    })
  })
})
