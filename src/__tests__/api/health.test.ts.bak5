/**
 * @jest-environment node
 */

import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

// Mock the monitoring functions
jest.mock('@/lib/monitoring', () => ({
  trackRequest: jest.fn((endpoint: string) => (handler: Function) => handler),
  healthMonitor: {
    performHealthCheck: jest.fn()
  }
}))

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns healthy status when all checks pass', async () => {
    const { healthMonitor } = require('@/lib/monitoring')

    // Mock successful health check
    healthMonitor.performHealthCheck.mockResolvedValue({
      status: 'healthy',
      timestamp: '2025-01-01T00:00:00Z',
      checks: {
        database: {
          status: 'pass',
          message: 'Database responsive',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        redis: {
          status: 'pass',
          message: 'Redis connection healthy',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        external_apis: {
          status: 'pass',
          message: 'All external APIs healthy',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        disk_space: {
          status: 'pass',
          message: 'Disk space managed by platform',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        memory: {
          status: 'pass',
          message: 'Memory usage: 45.32MB',
          lastChecked: '2025-01-01T00:00:00Z'
        }
      },
      metadata: {
        uptime: 12345,
        version: '1.0.0',
        environment: 'test'
      }
    })

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.status).toBe('healthy')
    expect(data.checks).toBeDefined()
    expect(data.metadata).toBeDefined()
  })

  it('returns degraded status when some checks fail', async () => {
    const { healthMonitor } = require('@/lib/monitoring')

    // Mock degraded health check
    healthMonitor.performHealthCheck.mockResolvedValue({
      status: 'degraded',
      timestamp: '2025-01-01T00:00:00Z',
      checks: {
        database: {
          status: 'pass',
          message: 'Database responsive',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        redis: {
          status: 'warn',
          message: 'Redis not configured',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        external_apis: {
          status: 'fail',
          message: 'Some external APIs failed',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        disk_space: {
          status: 'pass',
          message: 'Disk space OK',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        memory: { status: 'pass', message: 'Memory usage OK', lastChecked: '2025-01-01T00:00:00Z' }
      },
      metadata: {
        uptime: 12345,
        version: '1.0.0',
        environment: 'test'
      }
    })

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.status).toBe(200) // Still 200 but degraded

    const data = await response.json()
    expect(data.status).toBe('degraded')
  })

  it('returns unhealthy status when health check fails completely', async () => {
    const { healthMonitor } = require('@/lib/monitoring')

    // Mock unhealthy health check
    healthMonitor.performHealthCheck.mockResolvedValue({
      status: 'unhealthy',
      timestamp: '2025-01-01T00:00:00Z',
      checks: {
        database: {
          status: 'fail',
          message: 'Database connection failed',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        redis: {
          status: 'fail',
          message: 'Redis connection failed',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        external_apis: {
          status: 'fail',
          message: 'All external APIs failed',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        disk_space: {
          status: 'fail',
          message: 'Disk space check failed',
          lastChecked: '2025-01-01T00:00:00Z'
        },
        memory: {
          status: 'fail',
          message: 'Memory check failed',
          lastChecked: '2025-01-01T00:00:00Z'
        }
      },
      metadata: {
        uptime: 12345,
        version: '1.0.0',
        environment: 'test'
      }
    })

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.status).toBe(503) // Service unavailable

    const data = await response.json()
    expect(data.status).toBe('unhealthy')
  })

  it('handles health check system failure gracefully', async () => {
    const { healthMonitor } = require('@/lib/monitoring')

    // Mock health check throwing an error
    healthMonitor.performHealthCheck.mockRejectedValue(new Error('Health check system failure'))

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.status).toBe(503)

    const data = await response.json()
    expect(data.status).toBe('unhealthy')
    expect(data.error).toBeDefined()
  })

  it('includes proper response headers', async () => {
    const { healthMonitor } = require('@/lib/monitoring')

    const mockResult = {
      status: 'healthy',
      timestamp: '2025-01-01T00:00:00Z',
      checks: {},
      metadata: {}
    }

    healthMonitor.performHealthCheck.mockResolvedValue(mockResult)

    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    // Check cache control headers
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')
    expect(response.headers.get('Pragma')).toBe('no-cache')
    expect(response.headers.get('Expires')).toBe('0')

    // Check monitoring headers
    expect(response.headers.get('X-Health-Status')).toBe('healthy')
    expect(response.headers.get('X-Health-Timestamp')).toBe('2025-01-01T00:00:00Z')
  })
})
