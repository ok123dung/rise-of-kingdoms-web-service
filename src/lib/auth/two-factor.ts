import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const APP_NAME = process.env.TWO_FACTOR_APP_NAME || 'RoK Services'
const ISSUER = process.env.TWO_FACTOR_ISSUER || 'rokservices.com'
const BACKUP_CODES_COUNT = 10

interface TwoFactorSetupResult {
  secret: string
  qrCode: string
  backupCodes: string[]
}

interface VerificationResult {
  verified: boolean
  message?: string
}

export class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret and QR code for setup
   */
  static async generateSecret(userId: string, userEmail: string): Promise<TwoFactorSetupResult> {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${APP_NAME} (${userEmail})`,
        issuer: ISSUER,
        length: 32
      })

      // Generate backup codes
      const backupCodes = this.generateBackupCodes()

      // Store secret in database (not enabled yet)
      await prisma.twoFactorAuth.upsert({
        where: { userId },
        create: {
          userId,
          secret: secret.base32,
          enabled: false,
          backupCodes
        },
        update: {
          secret: secret.base32,
          enabled: false,
          backupCodes
        }
      })

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

      getLogger().logSecurityEvent('2fa_setup_initiated', {
        userId,
        email: userEmail
      })

      return {
        secret: secret.base32,
        qrCode,
        backupCodes
      }
    } catch (error) {
      getLogger().error('2FA setup error', error as Error)
      throw new Error('Failed to generate 2FA secret')
    }
  }

  /**
   * Verify a TOTP token during setup
   */
  static async verifyAndEnable(userId: string, token: string): Promise<VerificationResult> {
    try {
      const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
        where: { userId }
      })

      if (!twoFactorAuth) {
        return { verified: false, message: '2FA not setup for this user' }
      }

      if (twoFactorAuth.enabled) {
        return { verified: false, message: '2FA already enabled' }
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: twoFactorAuth.secret,
        encoding: 'base32',
        token,
        window: 2 // Allow 2 time steps tolerance
      })

      if (verified) {
        // Enable 2FA
        await prisma.twoFactorAuth.update({
          where: { userId },
          data: { enabled: true }
        })

        getLogger().logSecurityEvent('2fa_enabled', { userId })

        return { verified: true }
      }

      return { verified: false, message: 'Invalid verification code' }
    } catch (error) {
      getLogger().error('2FA verification error', error as Error)
      return { verified: false, message: 'Verification failed' }
    }
  }

  /**
   * Verify a TOTP token during login
   */
  static async verifyToken(userId: string, token: string): Promise<VerificationResult> {
    try {
      const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
        where: { userId }
      })

      if (!twoFactorAuth || !twoFactorAuth.enabled) {
        return { verified: true } // 2FA not enabled, allow login
      }

      // Try TOTP verification first
      const verified = speakeasy.totp.verify({
        secret: twoFactorAuth.secret,
        encoding: 'base32',
        token,
        window: 2
      })

      if (verified) {
        getLogger().logSecurityEvent('2fa_login_success', { userId })
        return { verified: true }
      }

      // Try backup code if TOTP fails
      if (twoFactorAuth.backupCodes.includes(token)) {
        // Remove used backup code
        const updatedCodes = twoFactorAuth.backupCodes.filter(code => code !== token)
        
        await prisma.twoFactorAuth.update({
          where: { userId },
          data: {
            backupCodes: updatedCodes,
            lastUsedBackupCode: token
          }
        })

        getLogger().logSecurityEvent('2fa_backup_code_used', {
          userId,
          remainingCodes: updatedCodes.length
        })

        return { verified: true, message: 'Backup code used successfully' }
      }

      getLogger().logSecurityEvent('2fa_login_failed', { userId })
      return { verified: false, message: 'Invalid verification code' }
    } catch (error) {
      getLogger().error('2FA token verification error', error as Error)
      return { verified: false, message: 'Verification failed' }
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disable(userId: string, password?: string): Promise<boolean> {
    try {
      // Optional: Verify password before disabling
      if (password) {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return false
        
        // Password verification would go here
        // const isValid = await bcrypt.compare(password, user.password)
        // if (!isValid) return false
      }

      await prisma.twoFactorAuth.update({
        where: { userId },
        data: { enabled: false }
      })

      getLogger().logSecurityEvent('2fa_disabled', { userId })
      return true
    } catch (error) {
      getLogger().error('2FA disable error', error as Error)
      return false
    }
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const backupCodes = this.generateBackupCodes()

      await prisma.twoFactorAuth.update({
        where: { userId },
        data: { backupCodes }
      })

      getLogger().logSecurityEvent('2fa_backup_codes_regenerated', { userId })
      return backupCodes
    } catch (error) {
      getLogger().error('Backup code regeneration error', error as Error)
      throw new Error('Failed to regenerate backup codes')
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isEnabled(userId: string): Promise<boolean> {
    try {
      const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
        where: { userId },
        select: { enabled: true }
      })

      return twoFactorAuth?.enabled || false
    } catch (error) {
      getLogger().error('2FA status check error', error as Error)
      return false
    }
  }

  /**
   * Generate random backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = []
    
    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase()
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
    }

    return codes
  }

  /**
   * Get 2FA status and remaining backup codes for a user
   */
  static async getStatus(userId: string): Promise<{
    enabled: boolean
    backupCodesRemaining: number
    lastBackupCodeUsed?: Date
  } | null> {
    try {
      const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
        where: { userId }
      })

      if (!twoFactorAuth) return null

      return {
        enabled: twoFactorAuth.enabled,
        backupCodesRemaining: twoFactorAuth.backupCodes.length,
        lastBackupCodeUsed: twoFactorAuth.lastUsedBackupCode 
          ? twoFactorAuth.updatedAt 
          : undefined
      }
    } catch (error) {
      getLogger().error('2FA status retrieval error', error as Error)
      return null
    }
  }
}