/**
 * @jest-environment node
 */

/**
 * Services API Route Tests
 * Tests for /api/services endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock the cache middleware to pass through
jest.mock('@/lib/api-cache', () => ({
  withCache: (handler: any) => handler,
  withETag: (handler: any) => handler,
  CacheConfigs: {
    PUBLIC_STATIC: {},
  },
}))

// Import after mocking
import { GET, POST } from '../services/route'

describe('Services API Route', () => {
  describe('GET /api/services', () => {
    it('should return services list', async () => {
      const req = createMockRequest({ url: 'http://localhost:3000/api/services' })
      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.count).toBeGreaterThan(0)
    })

    it('should only return active services', async () => {
      const req = createMockRequest({ url: 'http://localhost:3000/api/services' })
      const response = await GET(req)
      const data = await getJson(response)

      data.data.forEach((service: any) => {
        expect(service.is_active).toBe(true)
      })
    })

    it('should sort featured services first', async () => {
      const req = createMockRequest({ url: 'http://localhost:3000/api/services' })
      const response = await GET(req)
      const data = await getJson(response)

      // Check that featured services come before non-featured
      let seenNonFeatured = false
      data.data.forEach((service: any) => {
        if (!service.is_featured) {
          seenNonFeatured = true
        }
        if (seenNonFeatured && service.is_featured) {
          throw new Error('Featured service found after non-featured')
        }
      })
    })

    it('should include required service fields', async () => {
      const req = createMockRequest({ url: 'http://localhost:3000/api/services' })
      const response = await GET(req)
      const data = await getJson(response)

      const service = data.data[0]
      expect(service.id).toBeDefined()
      expect(service.slug).toBeDefined()
      expect(service.name).toBeDefined()
      expect(service.description).toBeDefined()
      expect(service.base_price).toBeDefined()
      expect(service.category).toBeDefined()
    })

    it('should include metadata features for services', async () => {
      const req = createMockRequest({ url: 'http://localhost:3000/api/services' })
      const response = await GET(req)
      const data = await getJson(response)

      const serviceWithFeatures = data.data.find((s: any) => s.metadata?.features)
      expect(serviceWithFeatures).toBeDefined()
      expect(Array.isArray(serviceWithFeatures.metadata.features)).toBe(true)
    })
  })

  describe('POST /api/services', () => {
    it('should return 503 service unavailable', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/services',
        body: { name: 'New Service' },
      })
      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(503)
      expect(data.success).toBe(false)
      expect(data.error).toContain('unavailable')
    })
  })
})
