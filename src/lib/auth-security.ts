import { randomBytes, createHash } from 'crypto'

import { getLogger } from '@/lib/monitoring/logger'

// Account lockout configuration
interface AccountLockoutConfig {
  maxAttempts: number
  lockoutDuration: number // milliseconds
  resetWindow: number // milliseconds
}

const DEFAULT_LOCKOUT_CONFIG: AccountLockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  resetWindow: 15 * 60 * 1000 // 15 minutes
}

// Failed login attempts tracking
interface FailedAttempt {
  count: number
  firstAttempt: number
  lastAttempt: number
  lockedUntil?: number
}

// In-memory store for failed attempts (use Redis in production)
const failedAttempts = new Map<string, FailedAttempt>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of failedAttempts.entries()) {
    if (attempt.lockedUntil && attempt.lockedUntil < now) {
      // Unlock expired locks
      delete attempt.lockedUntil
    }
    if (now - attempt.lastAttempt > DEFAULT_LOCKOUT_CONFIG.resetWindow) {
      // Remove old entries
      failedAttempts.delete(key)
    }
  }
}, 60000) // Clean every minute

// Account lockout management
export class AccountLockoutManager {
  constructor(private config: AccountLockoutConfig = DEFAULT_LOCKOUT_CONFIG) {}

  async recordFailedAttempt(
    identifier: string,
    metadata?: Record<string, any>
  ): Promise<{
    isLocked: boolean
    remainingAttempts: number
    lockedUntil?: Date
  }> {
    const now = Date.now()
    let attempt = failedAttempts.get(identifier)

    if (!attempt) {
      attempt = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      }
    } else {
      // Reset if outside reset window
      if (now - attempt.firstAttempt > this.config.resetWindow) {
        attempt = {
          count: 1,
          firstAttempt: now,
          lastAttempt: now
        }
      } else {
        attempt.count++
        attempt.lastAttempt = now
      }
    }

    // Check if should lock
    if (attempt.count >= this.config.maxAttempts) {
      attempt.lockedUntil = now + this.config.lockoutDuration

      // Log security event
      getLogger().logSecurityEvent('account_locked', {
        identifier,
        attempts: attempt.count,
        lockedUntil: new Date(attempt.lockedUntil).toISOString(),
        ...metadata
      })
    }

    failedAttempts.set(identifier, attempt)

    return {
      isLocked: !!attempt.lockedUntil && attempt.lockedUntil > now,
      remainingAttempts: Math.max(0, this.config.maxAttempts - attempt.count),
      lockedUntil: attempt.lockedUntil ? new Date(attempt.lockedUntil) : undefined
    }
  }

  async checkLockout(identifier: string): Promise<{
    isLocked: boolean
    lockedUntil?: Date
    message?: string
  }> {
    const attempt = failedAttempts.get(identifier)
    if (!attempt) {
      return { isLocked: false }
    }

    const now = Date.now()
    const isLocked = !!attempt.lockedUntil && attempt.lockedUntil > now

    if (isLocked) {
      const remainingTime = Math.ceil((attempt.lockedUntil! - now) / 1000 / 60) // minutes
      return {
        isLocked: true,
        lockedUntil: new Date(attempt.lockedUntil!),
        message: `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`
      }
    }

    return { isLocked: false }
  }

  async clearFailedAttempts(identifier: string): Promise<void> {
    failedAttempts.delete(identifier)
  }

  async unlockAccount(identifier: string): Promise<void> {
    const attempt = failedAttempts.get(identifier)
    if (attempt) {
      delete attempt.lockedUntil
      failedAttempts.set(identifier, attempt)
    }

    getLogger().logSecurityEvent('account_unlocked_manually', {
      identifier,
      unlockedBy: 'admin'
    })
  }
}

// Session token rotation
export class SessionTokenManager {
  private static readonly TOKEN_LENGTH = 32
  private static readonly ROTATION_INTERVAL = 60 * 60 * 1000 // 1 hour

  static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  static generateSessionId(userId: string, timestamp: number = Date.now()): string {
    const data = `${userId}:${timestamp}:${randomBytes(16).toString('hex')}`
    return createHash('sha256').update(data).digest('hex')
  }

  static shouldRotate(tokenIssuedAt: number): boolean {
    return Date.now() - tokenIssuedAt > this.ROTATION_INTERVAL
  }

  static async rotateToken(
    oldToken: string,
    userId: string
  ): Promise<{
    token: string
    sessionId: string
    expiresAt: Date
  }> {
    const newToken = this.generateToken()
    const sessionId = this.generateSessionId(userId)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Log rotation event
    getLogger().logSecurityEvent('session_token_rotated', {
      userId,
      oldSessionId: createHash('sha256').update(oldToken).digest('hex').substring(0, 8),
      newSessionId: sessionId.substring(0, 8)
    })

    return {
      token: newToken,
      sessionId,
      expiresAt
    }
  }
}

// Enhanced CSRF protection
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

  static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  static validateToken(token: string | null, sessionToken: string | null): boolean {
    if (!token || !sessionToken) return false

    // In production, tokens should be stored in secure httpOnly cookies
    // and validated against session
    return token === sessionToken && token.length === this.TOKEN_LENGTH * 2
  }

  static createTokenPair(): {
    fieldToken: string
    cookieToken: string
  } {
    const baseToken = this.generateToken()
    return {
      fieldToken: baseToken,
      cookieToken: createHash('sha256').update(baseToken).digest('hex')
    }
  }
}

// Device fingerprinting for enhanced security
export class DeviceFingerprint {
  static generate(headers: Headers): string {
    const components = [
      headers.get('user-agent') || '',
      headers.get('accept-language') || '',
      headers.get('accept-encoding') || '',
      headers.get('sec-ch-ua') || '',
      headers.get('sec-ch-ua-platform') || ''
    ]

    return createHash('sha256').update(components.join('|')).digest('hex').substring(0, 16)
  }

  static validate(fingerprint: string, headers: Headers): boolean {
    const currentFingerprint = this.generate(headers)
    return fingerprint === currentFingerprint
  }
}

// Export singleton instances
export const accountLockout = new AccountLockoutManager()
export const sessionTokenManager = SessionTokenManager
export const csrfProtection = CSRFProtection
export const deviceFingerprint = DeviceFingerprint
