/**
 * Admin Middleware Tests
 * Tests role-based authentication, permissions, rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import {
  withAdminAuth,
  withSuperAdminAuth,
  withCustomerAuth,
  hasPermission,
  protectApiRoute,
  checkAdminRateLimit,
  ADMIN_PERMISSIONS
} from '../admin'

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}))

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}))

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>

// Helper to create mock NextRequest
function createMockRequest(overrides: Partial<NextRequest> = {}): NextRequest {
  return {
    method: 'GET',
    url: 'http://localhost:3000/api/admin/test',
    headers: new Headers({
      'x-forwarded-for': '127.0.0.1',
      'user-agent': 'jest-test'
    }),
    ...overrides
  } as unknown as NextRequest
}

describe('Admin Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('withAdminAuth', () => {
    it('should return 401 when no token', async () => {
      mockGetToken.mockResolvedValue(null)
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withAdminAuth(request, handler)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should return 403 when user is not admin', async () => {
      mockGetToken.mockResolvedValue({
        user_id: 'user-1',
        email: 'user@example.com',
        role: 'customer'
      })
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withAdminAuth(request, handler)

      expect(response.status).toBe(403)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should call handler for admin user', async () => {
      const adminToken = {
        user_id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin'
      }
      mockGetToken.mockResolvedValue(adminToken)
      const request = createMockRequest()
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )

      const response = await withAdminAuth(request, handler)

      expect(handler).toHaveBeenCalledWith(request, adminToken)
      expect(response.status).toBe(200)
    })

    it('should call handler for superadmin user', async () => {
      const superadminToken = {
        user_id: 'superadmin-1',
        email: 'superadmin@example.com',
        role: 'superadmin'
      }
      mockGetToken.mockResolvedValue(superadminToken)
      const request = createMockRequest()
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )

      await withAdminAuth(request, handler)

      expect(handler).toHaveBeenCalledWith(request, superadminToken)
    })

    it('should return 500 on error', async () => {
      mockGetToken.mockRejectedValue(new Error('Token error'))
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withAdminAuth(request, handler)

      expect(response.status).toBe(500)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('withSuperAdminAuth', () => {
    it('should return 401 when no token', async () => {
      mockGetToken.mockResolvedValue(null)
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withSuperAdminAuth(request, handler)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should return 403 for regular admin', async () => {
      mockGetToken.mockResolvedValue({
        user_id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin'
      })
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withSuperAdminAuth(request, handler)

      expect(response.status).toBe(403)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should call handler for superadmin', async () => {
      const superadminToken = {
        user_id: 'superadmin-1',
        email: 'superadmin@example.com',
        role: 'superadmin'
      }
      mockGetToken.mockResolvedValue(superadminToken)
      const request = createMockRequest()
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )

      await withSuperAdminAuth(request, handler)

      expect(handler).toHaveBeenCalledWith(request, superadminToken)
    })
  })

  describe('withCustomerAuth', () => {
    it('should return 401 when no token', async () => {
      mockGetToken.mockResolvedValue(null)
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withCustomerAuth(request, handler)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should call handler for customer', async () => {
      const customerToken = {
        user_id: 'customer-1',
        email: 'customer@example.com',
        role: 'customer'
      }
      mockGetToken.mockResolvedValue(customerToken)
      const request = createMockRequest()
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )

      await withCustomerAuth(request, handler)

      expect(handler).toHaveBeenCalledWith(request, customerToken)
    })

    it('should call handler for admin', async () => {
      const adminToken = {
        user_id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin'
      }
      mockGetToken.mockResolvedValue(adminToken)
      const request = createMockRequest()
      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )

      await withCustomerAuth(request, handler)

      expect(handler).toHaveBeenCalled()
    })

    it('should reject unknown roles', async () => {
      mockGetToken.mockResolvedValue({
        user_id: 'unknown-1',
        email: 'unknown@example.com',
        role: 'unknown'
      })
      const request = createMockRequest()
      const handler = jest.fn()

      const response = await withCustomerAuth(request, handler)

      expect(response.status).toBe(403)
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('hasPermission', () => {
    it('should allow superadmin access to everything', () => {
      expect(hasPermission('superadmin', ['customer'])).toBe(true)
      expect(hasPermission('superadmin', ['admin'])).toBe(true)
      expect(hasPermission('superadmin', ['superadmin'])).toBe(true)
    })

    it('should allow admin access except superadmin-only', () => {
      expect(hasPermission('admin', ['customer'])).toBe(true)
      expect(hasPermission('admin', ['admin'])).toBe(true)
      expect(hasPermission('admin', ['superadmin'])).toBe(false)
    })

    it('should check specific role for customer', () => {
      expect(hasPermission('customer', ['customer'])).toBe(true)
      expect(hasPermission('customer', ['admin'])).toBe(false)
      expect(hasPermission('customer', ['superadmin'])).toBe(false)
    })

    it('should deny access for unknown roles', () => {
      expect(hasPermission('unknown', ['customer'])).toBe(false)
    })
  })

  describe('protectApiRoute', () => {
    it('should wrap handler with customer auth by default', async () => {
      const customerToken = {
        user_id: 'customer-1',
        email: 'customer@example.com',
        role: 'customer'
      }
      mockGetToken.mockResolvedValue(customerToken)
      const request = createMockRequest()

      const handler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      )
      const protectedHandler = protectApiRoute()(handler)

      await protectedHandler(request)

      expect(handler).toHaveBeenCalled()
    })

    it('should wrap handler with admin auth when specified', async () => {
      mockGetToken.mockResolvedValue({
        user_id: 'customer-1',
        email: 'customer@example.com',
        role: 'customer'
      })
      const request = createMockRequest()
      const handler = jest.fn()

      const protectedHandler = protectApiRoute('admin')(handler)
      const response = await protectedHandler(request)

      expect(response.status).toBe(403)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should add user to request', async () => {
      const adminToken = {
        user_id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin'
      }
      mockGetToken.mockResolvedValue(adminToken)
      const request = createMockRequest()

      const handler = jest.fn().mockImplementation((req) => {
        expect(req.user).toEqual(adminToken)
        return NextResponse.json({ success: true })
      })
      const protectedHandler = protectApiRoute('admin')(handler)

      await protectedHandler(request)

      expect(handler).toHaveBeenCalled()
    })
  })

  describe('checkAdminRateLimit', () => {
    it('should allow first request', () => {
      const result = checkAdminRateLimit('admin-1', 'test-action')
      expect(result).toBe(true)
    })

    it('should allow requests within limit', () => {
      const adminId = 'admin-rate-test'
      const action = 'test-action-2'

      for (let i = 0; i < 50; i++) {
        expect(checkAdminRateLimit(adminId, action, 100)).toBe(true)
      }
    })

    it('should block requests exceeding limit', () => {
      const adminId = 'admin-exceed-test'
      const action = 'test-action-3'
      const maxRequests = 5

      // Make requests up to limit
      for (let i = 0; i < maxRequests; i++) {
        checkAdminRateLimit(adminId, action, maxRequests)
      }

      // Next request should be blocked
      expect(checkAdminRateLimit(adminId, action, maxRequests)).toBe(false)
    })

    it('should track different actions separately', () => {
      const adminId = 'admin-multi-action'
      const maxRequests = 2

      // Fill up action1
      checkAdminRateLimit(adminId, 'action1', maxRequests)
      checkAdminRateLimit(adminId, 'action1', maxRequests)
      expect(checkAdminRateLimit(adminId, 'action1', maxRequests)).toBe(false)

      // action2 should still work
      expect(checkAdminRateLimit(adminId, 'action2', maxRequests)).toBe(true)
    })

    it('should track different admins separately', () => {
      const action = 'shared-action'
      const maxRequests = 2

      // Fill up admin1
      checkAdminRateLimit('admin-A', action, maxRequests)
      checkAdminRateLimit('admin-A', action, maxRequests)
      expect(checkAdminRateLimit('admin-A', action, maxRequests)).toBe(false)

      // admin2 should still work
      expect(checkAdminRateLimit('admin-B', action, maxRequests)).toBe(true)
    })
  })

  describe('ADMIN_PERMISSIONS', () => {
    it('should define correct read user permissions', () => {
      expect(ADMIN_PERMISSIONS.READ_USERS).toContain('admin')
      expect(ADMIN_PERMISSIONS.READ_USERS).toContain('superadmin')
    })

    it('should restrict delete to superadmin', () => {
      expect(ADMIN_PERMISSIONS.DELETE_USERS).toEqual(['superadmin'])
      expect(ADMIN_PERMISSIONS.DELETE_BOOKINGS).toEqual(['superadmin'])
    })

    it('should restrict system settings to superadmin', () => {
      expect(ADMIN_PERMISSIONS.SYSTEM_SETTINGS).toEqual(['superadmin'])
    })
  })
})
