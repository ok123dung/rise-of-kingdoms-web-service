/**
 * @jest-environment node
 */

/**
 * 2FA Backup Codes API Route Tests
 * Tests for /api/auth/2fa/backup-codes endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
    },
  },
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
    isEnabled: jest.fn(),
    regenerateBackupCodes: jest.fn(),
  },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import bcrypt from 'bcryptjs'
import { POST } from '../auth/2fa/backup-codes/route'

const mockGetSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockTwoFactorService = TwoFactorAuthService as jest.Mocked<typeof TwoFactorAuthService>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('2FA Backup Codes API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    password: '$2a$14$hashedpassword',
  }

  const mockBackupCodes = ['CODE1-XXXX', 'CODE2-XXXX', 'CODE3-XXXX', 'CODE4-XXXX', 'CODE5-XXXX']

  describe('POST /api/auth/2fa/backup-codes', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: { password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 when user not found', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: { password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(404)
      expect(data.error).toContain('not found')
    })

    it('should return 401 for invalid password', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(false as never)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: { password: 'wrongpassword' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toContain('Invalid password')
    })

    it('should return 400 when 2FA is not enabled', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(true as never)
      mockTwoFactorService.isEnabled.mockResolvedValue(false)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: { password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toContain('not enabled')
    })

    it('should regenerate backup codes successfully', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(true as never)
      mockTwoFactorService.isEnabled.mockResolvedValue(true)
      mockTwoFactorService.regenerateBackupCodes.mockResolvedValue(mockBackupCodes)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: { password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.backup_codes).toEqual(mockBackupCodes)
    })

    it('should return 400 for missing password', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: {},
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid')
    })

    it('should return 500 on service error', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(true as never)
      mockTwoFactorService.isEnabled.mockResolvedValue(true)
      mockTwoFactorService.regenerateBackupCodes.mockRejectedValue(new Error('Service error'))

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/2fa/backup-codes',
        body: { password: 'password123' },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed')
    })
  })
})
