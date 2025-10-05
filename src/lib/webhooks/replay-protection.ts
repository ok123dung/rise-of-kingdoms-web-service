import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

/**
 * Webhook Replay Protection
 *
 * Protects against replay attacks on webhooks by:
 * 1. Validating webhook timestamp (reject if older than 5 minutes)
 * 2. Checking for duplicate event IDs (idempotency)
 * 3. Storing processed webhook signatures to prevent replays
 *
 * This prevents attackers from:
 * - Replaying old webhook requests to cause duplicate payments
 * - Manipulating webhook timing to exploit race conditions
 */

const WEBHOOK_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

export interface WebhookValidationResult {
  valid: boolean
  error?: string
  isDuplicate?: boolean
}

/**
 * Validate webhook timestamp to prevent replay attacks
 * Rejects webhooks older than 5 minutes
 */
export function validateWebhookTimestamp(timestamp: number | string): boolean {
  const now = Date.now()
  const webhookTime = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp

  // Check if timestamp is in the future (clock skew tolerance: 1 minute)
  if (webhookTime > now + 60000) {
    getLogger().warn('Webhook timestamp is in the future', { timestamp: webhookTime, now })
    return false
  }

  // Check if timestamp is too old (older than 5 minutes)
  if (now - webhookTime > WEBHOOK_TIMEOUT_MS) {
    getLogger().warn('Webhook timestamp is too old', {
      timestamp: webhookTime,
      now,
      ageMinutes: Math.floor((now - webhookTime) / 60000)
    })
    return false
  }

  return true
}

/**
 * Check if webhook event has already been processed (idempotency check)
 * Returns true if this is a duplicate event
 */
export async function isDuplicateWebhook(
  provider: string,
  eventId: string
): Promise<boolean> {
  try {
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
      select: { status: true, createdAt: true }
    })

    if (existingEvent) {
      getLogger().info('Duplicate webhook detected', {
        provider,
        eventId,
        existingStatus: existingEvent.status,
        existingCreatedAt: existingEvent.createdAt.toISOString()
      })
      return true
    }

    return false
  } catch (error) {
    getLogger().error('Error checking duplicate webhook', error as Error, { provider, eventId })
    // Fail open: allow the webhook to proceed if we can't check
    return false
  }
}

/**
 * Validate webhook with replay protection
 * Checks both timestamp and duplicate detection
 */
export async function validateWebhookReplayProtection(
  provider: string,
  eventId: string,
  timestamp?: number | string
): Promise<WebhookValidationResult> {
  // 1. Validate timestamp if provided
  if (timestamp !== undefined) {
    if (!validateWebhookTimestamp(timestamp)) {
      return {
        valid: false,
        error: 'Webhook timestamp is invalid or too old'
      }
    }
  }

  // 2. Check for duplicate
  const isDuplicate = await isDuplicateWebhook(provider, eventId)
  if (isDuplicate) {
    return {
      valid: false,
      error: 'Duplicate webhook event',
      isDuplicate: true
    }
  }

  return { valid: true }
}

/**
 * Generate a unique nonce for webhook validation
 * Used to prevent replay attacks with additional randomness
 */
export function generateWebhookNonce(): string {
  const timestamp = Date.now()
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${timestamp}_${randomBytes}`
}

/**
 * Verify webhook nonce
 * Ensures nonce has valid format and hasn't been used before
 */
export async function verifyWebhookNonce(
  provider: string,
  nonce: string
): Promise<boolean> {
  try {
    // Parse nonce format: timestamp_randomhex
    const [timestampStr, randomHex] = nonce.split('_')

    if (!timestampStr || !randomHex || randomHex.length !== 32) {
      getLogger().warn('Invalid nonce format', { provider, nonce })
      return false
    }

    const timestamp = parseInt(timestampStr)
    if (isNaN(timestamp)) {
      getLogger().warn('Invalid nonce timestamp', { provider, nonce })
      return false
    }

    // Validate timestamp
    if (!validateWebhookTimestamp(timestamp)) {
      return false
    }

    // Check if nonce has been used (use eventId as unique identifier)
    const nonceEventId = `${provider}_nonce_${nonce}`
    const isDuplicate = await isDuplicateWebhook(provider, nonceEventId)

    if (isDuplicate) {
      return false
    }

    // Store nonce to prevent reuse
    await prisma.webhookEvent.create({
      data: {
        provider,
        eventType: 'nonce_validation',
        eventId: nonceEventId,
        payload: { nonce, timestamp: timestamp.toString() },
        status: 'completed',
        attempts: 0
      }
    })

    return true
  } catch (error) {
    getLogger().error('Error verifying webhook nonce', error as Error, { provider, nonce })
    return false
  }
}

/**
 * Clean up old webhook events and nonces
 * Should be run periodically to prevent database bloat
 */
export async function cleanupOldWebhookProtectionData(daysToKeep: number = 7): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await prisma.webhookEvent.deleteMany({
      where: {
        eventType: 'nonce_validation',
        createdAt: { lt: cutoffDate }
      }
    })

    getLogger().info('Cleaned up old webhook protection data', {
      deletedCount: result.count,
      daysToKeep
    })

    return result.count
  } catch (error) {
    getLogger().error('Error cleaning up webhook protection data', error as Error)
    return 0
  }
}
