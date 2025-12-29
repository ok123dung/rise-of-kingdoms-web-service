/**
 * @jest-environment node
 */

/**
 * 2FA Setup API Route Tests
 * Tests for /api/auth/2fa/setup endpoint
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
    generateSecret: jest.fn(),
    getStatus: jest.fn(),
  },
}))

import { getServerSession } from 'next-auth'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { GET, POST } from '../auth/2fa/setup/route'

const mockGetSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockTwoFactorService = TwoFactorAuthService as jest.Mocked<typeof TwoFactorAuthService>

describe('2FA Setup API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSetupResult = {
    qrCode: 'data:image/png;base64,mockQRCode',
    secret: 'MOCK_SECRET_KEY',
    backup_codes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'],
  }

  const mockStatus = {
    enabled: false,
    backup_codesRemaining: 5,
  }

  describe('POST /api/auth/2fa/setup', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should generate 2FA secret successfully', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.generateSecret.mockResolvedValue(mockSetupResult)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.qrCode).toBeDefined()
      expect(data.secret).toBeDefined()
      expect(data.backup_codes).toBeDefined()
    })

    it('should call generateSecret with user id and email', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.generateSecret.mockResolvedValue(mockSetupResult)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      await POST(req)

      expect(mockTwoFactorService.generateSecret).toHaveBeenCalledWith(
        'user-123',
        'user@example.com'
      )
    })

    it('should return 500 on service error', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.generateSecret.mockRejectedValue(new Error('Service error'))

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed')
    })
  })

  describe('GET /api/auth/2fa/setup', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 2FA status successfully', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.getStatus.mockResolvedValue(mockStatus)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.status).toBeDefined()
      expect(data.status.enabled).toBe(false)
    })

    it('should return default status when null', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.getStatus.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.status.enabled).toBe(false)
      expect(data.status.backup_codesRemaining).toBe(0)
    })

    it('should return 500 on service error', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockTwoFactorService.getStatus.mockRejectedValue(new Error('Service error'))

      const req = createMockRequest({
        url: 'http://localhost:3000/api/auth/2fa/setup',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed')
    })
  })
})
