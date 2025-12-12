import { Redis } from '@upstash/redis'

import { getLogger } from '@/lib/monitoring/logger'

interface BruteForceConfig {
  maxAttempts: number
  blockDurationMs: number
  windowMs: number // Time window for counting attempts
  keyPrefix: string
}

interface BruteForceResult {
  allowed: boolean
  remainingAttempts: number
  blockedUntil?: number
  message?: string
}

interface AttemptRecord {
  count: number
  lastAttempt: number
  blockedUntil?: number
}

// In-memory fallback store
const memoryStore = new Map<string, AttemptRecord>()

// Redis client (lazy initialized)
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    } catch (error) {
      getLogger().error('Failed to initialize Redis for brute force protection', error as Error)
    }
  }

  return redis
}

// Default configuration
const DEFAULT_CONFIG: BruteForceConfig = {
  maxAttempts: 5,
  blockDurationMs: 15 * 60 * 1000, // 15 minutes
  windowMs: 60 * 60 * 1000, // 1 hour window
  keyPrefix: 'bruteforce'
}

/**
 * Check if an identifier is allowed to proceed (not blocked)
 */
export async function checkBruteForce(
  identifier: string,
  config: Partial<BruteForceConfig> = {}
): Promise<BruteForceResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `${cfg.keyPrefix}:${identifier}`
  const now = Date.now()

  const client = getRedis()

  if (client) {
    try {
      return await checkBruteForceRedis(client, key, cfg, now)
    } catch (error) {
      getLogger().error('Redis brute force check error, falling back to memory', error as Error)
    }
  }

  // Fallback to memory store
  return checkBruteForceMemory(key, cfg, now)
}

async function checkBruteForceRedis(
  client: Redis,
  key: string,
  cfg: BruteForceConfig,
  now: number
): Promise<BruteForceResult> {
  const data = await client.get<AttemptRecord>(key)

  if (!data) {
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  // Check if blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: data.blockedUntil,
      message: 'Account temporarily blocked due to too many failed attempts'
    }
  }

  // Reset if window expired
  if (now - data.lastAttempt > cfg.windowMs) {
    await client.del(key)
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  // Check if max attempts reached
  if (data.count >= cfg.maxAttempts) {
    const blockedUntil = now + cfg.blockDurationMs
    await client.set(
      key,
      { ...data, blockedUntil },
      { px: cfg.blockDurationMs + 1000 } // TTL slightly longer than block duration
    )
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil,
      message: 'Too many failed attempts. Account blocked temporarily.'
    }
  }

  return {
    allowed: true,
    remainingAttempts: cfg.maxAttempts - data.count
  }
}

function checkBruteForceMemory(
  key: string,
  cfg: BruteForceConfig,
  now: number
): BruteForceResult {
  const data = memoryStore.get(key)

  if (!data) {
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  // Check if blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: data.blockedUntil,
      message: 'Account temporarily blocked due to too many failed attempts'
    }
  }

  // Reset if window expired
  if (now - data.lastAttempt > cfg.windowMs) {
    memoryStore.delete(key)
    return { allowed: true, remainingAttempts: cfg.maxAttempts }
  }

  // Check if max attempts reached
  if (data.count >= cfg.maxAttempts) {
    data.blockedUntil = now + cfg.blockDurationMs
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: data.blockedUntil,
      message: 'Too many failed attempts. Account blocked temporarily.'
    }
  }

  return {
    allowed: true,
    remainingAttempts: cfg.maxAttempts - data.count
  }
}

/**
 * Record a failed attempt for an identifier
 */
export async function recordFailedAttempt(
  identifier: string,
  config: Partial<BruteForceConfig> = {}
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `${cfg.keyPrefix}:${identifier}`
  const now = Date.now()

  const client = getRedis()

  if (client) {
    try {
      await recordFailedAttemptRedis(client, key, cfg, now)
      return
    } catch (error) {
      getLogger().error('Redis record failed attempt error, falling back to memory', error as Error)
    }
  }

  // Fallback to memory store
  recordFailedAttemptMemory(key, cfg, now)
}

async function recordFailedAttemptRedis(
  client: Redis,
  key: string,
  cfg: BruteForceConfig,
  now: number
): Promise<void> {
  const existing = await client.get<AttemptRecord>(key)

  let data: AttemptRecord
  if (!existing || now - existing.lastAttempt > cfg.windowMs) {
    // Start fresh
    data = { count: 1, lastAttempt: now }
  } else {
    // Increment
    data = {
      count: existing.count + 1,
      lastAttempt: now,
      blockedUntil: existing.blockedUntil
    }
  }

  // Set with TTL (window duration + buffer)
  await client.set(key, data, { px: cfg.windowMs + cfg.blockDurationMs })

  getLogger().warn('Failed login attempt recorded', {
    identifier: key.replace(`${cfg.keyPrefix}:`, ''),
    attemptCount: data.count,
    maxAttempts: cfg.maxAttempts
  })
}

function recordFailedAttemptMemory(
  key: string,
  cfg: BruteForceConfig,
  now: number
): void {
  const existing = memoryStore.get(key)

  if (!existing || now - existing.lastAttempt > cfg.windowMs) {
    // Start fresh
    memoryStore.set(key, { count: 1, lastAttempt: now })
  } else {
    // Increment
    existing.count++
    existing.lastAttempt = now
  }

  getLogger().warn('Failed login attempt recorded (memory)', {
    identifier: key.replace(`${cfg.keyPrefix}:`, ''),
    attemptCount: memoryStore.get(key)?.count ?? 0,
    maxAttempts: cfg.maxAttempts
  })
}

/**
 * Clear failed attempts for an identifier (e.g., after successful login)
 */
export async function clearFailedAttempts(
  identifier: string,
  config: Partial<BruteForceConfig> = {}
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const key = `${cfg.keyPrefix}:${identifier}`

  const client = getRedis()

  if (client) {
    try {
      await client.del(key)
      return
    } catch (error) {
      getLogger().error('Redis clear failed attempts error', error as Error)
    }
  }

  // Fallback to memory store
  memoryStore.delete(key)
}

/**
 * Check if an identifier is currently blocked
 */
export async function isBlocked(
  identifier: string,
  config: Partial<BruteForceConfig> = {}
): Promise<boolean> {
  const result = await checkBruteForce(identifier, config)
  return !result.allowed
}

// Cleanup memory store periodically (for memory fallback)
if (typeof window === 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      for (const [key, record] of memoryStore.entries()) {
        // Clean up entries older than 2 hours
        if (now - record.lastAttempt > 2 * 60 * 60 * 1000) {
          memoryStore.delete(key)
        }
      }
    },
    10 * 60 * 1000 // Every 10 minutes
  )
}
