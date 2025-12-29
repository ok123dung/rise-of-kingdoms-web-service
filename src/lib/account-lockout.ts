/**
 * Account Lockout System
 * Progressive lockout with Redis backing for distributed systems
 * Lockout times: 5 min → 15 min → 60 min (progressive)
 */

import { Redis } from '@upstash/redis'

// Types
export interface LockoutConfig {
  maxAttempts: number // Max failed attempts before lockout
  lockoutDurations: number[] // Progressive lockout durations in ms
  attemptWindowMs: number // Window to count failed attempts
}

export interface LockoutStatus {
  isLocked: boolean
  failedAttempts: number
  lockoutUntil?: number // Unix timestamp
  lockoutDuration?: number // Duration in ms
  attemptsRemaining: number
}

// Default configuration: 5 attempts, then progressive lockout
const DEFAULT_CONFIG: LockoutConfig = {
  maxAttempts: 5,
  lockoutDurations: [
    5 * 60 * 1000, // 5 minutes
    15 * 60 * 1000, // 15 minutes
    60 * 60 * 1000, // 60 minutes
  ],
  attemptWindowMs: 15 * 60 * 1000, // 15 minute window
}

// In-memory store for when Redis is unavailable
class InMemoryLockoutStore {
  private attempts: Map<string, { count: number; timestamps: number[] }> = new Map()
  private lockouts: Map<string, { until: number; lockoutCount: number }> = new Map()

  getAttempts(key: string): { count: number; timestamps: number[] } {
    return this.attempts.get(key) ?? { count: 0, timestamps: [] }
  }

  recordAttempt(key: string, windowMs: number): number {
    const now = Date.now()
    const existing = this.attempts.get(key) ?? { count: 0, timestamps: [] }

    // Filter timestamps within window
    existing.timestamps = existing.timestamps.filter((t) => now - t < windowMs)
    existing.timestamps.push(now)
    existing.count = existing.timestamps.length

    this.attempts.set(key, existing)
    return existing.count
  }

  clearAttempts(key: string): void {
    this.attempts.delete(key)
  }

  getLockout(key: string): { until: number; lockoutCount: number } | null {
    const lockout = this.lockouts.get(key)
    if (!lockout) return null

    if (Date.now() > lockout.until) {
      return null // Lockout expired
    }
    return lockout
  }

  setLockout(key: string, until: number, lockoutCount: number): void {
    this.lockouts.set(key, { until, lockoutCount })
  }

  incrementLockoutCount(key: string): number {
    const existing = this.lockouts.get(key)
    const count = (existing?.lockoutCount ?? 0) + 1
    return count
  }
}

// Singleton instances
let redis: Redis | null = null
const inMemoryStore = new InMemoryLockoutStore()

function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env['UPSTASH_REDIS_REST_URL']
  const token = process.env['UPSTASH_REDIS_REST_TOKEN']

  if (!url || !token) {
    return null
  }

  try {
    redis = new Redis({ url, token })
    return redis
  } catch {
    return null
  }
}

/**
 * Check if account is currently locked out
 */
export async function isAccountLocked(
  identifier: string,
  config: LockoutConfig = DEFAULT_CONFIG
): Promise<LockoutStatus> {
  const key = `lockout:${identifier}`
  const client = getRedis()

  if (client) {
    return checkLockoutRedis(client, key, config)
  }

  return checkLockoutInMemory(key, config)
}

async function checkLockoutRedis(
  client: Redis,
  key: string,
  config: LockoutConfig
): Promise<LockoutStatus> {
  try {
    const lockoutKey = `${key}:locked`
    const attemptsKey = `${key}:attempts`

    const [lockoutUntil, failedAttempts] = await Promise.all([
      client.get<number>(lockoutKey),
      client.get<number>(attemptsKey),
    ])

    const now = Date.now()
    const isLocked = lockoutUntil !== null && lockoutUntil > now

    return {
      isLocked,
      failedAttempts: failedAttempts ?? 0,
      lockoutUntil: isLocked ? lockoutUntil : undefined,
      lockoutDuration: isLocked && lockoutUntil ? lockoutUntil - now : undefined,
      attemptsRemaining: Math.max(0, config.maxAttempts - (failedAttempts ?? 0)),
    }
  } catch {
    return checkLockoutInMemory(key, config)
  }
}

function checkLockoutInMemory(key: string, config: LockoutConfig): LockoutStatus {
  const lockout = inMemoryStore.getLockout(key)
  const attempts = inMemoryStore.getAttempts(key)
  const now = Date.now()

  const isLocked = lockout !== null && lockout.until > now

  return {
    isLocked,
    failedAttempts: attempts.count,
    lockoutUntil: isLocked && lockout ? lockout.until : undefined,
    lockoutDuration: isLocked && lockout ? lockout.until - now : undefined,
    attemptsRemaining: Math.max(0, config.maxAttempts - attempts.count),
  }
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(
  identifier: string,
  config: LockoutConfig = DEFAULT_CONFIG
): Promise<LockoutStatus> {
  const key = `lockout:${identifier}`
  const client = getRedis()

  if (client) {
    return recordFailedAttemptRedis(client, key, config)
  }

  return recordFailedAttemptInMemory(key, config)
}

async function recordFailedAttemptRedis(
  client: Redis,
  key: string,
  config: LockoutConfig
): Promise<LockoutStatus> {
  try {
    const attemptsKey = `${key}:attempts`
    const lockoutKey = `${key}:locked`
    const lockoutCountKey = `${key}:lockoutCount`

    // Increment attempts
    const attempts = await client.incr(attemptsKey)

    // Set expiry on attempts key
    await client.pexpire(attemptsKey, config.attemptWindowMs)

    // Check if we need to lock out
    if (attempts >= config.maxAttempts) {
      // Get lockout count for progressive duration
      const lockoutCount = (await client.get<number>(lockoutCountKey)) ?? 0
      const durationIndex = Math.min(lockoutCount, config.lockoutDurations.length - 1)
      const duration = config.lockoutDurations[durationIndex]
      const lockoutUntil = Date.now() + duration

      // Set lockout
      await client.set(lockoutKey, lockoutUntil, { px: duration })
      await client.incr(lockoutCountKey)
      await client.pexpire(lockoutCountKey, 24 * 60 * 60 * 1000) // 24 hour expiry for lockout count

      // Clear attempts counter
      await client.del(attemptsKey)

      return {
        isLocked: true,
        failedAttempts: attempts,
        lockoutUntil,
        lockoutDuration: duration,
        attemptsRemaining: 0,
      }
    }

    return {
      isLocked: false,
      failedAttempts: attempts,
      attemptsRemaining: config.maxAttempts - attempts,
    }
  } catch {
    return recordFailedAttemptInMemory(key, config)
  }
}

function recordFailedAttemptInMemory(key: string, config: LockoutConfig): LockoutStatus {
  const attempts = inMemoryStore.recordAttempt(key, config.attemptWindowMs)

  if (attempts >= config.maxAttempts) {
    const lockoutCount = inMemoryStore.incrementLockoutCount(key)
    const durationIndex = Math.min(lockoutCount - 1, config.lockoutDurations.length - 1)
    const duration = config.lockoutDurations[durationIndex]
    const lockoutUntil = Date.now() + duration

    inMemoryStore.setLockout(key, lockoutUntil, lockoutCount)
    inMemoryStore.clearAttempts(key)

    return {
      isLocked: true,
      failedAttempts: attempts,
      lockoutUntil,
      lockoutDuration: duration,
      attemptsRemaining: 0,
    }
  }

  return {
    isLocked: false,
    failedAttempts: attempts,
    attemptsRemaining: config.maxAttempts - attempts,
  }
}

/**
 * Clear lockout after successful login
 */
export async function clearLockout(identifier: string): Promise<void> {
  const key = `lockout:${identifier}`
  const client = getRedis()

  if (client) {
    try {
      await client.del(`${key}:attempts`, `${key}:locked`, `${key}:lockoutCount`)
    } catch {
      // Fallback to in-memory
      inMemoryStore.clearAttempts(key)
    }
  } else {
    inMemoryStore.clearAttempts(key)
  }
}

/**
 * Format lockout duration for user display
 */
export function formatLockoutDuration(ms: number): string {
  const minutes = Math.ceil(ms / 60000)
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
}
