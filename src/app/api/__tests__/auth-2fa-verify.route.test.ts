/**
 * @jest-environment node
 */

/**
 * 2FA Verify API Route Tests
 * Tests for /api/auth/2fa/verify endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

jest.mock('@/lib/auth/two-factor', () => ({
  TwoFactorAuthService: {
    verifyAndEnable: jest.fn(),
  },
}))

import { getServerSession } from 'next-auth'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { POST } from '../auth/2fa/verify/route'

const mockGetSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockTwoFactorService = TwoFactorAuthService as jest.Mocked<typeof TwoFactorAuthService>

describe('2FA Verify API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/2fa/verify', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: '123456' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should verify and enable 2FA successfully', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.verifyAndEnable.mockResolvedValue({ verified: true })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: '123456' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.verified).toBe(true)
    })

    it('should return 400 for invalid verification code', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.verifyAndEnable.mockResolvedValue({
        verified: false,
        message: 'Invalid code',
      })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: '000000' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.verified).toBe(false)
    })

    it('should accept backup code format', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.verifyAndEnable.mockResolvedValue({ verified: true })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: 'XXXX-XXXX' },
      })

      const response = await POST(req)

      expect(response.status).toBe(200)
      expect(mockTwoFactorService.verifyAndEnable).toHaveBeenCalledWith('user-123', 'XXXX-XXXX')
    })

    it('should return 400 for token too short', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: '123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid')
    })

    it('should return 400 for token too long', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: '1234567890' },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    it('should return 500 on service error', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.verifyAndEnable.mockRejectedValue(new Error('Service error'))

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/verify',
        body: { token: '123456' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed')
    })
  })
})
