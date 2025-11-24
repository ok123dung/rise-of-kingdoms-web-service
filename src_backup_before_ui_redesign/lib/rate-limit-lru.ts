import { getLogger } from './monitoring/logger'

interface RateLimitEntry {
  count: number
  resetTime: number
  lastAccess: number
}

interface RateLimitConfig {
  window: number // Time window in milliseconds
  max: number // Maximum requests in window
  prefix?: string
  maxMemoryEntries?: number // Maximum entries before LRU eviction
}

/**
 * LRU-based memory-efficient rate limiter
 * Uses a doubly-linked list + hashmap for O(1) operations
 */
export class LRURateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private accessOrder: string[] = [] // Track access order for LRU
  private readonly maxEntries: number

  constructor(private config: RateLimitConfig) {
    this.maxEntries = config.maxMemoryEntries || 10000
  }

  public async checkLimit(identifier: string): Promise<{
    success: boolean
    remaining: number
    reset: number
    retryAfter?: number
  }> {
    const now = Date.now()
    const key = this.config.prefix ? `${this.config.prefix}:${identifier}` : identifier

    let entry = this.store.get(key)

    // Initialize or reset entry
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.config.window,
        lastAccess: now
      }
    } else {
      entry.count++
      entry.lastAccess = now
    }

    // Update store and access order
    this.store.set(key, entry)
    this.updateAccessOrder(key)

    // Enforce LRU eviction if needed
    if (this.store.size > this.maxEntries) {
      this.evictLRU()
    }

    const remaining = Math.max(0, this.config.max - entry.count)
    const success = entry.count <= this.config.max

    return {
      success,
      remaining,
      reset: entry.resetTime,
      retryAfter: success ? undefined : Math.ceil((entry.resetTime - now) / 1000)
    }
  }

  private updateAccessOrder(key: string) {
    // Remove from current position
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    // Add to end (most recently used)
    this.accessOrder.push(key)
  }

  private evictLRU() {
    const toEvict = Math.max(1, Math.floor(this.maxEntries * 0.1)) // Evict 10% or at least 1

    for (let i = 0; i < toEvict && this.accessOrder.length > 0; i++) {
      const key = this.accessOrder.shift()
      if (key) {
        this.store.delete(key)
      }
    }

    getLogger().info('Rate limiter LRU eviction', {
      evicted: toEvict,
      remaining: this.store.size
    })
  }

  public reset(identifier: string) {
    const key = this.config.prefix ? `${this.config.prefix}:${identifier}` : identifier
    this.store.delete(key)
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  public cleanup() {
    const now = Date.now()
    let removed = 0

    // Clean up expired entries
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime + this.config.window) {
        this.store.delete(key)
        const index = this.accessOrder.indexOf(key)
        if (index > -1) {
          this.accessOrder.splice(index, 1)
        }
        removed++
      }
    }

    if (removed > 0) {
      getLogger().info('Rate limiter cleanup', { removed })
    }
  }

  public getStats() {
    return {
      entries: this.store.size,
      maxEntries: this.maxEntries,
      oldestAccess: this.accessOrder[0],
      newestAccess: this.accessOrder[this.accessOrder.length - 1]
    }
  }
}

/**
 * Sliding window rate limiter for more accurate rate limiting
 */
export class SlidingWindowRateLimiter {
  private store = new Map<string, number[]>() // Store timestamps of requests
  private readonly maxEntries: number

  constructor(private config: RateLimitConfig) {
    this.maxEntries = config.maxMemoryEntries || 10000
  }

  public async checkLimit(identifier: string): Promise<{
    success: boolean
    remaining: number
    reset: number
    retryAfter?: number
  }> {
    const now = Date.now()
    const key = this.config.prefix ? `${this.config.prefix}:${identifier}` : identifier
    const windowStart = now - this.config.window

    // Get or create timestamp array
    let timestamps = this.store.get(key) || []

    // Remove expired timestamps
    timestamps = timestamps.filter(ts => ts > windowStart)

    // Check if we can add new request
    const success = timestamps.length < this.config.max

    if (success) {
      timestamps.push(now)
    }

    this.store.set(key, timestamps)

    // Enforce memory limit
    if (this.store.size > this.maxEntries) {
      this.evictOldest()
    }

    const remaining = Math.max(0, this.config.max - timestamps.length)
    const oldestTimestamp = timestamps[0] || now
    const reset = oldestTimestamp + this.config.window

    return {
      success,
      remaining,
      reset,
      retryAfter: success ? undefined : Math.ceil((reset - now) / 1000)
    }
  }

  private evictOldest() {
    // Convert to array and sort by oldest timestamp
    const entries = Array.from(this.store.entries())
      .map(([key, timestamps]) => ({
        key,
        oldest: Math.min(...timestamps)
      }))
      .sort((a, b) => a.oldest - b.oldest)

    // Remove oldest 10%
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1))
    for (let i = 0; i < toRemove; i++) {
      this.store.delete(entries[i].key)
    }
  }

  public cleanup() {
    const now = Date.now()
    let removed = 0

    for (const [key, timestamps] of this.store.entries()) {
      if (timestamps.length === 0 || Math.max(...timestamps) < now - this.config.window * 2) {
        this.store.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      getLogger().info('Sliding window cleanup', { removed })
    }
  }
}

// Factory for creating appropriate rate limiter
export function createOptimizedRateLimiter(
  config: RateLimitConfig,
  type: 'lru' | 'sliding' = 'lru'
): LRURateLimiter | SlidingWindowRateLimiter {
  if (type === 'sliding') {
    return new SlidingWindowRateLimiter(config)
  }
  return new LRURateLimiter(config)
}
