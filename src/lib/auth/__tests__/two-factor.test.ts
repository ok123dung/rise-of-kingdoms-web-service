/**
 * Two-Factor Authentication Tests
 * Tests TOTP setup, verification, backup codes, and status management
 */

import { TwoFactorAuthService } from '../two-factor'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    two_factor_auth: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn()
    },
    users: {
      findUnique: jest.fn()
    }
  }
}))

// Mock speakeasy
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({
    base32: 'JBSWY3DPEHPK3PXP',
    otpauth_url: 'otpauth://totp/RoK%20Services%20(test%40example.com)?secret=JBSWY3DPEHPK3PXP&issuer=rokservices.com'
  })),
  totp: {
    verify: jest.fn()
  }
}))

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,mockQRCode'))
}))

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logSecurityEvent: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

// Import mocked modules
import { prisma } from '@/lib/db'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>
const mockQRCode = QRCode as jest.Mocked<typeof QRCode>

describe('TwoFactorAuthService', () => {
  const testUserId = 'user-123'
  const testEmail = 'test@example.com'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateSecret', () => {
    it('should generate secret, QR code, and backup codes', async () => {
      mockPrisma.two_factor_auth.upsert.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })

      const result = await TwoFactorAuthService.generateSecret(testUserId, testEmail)

      expect(result.secret).toBe('JBSWY3DPEHPK3PXP')
      expect(result.qrCode).toBe('data:image/png;base64,mockQRCode')
      expect(result.backup_codes).toHaveLength(10)
    })

    it('should generate backup codes in correct format', async () => {
      mockPrisma.two_factor_auth.upsert.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })

      const result = await TwoFactorAuthService.generateSecret(testUserId, testEmail)

      // Backup codes should be in XXXX-XXXX format
      result.backup_codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/)
      })
    })

    it('should store secret in database with enabled=false', async () => {
      mockPrisma.two_factor_auth.upsert.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })

      await TwoFactorAuthService.generateSecret(testUserId, testEmail)

      expect(mockPrisma.two_factor_auth.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: testUserId },
          create: expect.objectContaining({
            enabled: false
          }),
          update: expect.objectContaining({
            enabled: false
          })
        })
      )
    })

    it('should log security event on setup', async () => {
      mockPrisma.two_factor_auth.upsert.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })

      await TwoFactorAuthService.generateSecret(testUserId, testEmail)

      expect(mockLogger.logSecurityEvent).toHaveBeenCalledWith('2fa_setup_initiated', {
        user_id: testUserId,
        email: testEmail
      })
    })

    it('should throw error on database failure', async () => {
      mockPrisma.two_factor_auth.upsert.mockRejectedValue(new Error('DB error'))

      await expect(TwoFactorAuthService.generateSecret(testUserId, testEmail))
        .rejects.toThrow('Failed to generate 2FA secret')
    })
  })

  describe('verifyAndEnable', () => {
    it('should enable 2FA when token is valid', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(true)
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      const result = await TwoFactorAuthService.verifyAndEnable(testUserId, '123456')

      expect(result.verified).toBe(true)
      expect(mockPrisma.two_factor_auth.update).toHaveBeenCalledWith({
        where: { user_id: testUserId },
        data: { enabled: true }
      })
    })

    it('should return error if 2FA not setup', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue(null)

      const result = await TwoFactorAuthService.verifyAndEnable(testUserId, '123456')

      expect(result.verified).toBe(false)
      expect(result.message).toBe('2FA not setup for this user')
    })

    it('should return error if 2FA already enabled', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })

      const result = await TwoFactorAuthService.verifyAndEnable(testUserId, '123456')

      expect(result.verified).toBe(false)
      expect(result.message).toBe('2FA already enabled')
    })

    it('should return error for invalid token', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(false)

      const result = await TwoFactorAuthService.verifyAndEnable(testUserId, '000000')

      expect(result.verified).toBe(false)
      expect(result.message).toBe('Invalid verification code')
    })

    it('should log security event on enable', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: false,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(true)
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      await TwoFactorAuthService.verifyAndEnable(testUserId, '123456')

      expect(mockLogger.logSecurityEvent).toHaveBeenCalledWith('2fa_enabled', { user_id: testUserId })
    })
  })

  describe('verifyToken', () => {
    it('should return verified=true if 2FA not enabled', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue(null)

      const result = await TwoFactorAuthService.verifyToken(testUserId, '123456')

      expect(result.verified).toBe(true)
    })

    it('should return verified=true for valid TOTP token', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(true)

      const result = await TwoFactorAuthService.verifyToken(testUserId, '123456')

      expect(result.verified).toBe(true)
    })

    it('should verify with backup code when TOTP fails', async () => {
      const backupCode = 'ABCD-1234'
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [backupCode, 'EFGH-5678'],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(false)
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      const result = await TwoFactorAuthService.verifyToken(testUserId, backupCode)

      expect(result.verified).toBe(true)
      expect(result.message).toBe('Backup code used successfully')
    })

    it('should remove used backup code', async () => {
      const backupCode = 'ABCD-1234'
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [backupCode, 'EFGH-5678'],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(false)
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      await TwoFactorAuthService.verifyToken(testUserId, backupCode)

      expect(mockPrisma.two_factor_auth.update).toHaveBeenCalledWith({
        where: { user_id: testUserId },
        data: {
          backup_codes: ['EFGH-5678'],
          last_used_backup_code: backupCode
        }
      })
    })

    it('should return error for invalid token', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: ['ABCD-1234'],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(false)

      const result = await TwoFactorAuthService.verifyToken(testUserId, 'WRONG-CODE')

      expect(result.verified).toBe(false)
      expect(result.message).toBe('Invalid verification code')
    })

    it('should log security events', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(true)

      await TwoFactorAuthService.verifyToken(testUserId, '123456')

      expect(mockLogger.logSecurityEvent).toHaveBeenCalledWith('2fa_login_success', { user_id: testUserId })
    })

    it('should log failed login attempt', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: [],
        updated_at: new Date(),
        last_used_backup_code: null
      })
      mockSpeakeasy.totp.verify.mockReturnValue(false)

      await TwoFactorAuthService.verifyToken(testUserId, '000000')

      expect(mockLogger.logSecurityEvent).toHaveBeenCalledWith('2fa_login_failed', { user_id: testUserId })
    })
  })

  describe('disable', () => {
    it('should disable 2FA', async () => {
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      const result = await TwoFactorAuthService.disable(testUserId)

      expect(result).toBe(true)
      expect(mockPrisma.two_factor_auth.update).toHaveBeenCalledWith({
        where: { user_id: testUserId },
        data: { enabled: false }
      })
    })

    it('should log security event on disable', async () => {
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      await TwoFactorAuthService.disable(testUserId)

      expect(mockLogger.logSecurityEvent).toHaveBeenCalledWith('2fa_disabled', { user_id: testUserId })
    })

    it('should return false on error', async () => {
      mockPrisma.two_factor_auth.update.mockRejectedValue(new Error('DB error'))

      const result = await TwoFactorAuthService.disable(testUserId)

      expect(result).toBe(false)
    })
  })

  describe('regenerateBackupCodes', () => {
    it('should generate new backup codes', async () => {
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      const codes = await TwoFactorAuthService.regenerateBackupCodes(testUserId)

      expect(codes).toHaveLength(10)
      codes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/)
      })
    })

    it('should update database with new codes', async () => {
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      await TwoFactorAuthService.regenerateBackupCodes(testUserId)

      expect(mockPrisma.two_factor_auth.update).toHaveBeenCalledWith({
        where: { user_id: testUserId },
        data: { backup_codes: expect.any(Array) }
      })
    })

    it('should log security event', async () => {
      mockPrisma.two_factor_auth.update.mockResolvedValue({} as any)

      await TwoFactorAuthService.regenerateBackupCodes(testUserId)

      expect(mockLogger.logSecurityEvent).toHaveBeenCalledWith('2fa_backup_codes_regenerated', { user_id: testUserId })
    })

    it('should throw error on failure', async () => {
      mockPrisma.two_factor_auth.update.mockRejectedValue(new Error('DB error'))

      await expect(TwoFactorAuthService.regenerateBackupCodes(testUserId))
        .rejects.toThrow('Failed to regenerate backup codes')
    })
  })

  describe('isEnabled', () => {
    it('should return true when 2FA enabled', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        enabled: true
      } as any)

      const result = await TwoFactorAuthService.isEnabled(testUserId)

      expect(result).toBe(true)
    })

    it('should return false when 2FA not enabled', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        enabled: false
      } as any)

      const result = await TwoFactorAuthService.isEnabled(testUserId)

      expect(result).toBe(false)
    })

    it('should return false when no 2FA record', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue(null)

      const result = await TwoFactorAuthService.isEnabled(testUserId)

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      mockPrisma.two_factor_auth.findUnique.mockRejectedValue(new Error('DB error'))

      const result = await TwoFactorAuthService.isEnabled(testUserId)

      expect(result).toBe(false)
    })
  })

  describe('getStatus', () => {
    it('should return status with backup codes count', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: ['ABCD-1234', 'EFGH-5678', 'IJKL-9012'],
        updated_at: new Date(),
        last_used_backup_code: null
      })

      const result = await TwoFactorAuthService.getStatus(testUserId)

      expect(result).toEqual({
        enabled: true,
        backup_codesRemaining: 3,
        lastBackupCodeUsed: undefined
      })
    })

    it('should return null when no 2FA record', async () => {
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue(null)

      const result = await TwoFactorAuthService.getStatus(testUserId)

      expect(result).toBeNull()
    })

    it('should include lastBackupCodeUsed when available', async () => {
      const updatedAt = new Date()
      mockPrisma.two_factor_auth.findUnique.mockResolvedValue({
        id: '2fa-123',
        user_id: testUserId,
        secret: 'JBSWY3DPEHPK3PXP',
        enabled: true,
        backup_codes: ['ABCD-1234'],
        updated_at: updatedAt,
        last_used_backup_code: 'USED-CODE'
      })

      const result = await TwoFactorAuthService.getStatus(testUserId)

      expect(result?.lastBackupCodeUsed).toEqual(updatedAt)
    })

    it('should return null on error', async () => {
      mockPrisma.two_factor_auth.findUnique.mockRejectedValue(new Error('DB error'))

      const result = await TwoFactorAuthService.getStatus(testUserId)

      expect(result).toBeNull()
    })
  })
})
