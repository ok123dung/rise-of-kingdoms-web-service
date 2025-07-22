import { NextRequest, NextResponse } from 'next/server'
import { healthMonitor, trackRequest } from '@/lib/monitoring'

export const GET = trackRequest('/api/health')(async function(request: NextRequest) {
  try {
    // Perform comprehensive health check
    const healthResult = await healthMonitor.performHealthCheck()
    
    // Determine HTTP status code based on health status
    let statusCode = 200
    if (healthResult.status === 'degraded') {
      statusCode = 200 // Still operational but with warnings
    } else if (healthResult.status === 'unhealthy') {
      statusCode = 503 // Service unavailable
    }
    
    // Add additional response headers
    const response = NextResponse.json(healthResult, { status: statusCode })
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    // Add monitoring headers
    response.headers.set('X-Health-Status', healthResult.status)
    response.headers.set('X-Health-Timestamp', healthResult.timestamp)
    
    return response
  } catch (error) {
    console.error('Health check endpoint failed:', error)
    
    const failureResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check system failure',
      checks: {
        database: { status: 'fail', message: 'Health check system error', lastChecked: new Date().toISOString() },
        redis: { status: 'fail', message: 'Health check system error', lastChecked: new Date().toISOString() },
        external_apis: { status: 'fail', message: 'Health check system error', lastChecked: new Date().toISOString() },
        disk_space: { status: 'fail', message: 'Health check system error', lastChecked: new Date().toISOString() },
        memory: { status: 'fail', message: 'Health check system error', lastChecked: new Date().toISOString() }
      },
      metadata: {
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }
    
    return NextResponse.json(failureResponse, { status: 503 })
  }
})
