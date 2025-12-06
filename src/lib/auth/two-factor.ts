import { randomBytes } from 'crypto'

import QRCode from 'qrcode'
import speakeasy from 'speakeasy'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

const APP_NAME = process.env.TWO_FACTOR_APP_NAME || 'RoK Services'
const ISSUER = process.env.TWO_FACTOR_ISSUER || 'rokservices.com'
const BACKUP_CODES_COUNT = 10

interface TwoFactorSetupResult {
  secret: string
  qrCode: string
  backup_codes: string[]
}

interface VerificationResult {
  verified: boolean
  message?: string
}

export class TwoFactorAuthService {
  /**
   * Generate a new 2FA secret and QR code for setup
   */
  static async generateSecret(user_id: string, userEmail: string): Promise<TwoFactorSetupResult> {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `${APP_NAME} (${userEmail})`,
        issuer: ISSUER,
        length: 32
      })

      // Generate backup codes
      const backup_codes = this.generateBackupCodes()

      // Store secret in database (not enabled yet)
      await prisma.two_factor_auth.upsert({
        where: { user_id },
        create: {
          id: crypto.randomUUID(),
          user_id,
          secret: secret.base32,
          enabled: false,
          backup_codes,
          updated_at: new Date()
        },
        update: {
          secret: secret.base32,
          enabled: false,
          backup_codes
        }
      })

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

      getLogger().logSecurityEvent('2fa_setup_initiated', {
        user_id,
        email: userEmail
      })

      return {
        secret: secret.base32,
        qrCode,
        backup_codes
      }
    } catch (error) {
      getLogger().error('2FA setup error', error as Error)
      throw new Error('Failed to generate 2FA secret')
    }
  }

  /**
   * Verify a TOTP token during setup
   */
  static async verifyAndEnable(user_id: string, token: string): Promise<VerificationResult> {
    try {
      const twoFactorAuth = await prisma.two_factor_auth.findUnique({
        where: { user_id }
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
        await prisma.two_factor_auth.update({
          where: { user_id },
          data: { enabled: true }
        })

        getLogger().logSecurityEvent('2fa_enabled', { user_id })

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
  static async verifyToken(user_id: string, token: string): Promise<VerificationResult> {
    try {
      const twoFactorAuth = await prisma.two_factor_auth.findUnique({
        where: { user_id }
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
        getLogger().logSecurityEvent('2fa_login_success', { user_id })
        return { verified: true }
      }

      // Try backup code if TOTP fails
      if (twoFactorAuth.backup_codes.includes(token)) {
        // Remove used backup code
        const updatedCodes = twoFactorAuth.backup_codes.filter(code => code !== token)

        await prisma.two_factor_auth.update({
          where: { user_id },
          data: {
            backup_codes: updatedCodes,
            last_used_backup_code: token
          }
        })

        getLogger().logSecurityEvent('2fa_backup_code_used', {
          user_id,
          remainingCodes: updatedCodes.length
        })

        return { verified: true, message: 'Backup code used successfully' }
      }

      getLogger().logSecurityEvent('2fa_login_failed', { user_id })
      return { verified: false, message: 'Invalid verification code' }
    } catch (error) {
      getLogger().error('2FA token verification error', error as Error)
      return { verified: false, message: 'Verification failed' }
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disable(user_id: string, password?: string): Promise<boolean> {
    try {
      // Optional: Verify password before disabling
      if (password) {
        const user = await prisma.users.findUnique({ where: { id: user_id } })
        if (!user) return false

        // Password verification would go here
        // const isValid = await bcrypt.compare(password, user.password)
        // if (!isValid) return false
      }

      await prisma.two_factor_auth.update({
        where: { user_id },
        data: { enabled: false }
      })

      getLogger().logSecurityEvent('2fa_disabled', { user_id })
      return true
    } catch (error) {
      getLogger().error('2FA disable error', error as Error)
      return false
    }
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(user_id: string): Promise<string[]> {
    try {
      const backup_codes = this.generateBackupCodes()

      await prisma.two_factor_auth.update({
        where: { user_id },
        data: { backup_codes }
      })

      getLogger().logSecurityEvent('2fa_backup_codes_regenerated', { user_id })
      return backup_codes
    } catch (error) {
      getLogger().error('Backup code regeneration error', error as Error)
      throw new Error('Failed to regenerate backup codes')
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isEnabled(user_id: string): Promise<boolean> {
    try {
      const twoFactorAuth = await prisma.two_factor_auth.findUnique({
        where: { user_id },
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
  static async getStatus(user_id: string): Promise<{
    enabled: boolean
    backup_codesRemaining: number
    lastBackupCodeUsed?: Date
  } | null> {
    try {
      const twoFactorAuth = await prisma.two_factor_auth.findUnique({
        where: { user_id }
      })

      if (!twoFactorAuth) return null

      return {
        enabled: twoFactorAuth.enabled,
        backup_codesRemaining: twoFactorAuth.backup_codes.length,
        lastBackupCodeUsed: twoFactorAuth.last_used_backup_code ? twoFactorAuth.updated_at : undefined
      }
    } catch (error) {
      getLogger().error('2FA status retrieval error', error as Error)
      return null
    }
  }
}
