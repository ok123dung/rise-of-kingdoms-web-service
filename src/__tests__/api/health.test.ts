/**
 * @jest-environment node
 */

import { GET } from '@/app/api/health/route'

describe('/api/health', () => {
  it('returns healthy status', async () => {
    const response = await GET()

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.checks).toBeDefined()
    expect(data.checks.database).toBeDefined()
    expect(data.checks.services).toBeDefined()
    expect(data.checks.api).toBeDefined()
    expect(data.metadata).toBeDefined()
    expect(data.metadata.version).toBe('1.0.0')
    expect(data.timestamp).toBeDefined()
  })

  it('includes uptime in metadata', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.metadata.uptime).toBeDefined()
    expect(typeof data.metadata.uptime).toBe('number')
    expect(data.metadata.uptime).toBeGreaterThan(0)
  })

  it('includes environment in metadata', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.metadata.environment).toBeDefined()
    expect(['development', 'production', 'test']).toContain(data.metadata.environment)
  })

  it('returns proper timestamp format', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.timestamp).toBeDefined()
    // Should be a valid ISO 8601 date
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })

  it('includes all required check statuses', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.checks.database.status).toBe('pass')
    expect(data.checks.services.status).toBe('pass')
    expect(data.checks.api.status).toBe('pass')
  })
})
