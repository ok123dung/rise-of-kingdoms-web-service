import { type NextRequest, NextResponse } from 'next/server'

import { getCache } from '@/lib/cache'
import { getLogger } from '@/lib/monitoring/logger'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  key?: string | ((req: NextRequest) => string)
  revalidate?: boolean // Enable stale-while-revalidate
  condition?: (req: NextRequest) => boolean // Condition to enable caching
}

// Cache wrapper for API route handlers
export function withCache(
  handler: (req: NextRequest, context?: unknown) => Response | Promise<Response>,
  options: CacheOptions = {}
) {
  return async function cachedHandler(req: NextRequest, context?: unknown): Promise<Response> {
    // Check if caching should be applied
    if (options.condition && !options.condition(req)) {
      return Promise.resolve(handler(req, context))
    }

    // Only cache GET requests by default
    if (req.method !== 'GET') {
      return Promise.resolve(handler(req, context))
    }

    const cache = getCache('api')

    // Generate cache key
    let cacheKey: string
    if (typeof options.key === 'function') {
      cacheKey = options.key(req)
    } else if (options.key) {
      cacheKey = options.key
    } else {
      // Default key includes URL and relevant headers
      const { url } = req
      const acceptHeader = req.headers.get('accept') || ''
      const authHeader = req.headers.get('authorization') ? 'auth' : 'anon'
      cacheKey = `api:${req.method}:${url}:${acceptHeader}:${authHeader}`
    }

    try {
      // Try to get from cache
      const cached = await cache.get<{
        body: unknown
        headers: Record<string, string>
        status: number
      }>(cacheKey)

      if (cached) {
        // Return cached response
        const response = NextResponse.json(cached.body, {
          status: cached.status,
          headers: cached.headers
        })
        response.headers.set('X-Cache', 'HIT')
        response.headers.set('X-Cache-Key', cacheKey)
        return response
      }

      // Execute handler
      const response = await Promise.resolve(handler(req, context))

      // Only cache successful responses
      if (response.ok) {
        const clonedResponse = response.clone()
        const body = (await clonedResponse.json()) as unknown

        // Extract headers we want to cache
        const headers: Record<string, string> = {}
        const headersToCache = ['content-type', 'cache-control', 'etag']
        headersToCache.forEach(header => {
          const value = response.headers.get(header)
          if (value) headers[header] = value
        })

        // Cache the response
        await cache.set(
          cacheKey,
          {
            body,
            headers,
            status: response.status
          },
          options.ttl || 300 // 5 minutes default
        )

        // Add cache headers to original response
        response.headers.set('X-Cache', 'MISS')
        response.headers.set('X-Cache-Key', cacheKey)
        response.headers.set('Cache-Control', `public, max-age=${options.ttl || 300}`)
      }

      return response
    } catch (error) {
      getLogger().error('API cache error', error as Error, { cacheKey })
      // On error, execute handler without caching
      return Promise.resolve(handler(req, context))
    }
  }
}

// Cache invalidation helper
export async function invalidateApiCache(pattern?: string) {
  const cache = getCache('api')

  if (pattern) {
    cache.invalidate(pattern)
  } else {
    await cache.flush()
  }
}

// Common cache configurations
export const CacheConfigs = {
  // Cache for 1 minute
  SHORT: { ttl: 60 },

  // Cache for 5 minutes
  MEDIUM: { ttl: 300 },

  // Cache for 1 hour
  LONG: { ttl: 3600 },

  // Cache for 1 day
  VERY_LONG: { ttl: 86400 },

  // Public data that rarely changes
  PUBLIC_STATIC: {
    ttl: 3600,
    condition: (req: NextRequest) => !req.headers.get('authorization')
  },

  // User-specific data with shorter TTL
  USER_DATA: {
    ttl: 60,
    key: (req: NextRequest) => {
      const userId = req.headers.get('x-user-id') || 'anon'
      return `api:${req.method}:${req.url}:user:${userId}`
    }
  }
}

// ETags support for conditional requests
export function withETag(handler: (req: NextRequest, context?: unknown) => Response | Promise<Response>) {
  return async function etagHandler(req: NextRequest, context?: unknown): Promise<Response> {
    const response = await Promise.resolve(handler(req, context))

    if (response.ok && req.method === 'GET') {
      // Generate ETag from response body
      const clonedResponse = response.clone()
      const body = await clonedResponse.text()
      const etag = `"${Buffer.from(body).toString('base64').substring(0, 27)}"`

      // Check if client has matching ETag
      const clientETag = req.headers.get('if-none-match')
      if (clientETag === etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            ETag: etag,
            'Cache-Control': response.headers.get('cache-control') || 'public, max-age=300'
          }
        })
      }

      // Add ETag to response
      response.headers.set('ETag', etag)
    }

    return response
  }
}
