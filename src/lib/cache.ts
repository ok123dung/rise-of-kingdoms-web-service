import { Redis } from '@upstash/redis'
import { getLogger } from '@/lib/monitoring/logger'

interface CacheConfig {
  ttl?: number // Time to live in seconds
  prefix?: string
  staleWhileRevalidate?: number // Serve stale content while revalidating
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// In-memory cache for development
class MemoryCache {
  private store = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timer

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.store.delete(key)
      return null
    }

    return entry.data
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Limit cache size
    if (this.store.size > 1000) {
      // Remove oldest entries
      const entries = Array.from(this.store.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      for (let i = 0; i < 200; i++) {
        this.store.delete(entries[i][0])
      }
    }

    this.store.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async flush(): Promise<void> {
    this.store.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.store.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Redis cache for production
class RedisCache {
  private redis: Redis

  constructor(redisUrl?: string) {
    this.redis = new Redis({
      url: redisUrl || process.env.REDIS_URL || ''
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      return data as T
    } catch (error) {
      getLogger().error('Redis get error', error as Error, { key })
      return null
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), {
        ex: ttl
      })
    } catch (error) {
      getLogger().error('Redis set error', error as Error, { key })
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      getLogger().error('Redis del error', error as Error, { key })
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushdb()
    } catch (error) {
      getLogger().error('Redis flush error', error as Error)
    }
  }
}

// Cache manager with stale-while-revalidate support
export class CacheManager {
  private cache: MemoryCache | RedisCache
  private revalidationQueue = new Set<string>()

  constructor(private config: CacheConfig = {}) {
    // Use Redis in production, memory cache in development
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
      this.cache = new RedisCache()
    } else {
      this.cache = new MemoryCache()
    }
  }

  private getCacheKey(key: string): string {
    return this.config.prefix ? `${this.config.prefix}:${key}` : key
  }

  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    options?: { ttl?: number; staleWhileRevalidate?: boolean }
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey(key)
    const cached = await this.cache.get<T>(cacheKey)

    // If we have cached data and no fetcher, return it
    if (cached !== null && !fetcher) {
      return cached
    }

    // If no cached data and we have a fetcher, fetch and cache
    if (cached === null && fetcher) {
      try {
        const fresh = await fetcher()
        const ttl = options?.ttl || this.config.ttl || 300 // 5 minutes default
        await this.cache.set(cacheKey, fresh, ttl)
        return fresh
      } catch (error) {
        getLogger().error('Cache fetcher error', error as Error, { key })
        return null
      }
    }

    // If we have stale data and staleWhileRevalidate is enabled
    if (cached !== null && fetcher && (options?.staleWhileRevalidate || this.config.staleWhileRevalidate)) {
      // Return stale data immediately
      this.revalidateInBackground(cacheKey, fetcher, options?.ttl)
      return cached
    }

    return cached
  }

  private async revalidateInBackground<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    // Prevent duplicate revalidations
    if (this.revalidationQueue.has(cacheKey)) return
    
    this.revalidationQueue.add(cacheKey)

    // Run revalidation in background
    setImmediate(async () => {
      try {
        const fresh = await fetcher()
        const cacheTtl = ttl || this.config.ttl || 300
        await this.cache.set(cacheKey, fresh, cacheTtl)
        getLogger().debug(`Cache revalidated: ${cacheKey}`)
      } catch (error) {
        getLogger().error('Background revalidation error', error as Error, { key: cacheKey })
      } finally {
        this.revalidationQueue.delete(cacheKey)
      }
    })
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const cacheKey = this.getCacheKey(key)
    const cacheTtl = ttl || this.config.ttl || 300
    await this.cache.set(cacheKey, value, cacheTtl)
  }

  async del(key: string): Promise<void> {
    const cacheKey = this.getCacheKey(key)
    await this.cache.del(cacheKey)
  }

  async invalidate(pattern: string): Promise<void> {
    // For Redis, we could use pattern matching
    // For memory cache, we need to iterate
    if (this.cache instanceof MemoryCache) {
      getLogger().warn('Pattern invalidation not supported in memory cache')
    } else {
      // TODO: Implement pattern-based invalidation for Redis
      getLogger().warn('Pattern invalidation not yet implemented for Redis')
    }
  }

  async flush(): Promise<void> {
    await this.cache.flush()
  }
}

// Global cache instances
const cacheInstances = new Map<string, CacheManager>()

export function getCache(name: string = 'default', config?: CacheConfig): CacheManager {
  if (!cacheInstances.has(name)) {
    cacheInstances.set(name, new CacheManager(config))
  }
  return cacheInstances.get(name)!
}

// API response cache decorator
export function cached(options: { ttl?: number; key?: string } = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = getCache('api', { ttl: options.ttl || 300 })
      const cacheKey = options.key || `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`

      return cache.get(cacheKey, async () => {
        return originalMethod.apply(this, args)
      }, { staleWhileRevalidate: true })
    }

    return descriptor
  }
}