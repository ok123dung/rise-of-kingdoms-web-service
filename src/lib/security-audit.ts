/**
 * Security Audit Logging
 * Records security-related events for monitoring and compliance
 */

import { prismaAdmin as prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

// Security event types
export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_BLOCKED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'TWO_FA_ENABLED'
  | 'TWO_FA_DISABLED'
  | 'TWO_FA_FAILED'
  | 'SESSION_CREATED'
  | 'SESSION_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'RATE_LIMITED'
  | 'CSRF_VIOLATION'

// Security event severity
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// Event metadata interface
export interface SecurityEventMetadata {
  user_id?: string
  email?: string
  ip_address?: string
  user_agent?: string
  request_id?: string
  endpoint?: string
  method?: string
  reason?: string
  attempts_remaining?: number
  lockout_duration?: number
  [key: string]: unknown
}

// Security audit log entry
export interface SecurityAuditLog {
  id: string
  event_type: SecurityEventType
  severity: SecuritySeverity
  user_id?: string
  ip_address?: string
  user_agent?: string
  metadata: SecurityEventMetadata
  created_at: Date
}

// Event severity mapping
const EVENT_SEVERITY: Record<SecurityEventType, SecuritySeverity> = {
  LOGIN_SUCCESS: 'LOW',
  LOGIN_FAILED: 'MEDIUM',
  LOGIN_BLOCKED: 'HIGH',
  LOGOUT: 'LOW',
  PASSWORD_CHANGE: 'MEDIUM',
  PASSWORD_RESET_REQUEST: 'LOW',
  PASSWORD_RESET_SUCCESS: 'MEDIUM',
  ACCOUNT_LOCKED: 'HIGH',
  ACCOUNT_UNLOCKED: 'MEDIUM',
  TWO_FA_ENABLED: 'MEDIUM',
  TWO_FA_DISABLED: 'HIGH',
  TWO_FA_FAILED: 'MEDIUM',
  SESSION_CREATED: 'LOW',
  SESSION_EXPIRED: 'LOW',
  PERMISSION_DENIED: 'MEDIUM',
  SUSPICIOUS_ACTIVITY: 'CRITICAL',
  RATE_LIMITED: 'MEDIUM',
  CSRF_VIOLATION: 'HIGH',
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  metadata: SecurityEventMetadata
): Promise<void> {
  const severity = EVENT_SEVERITY[eventType]
  const logger = getLogger()

  // Log based on severity - use LogContext compatible format
  const logContext = {
    event_type: eventType,
    severity,
    user_id: metadata.user_id,
    ip: metadata.ip_address,
    user_agent: metadata.user_agent?.substring(0, 200),
  }

  switch (severity) {
    case 'CRITICAL':
      logger.error(`SECURITY CRITICAL: ${eventType}`, undefined, logContext)
      break
    case 'HIGH':
      logger.warn(`SECURITY HIGH: ${eventType}`, logContext)
      break
    case 'MEDIUM':
      logger.info(`SECURITY: ${eventType}`, logContext)
      break
    default:
      logger.debug(`SECURITY: ${eventType}`, logContext)
  }

  // Try to persist to database (non-blocking)
  persistToDatabase(eventType, severity, metadata).catch((err) => {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    logger.error('Failed to persist security log', errorObj, { event_type: eventType })
  })
}

/**
 * Persist security event to database
 */
async function persistToDatabase(
  eventType: SecurityEventType,
  severity: SecuritySeverity,
  metadata: SecurityEventMetadata
): Promise<void> {
  try {
    // Check if security_audit_logs table exists
    // If not, we'll just log to application logs
    await prisma.$executeRaw`
      INSERT INTO security_audit_logs (
        event_type,
        severity,
        user_id,
        ip_address,
        user_agent,
        metadata,
        created_at
      ) VALUES (
        ${eventType},
        ${severity},
        ${metadata.user_id ?? null},
        ${metadata.ip_address ?? null},
        ${(metadata.user_agent ?? '').substring(0, 500)},
        ${JSON.stringify(sanitizeMetadata(metadata))}::jsonb,
        NOW()
      )
    `
  } catch (error) {
    // Table might not exist yet - that's okay, we still have app logs
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (!errorMessage.includes('does not exist')) {
      throw error
    }
    // Silently ignore missing table errors
  }
}

/**
 * Remove sensitive data from metadata before logging
 */
function sanitizeMetadata(metadata: SecurityEventMetadata): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...metadata }

  // Remove or mask sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'authorization']

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveFields.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]'
    }
  }

  return sanitized
}

/**
 * Helper functions for common security events
 */
export const securityAudit = {
  loginSuccess: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('LOGIN_SUCCESS', metadata),

  loginFailed: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('LOGIN_FAILED', metadata),

  loginBlocked: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('LOGIN_BLOCKED', metadata),

  accountLocked: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('ACCOUNT_LOCKED', metadata),

  accountUnlocked: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('ACCOUNT_UNLOCKED', metadata),

  passwordChange: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('PASSWORD_CHANGE', metadata),

  passwordResetRequest: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('PASSWORD_RESET_REQUEST', metadata),

  twoFAEnabled: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('TWO_FA_ENABLED', metadata),

  twoFADisabled: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('TWO_FA_DISABLED', metadata),

  permissionDenied: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('PERMISSION_DENIED', metadata),

  suspiciousActivity: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('SUSPICIOUS_ACTIVITY', metadata),

  rateLimited: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('RATE_LIMITED', metadata),

  csrfViolation: (metadata: SecurityEventMetadata) =>
    logSecurityEvent('CSRF_VIOLATION', metadata),
}

/**
 * Get client info from request headers
 */
export function getClientInfo(headers: Headers): {
  ip_address: string
  user_agent: string
} {
  const forwarded = headers.get('x-forwarded-for')
  const ip_address = forwarded ? forwarded.split(',')[0].trim() : headers.get('x-real-ip') ?? 'unknown'
  const user_agent = headers.get('user-agent') ?? 'unknown'

  return { ip_address, user_agent }
}
