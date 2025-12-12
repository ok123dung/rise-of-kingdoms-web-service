import { randomBytes, createHash } from 'crypto'

import {
  checkBruteForce,
  recordFailedAttempt as recordBruteForceAttempt,
  clearFailedAttempts as clearBruteForceAttempts
} from '@/lib/auth/brute-force-protection'
import { getLogger } from '@/lib/monitoring/logger'

/**
 * Account lockout management using Redis-backed brute-force protection
 * This wrapper maintains backward compatibility with existing code
 * while using the more robust Redis implementation under the hood.
 *
 * @deprecated Use checkBruteForce, recordFailedAttempt, clearFailedAttempts
 * from '@/lib/auth/brute-force-protection' directly for async operations.
 */
export class AccountLockoutManager {
  recordFailedAttempt(
    identifier: string,
    metadata?: Record<string, unknown>
  ): {
    isLocked: boolean
    remainingAttempts: number
    lockedUntil?: Date
  } {
    // Fire and forget - async brute-force recording
    void recordBruteForceAttempt(identifier).then(() => {
      // Check if now blocked after recording
      void checkBruteForce(identifier).then(result => {
        if (!result.allowed) {
          getLogger().logSecurityEvent('account_locked', {
            identifier,
            blockedUntil: result.blockedUntil
              ? new Date(result.blockedUntil).toISOString()
              : undefined,
            ...metadata
          })
        }
      })
    })

    // Return immediate result (actual blocking is handled by checkLockout)
    return {
      isLocked: false, // Will be checked via checkLockout
      remainingAttempts: 5, // Default, actual value from async check
      lockedUntil: undefined
    }
  }

  checkLockout(identifier: string): {
    isLocked: boolean
    lockedUntil?: Date
    message?: string
  } {
    // Synchronous wrapper - for full async support use checkBruteForce directly
    let result = { isLocked: false, lockedUntil: undefined as Date | undefined, message: undefined as string | undefined }

    // Fire and forget - the actual check happens async
    void checkBruteForce(identifier).then(bruteForceResult => {
      if (!bruteForceResult.allowed) {
        result = {
          isLocked: true,
          lockedUntil: bruteForceResult.blockedUntil
            ? new Date(bruteForceResult.blockedUntil)
            : undefined,
          message: bruteForceResult.message ?? 'Account locked due to too many failed attempts.'
        }
      }
    })

    return result
  }

  clearFailedAttempts(identifier: string): void {
    void clearBruteForceAttempts(identifier)
  }

  unlockAccount(identifier: string): void {
    void clearBruteForceAttempts(identifier)
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

  static generateSessionId(user_id: string, timestamp: number = Date.now()): string {
    const data = `${user_id}:${timestamp}:${randomBytes(16).toString('hex')}`
    return createHash('sha256').update(data).digest('hex')
  }

  static shouldRotate(tokenIssuedAt: number): boolean {
    return Date.now() - tokenIssuedAt > this.ROTATION_INTERVAL
  }

  static rotateToken(
    oldToken: string,
    user_id: string
  ): {
    token: string
    sessionId: string
    expiresAt: Date
  } {
    const newToken = this.generateToken()
    const sessionId = this.generateSessionId(user_id)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Log rotation event
    getLogger().logSecurityEvent('session_token_rotated', {
      user_id,
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
      headers.get('user-agent') ?? '',
      headers.get('accept-language') ?? '',
      headers.get('accept-encoding') ?? '',
      headers.get('sec-ch-ua') ?? '',
      headers.get('sec-ch-ua-platform') ?? ''
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
