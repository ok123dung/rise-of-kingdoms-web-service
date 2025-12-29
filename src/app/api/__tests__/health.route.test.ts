/**
 * @jest-environment node
 */

/**
 * Health API Route Tests
 * Tests for /api/health endpoint
 */

import { GET } from '../health/route'

describe('Health API Route', () => {
  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
    })

    it('should include timestamp', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.timestamp).toBeDefined()
      expect(new Date(data.timestamp)).toBeInstanceOf(Date)
    })

    it('should include checks object', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.checks).toBeDefined()
      expect(data.checks.database).toBeDefined()
      expect(data.checks.services).toBeDefined()
      expect(data.checks.api).toBeDefined()
    })

    it('should report all checks as pass', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.checks.database.status).toBe('pass')
      expect(data.checks.services.status).toBe('pass')
      expect(data.checks.api.status).toBe('pass')
    })

    it('should include metadata', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.metadata).toBeDefined()
      expect(data.metadata.uptime).toBeGreaterThanOrEqual(0)
      expect(data.metadata.version).toBe('1.0.0')
      expect(data.metadata.environment).toBeDefined()
    })

    it('should include lastChecked timestamps in checks', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.checks.database.lastChecked).toBeDefined()
      expect(data.checks.services.lastChecked).toBeDefined()
      expect(data.checks.api.lastChecked).toBeDefined()
    })
  })
})
