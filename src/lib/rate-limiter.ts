/**
 * Rate Limiter - Redis-backed with in-memory fallback
 * Implements sliding window rate limiting for API protection
 */

import { Redis } from '@upstash/redis'

// Types
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyPrefix?: string // Redis key prefix
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number // Unix timestamp when limit resets
  retryAfter?: number // Seconds until allowed again
}

// In-memory fallback for when Redis is unavailable
class InMemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map()

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const now = Date.now()
    const existing = this.store.get(key)

    if (!existing || now > existing.resetAt) {
      const resetAt = now + windowMs
      this.store.set(key, { count: 1, resetAt })
      return { count: 1, resetAt }
    }

    existing.count++
    return { count: existing.count, resetAt: existing.resetAt }
  }

  cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.store.entries())
    for (const [key, value] of entries) {
      if (now > value.resetAt) {
        this.store.delete(key)
      }
    }
  }
}

// Singleton instances
let redis: Redis | null = null
const inMemoryStore = new InMemoryStore()

// Initialize Redis connection
function getRedis(): Redis | null {
  if (redis) return redis

  const url = process.env['UPSTASH_REDIS_REST_URL']
  const token = process.env['UPSTASH_REDIS_REST_TOKEN']

  if (!url || !token) {
    console.warn('Redis not configured, using in-memory rate limiting')
    return null
  }

  try {
    redis = new Redis({ url, token })
    return redis
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    return null
  }
}

// Cleanup in-memory store periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => inMemoryStore.cleanup(), 5 * 60 * 1000)
}

/**
 * Rate limit check using Redis or in-memory fallback
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { windowMs, maxRequests, keyPrefix = 'ratelimit' } = config
  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()

  const client = getRedis()

  if (client) {
    return checkRateLimitRedis(client, key, windowMs, maxRequests, now)
  }

  return checkRateLimitInMemory(key, windowMs, maxRequests, now)
}

async function checkRateLimitRedis(
  client: Redis,
  key: string,
  windowMs: number,
  maxRequests: number,
  now: number
): Promise<RateLimitResult> {
  try {
    // Use Redis MULTI for atomic operations
    const windowStart = now - windowMs

    // Remove old entries and add new one
    const pipeline = client.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    pipeline.zcard(key)
    pipeline.pexpire(key, windowMs)

    const results = await pipeline.exec()
    const count = (results[2] as number) || 0

    const resetAt = now + windowMs
    const allowed = count <= maxRequests
    const remaining = Math.max(0, maxRequests - count)

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil(windowMs / 1000),
    }
  } catch (error) {
    console.error('Redis rate limit error, falling back to in-memory:', error)
    return checkRateLimitInMemory(key, windowMs, maxRequests, now)
  }
}

async function checkRateLimitInMemory(
  key: string,
  windowMs: number,
  maxRequests: number,
  now: number
): Promise<RateLimitResult> {
  const { count, resetAt } = await inMemoryStore.increment(key, windowMs)
  const allowed = count <= maxRequests
  const remaining = Math.max(0, maxRequests - count)

  return {
    allowed,
    remaining,
    resetAt,
    retryAfter: allowed ? undefined : Math.ceil((resetAt - now) / 1000),
  }
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Login attempts: 5 per 15 minutes per IP
  login: (identifier: string) =>
    checkRateLimit(identifier, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
      keyPrefix: 'ratelimit:login',
    }),

  // API requests: 100 per minute per user
  api: (identifier: string) =>
    checkRateLimit(identifier, {
      windowMs: 60 * 1000,
      maxRequests: 100,
      keyPrefix: 'ratelimit:api',
    }),

  // Password reset: 3 per hour per email
  passwordReset: (identifier: string) =>
    checkRateLimit(identifier, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 3,
      keyPrefix: 'ratelimit:password-reset',
    }),

  // Registration: 5 per hour per IP
  registration: (identifier: string) =>
    checkRateLimit(identifier, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 5,
      keyPrefix: 'ratelimit:registration',
    }),
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - this should be overridden by actual request IP
  return 'unknown'
}
