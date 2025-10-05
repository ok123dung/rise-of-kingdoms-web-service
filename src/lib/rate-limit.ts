import { Redis } from '@upstash/redis'
import { type NextRequest } from 'next/server'
// Rate limit configuration
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
  keyPrefix?: string
}
// In-memory store for development/fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>()
// Redis client (optional)
let redis: Redis | null = null
// Initialize Redis if available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  } catch (error) {
    console.error('Failed to initialize Redis for rate limiting:', error)
  }
}
// Get client identifier from request
export function getClientId(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  // Use the first available IP
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'anonymous'
  return ip.trim()
}
// Rate limiter class
export class RateLimiter {
  private config: RateLimitConfig
  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'rate_limit',
      ...config
    }
  }
  async isAllowed(clientId: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  }> {
    const key = `${this.config.keyPrefix}:${clientId}`
    const now = Date.now()
    // Try Redis first
    if (redis) {
      try {
        const count = await redis.incr(key)
        if (count === 1) {
          // First request, set expiry
          await redis.expire(key, Math.ceil(this.config.windowMs / 1000))
        }
        const ttl = await redis.ttl(key)
        const resetTime = now + ttl * 1000
        const remaining = Math.max(0, this.config.max - count)
        if (count > this.config.max) {
          return {
            allowed: false,
            remaining: 0,
            resetTime,
            retryAfter: Math.ceil(ttl)
          }
        }
        return {
          allowed: true,
          remaining,
          resetTime
        }
      } catch (error) {
        console.error('Redis rate limit error:', error)
        // Fall through to memory store
      }
    }
    // Fallback to memory store
    const record = memoryStore.get(key)
    if (!record || now > record.resetTime) {
      // Create new record
      memoryStore.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      })
      return {
        allowed: true,
        remaining: this.config.max - 1,
        resetTime: now + this.config.windowMs
      }
    }
    // Check if limit exceeded
    if (record.count >= this.config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      }
    }
    // Increment count
    record.count++
    return {
      allowed: true,
      remaining: this.config.max - record.count,
      resetTime: record.resetTime
    }
  }
  // Clean up old entries from memory store (run periodically)
  static cleanupMemoryStore() {
    const now = Date.now()
    for (const [key, record] of Array.from(memoryStore.entries())) {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    }
  }
}
// Pre-configured rate limiters
export const rateLimiters = {
  // API endpoints
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    keyPrefix: 'api'
  }),
  // Authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    keyPrefix: 'auth'
  }),
  // Payment endpoints
  payment: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    keyPrefix: 'payment'
  }),
  // Contact/Lead generation
  contact: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 submissions per hour
    keyPrefix: 'contact'
  }),
  // Strict rate limit for sensitive operations
  strict: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    keyPrefix: 'strict'
  }),
  // Webhook rate limiting - prevent abuse and DDoS
  webhook: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 webhooks per minute per IP
    keyPrefix: 'webhook'
  }),
  // Per-provider webhook limits (stricter)
  webhookVnpay: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 VNPay webhooks per minute
    keyPrefix: 'webhook:vnpay'
  }),
  webhookMomo: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 MoMo webhooks per minute
    keyPrefix: 'webhook:momo'
  }),
  webhookZalopay: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 ZaloPay webhooks per minute
    keyPrefix: 'webhook:zalopay'
  })
}
// Middleware helper
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter = rateLimiters.api
): Promise<Response | null> {
  const clientId = getClientId(request)
  const result = await limiter.isAllowed(clientId)
  if (!result.allowed) {
    return Response.json(
      {
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: result.retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limiter['config'].max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetTime),
          'Retry-After': String(result.retryAfter || 60)
        }
      }
    )
  }
  // Return null to continue processing
  return null
}
// Clean up memory store every 5 minutes
if (typeof window === 'undefined') {
  setInterval(
    () => {
      RateLimiter.cleanupMemoryStore()
    },
    5 * 60 * 1000
  )
}
