// Edge-compatible rate limiter using in-memory storage
// For production, use Cloudflare KV, Durable Objects, or Vercel KV

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  retryAfter?: number
}

// Simple in-memory store for Edge Runtime
class EdgeRateLimitStore {
  private store = new Map<string, RateLimitEntry>()
  private lastCleanup = Date.now()

  get(key: string): RateLimitEntry | undefined {
    // Periodic cleanup on get
    if (Date.now() - this.lastCleanup > 60000) {
      this.cleanup()
    }
    return this.store.get(key)
  }

  set(key: string, value: RateLimitEntry): void {
    // Limit store size to prevent memory issues
    if (this.store.size > 10000) {
      // Remove oldest entries
      const entries = Array.from(this.store.entries())
      const toRemove = entries.sort((a, b) => a[1].resetTime - b[1].resetTime).slice(0, 2000)

      toRemove.forEach(([k]) => this.store.delete(k))
    }

    this.store.set(key, value)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key)
      }
    }
    this.lastCleanup = now
  }
}

// Global store for Edge Runtime
const rateLimitStores = new Map<string, EdgeRateLimitStore>()

export class EdgeRateLimiter {
  private store: EdgeRateLimitStore

  constructor(
    private config: {
      window: number
      max: number
      prefix?: string
    }
  ) {
    const storeKey = config.prefix || 'default'
    if (!rateLimitStores.has(storeKey)) {
      rateLimitStores.set(storeKey, new EdgeRateLimitStore())
    }
    this.store = rateLimitStores.get(storeKey)!
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const key = this.config.prefix ? `${this.config.prefix}:${identifier}` : identifier

    let entry = this.store.get(key)

    // Initialize or reset entry
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.window
      }
    }

    entry.count++
    this.store.set(key, entry)

    const remaining = Math.max(0, this.config.max - entry.count)
    const success = entry.count <= this.config.max

    return {
      success,
      remaining,
      reset: entry.resetTime,
      retryAfter: success ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    }
  }

  reset(identifier: string): void {
    const key = this.config.prefix ? `${this.config.prefix}:${identifier}` : identifier
    const entry = this.store.get(key)
    if (entry) {
      entry.count = 0
      this.store.set(key, entry)
    }
  }
}

// Factory function for Edge Runtime
export function createEdgeRateLimiter(config: {
  window: number
  max: number
  prefix?: string
}): EdgeRateLimiter {
  return new EdgeRateLimiter(config)
}
