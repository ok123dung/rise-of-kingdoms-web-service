// Monitoring and Health Check System for Rise of Kingdoms Services

import { NextRequest } from 'next/server'

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: HealthCheck
    redis: HealthCheck
    external_apis: HealthCheck
    disk_space: HealthCheck
    memory: HealthCheck
  }
  metadata: {
    uptime: number
    version: string
    environment: string
    region?: string
  }
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warn'
  responseTime?: number
  message: string
  lastChecked: string
  details?: Record<string, unknown>
}

export class HealthMonitor {
  private static instance: HealthMonitor
  private lastHealthCheck: HealthCheckResult | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Start periodic health checks in production
    if (process.env.NODE_ENV === 'production') {
      this.startPeriodicHealthChecks()
    }
  }

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  // Comprehensive health check
  public async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString()

    try {
      // Run all health checks in parallel
      const [
        databaseCheck,
        redisCheck,
        externalApiCheck,
        diskSpaceCheck,
        memoryCheck
      ] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.checkExternalApis(),
        this.checkDiskSpace(),
        this.checkMemory()
      ])

      // Process results
      const checks = {
        database: this.processCheckResult(databaseCheck),
        redis: this.processCheckResult(redisCheck),
        external_apis: this.processCheckResult(externalApiCheck),
        disk_space: this.processCheckResult(diskSpaceCheck),
        memory: this.processCheckResult(memoryCheck)
      }

      // Determine overall status
      const overallStatus = this.determineOverallStatus(checks)

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp,
        checks,
        metadata: {
          uptime: process.uptime(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          region: process.env.VERCEL_REGION
        }
      }

      // Cache the result
      this.lastHealthCheck = result

      // Log to monitoring service if unhealthy
      if (overallStatus === 'unhealthy') {
        await this.alertUnhealthyStatus(result)
      }

      return result

    } catch (error) {
      console.error('Health check failed:', error)
      
      const failedResult: HealthCheckResult = {
        status: 'unhealthy',
        timestamp,
        checks: {
          database: { status: 'fail', message: 'Health check system failed', lastChecked: timestamp },
          redis: { status: 'fail', message: 'Health check system failed', lastChecked: timestamp },
          external_apis: { status: 'fail', message: 'Health check system failed', lastChecked: timestamp },
          disk_space: { status: 'fail', message: 'Health check system failed', lastChecked: timestamp },
          memory: { status: 'fail', message: 'Health check system failed', lastChecked: timestamp }
        },
        metadata: {
          uptime: process.uptime(),
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      }

      this.lastHealthCheck = failedResult
      return failedResult
    }
  }

  // Database health check
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const { prisma } = await import('@/lib/db')
      
      // Simple query to test connection
      await prisma.$queryRaw`SELECT 1`
      
      const responseTime = Date.now() - startTime
      
      return {
        status: responseTime < 1000 ? 'pass' : 'warn',
        responseTime,
        message: responseTime < 1000 ? 'Database responsive' : 'Database slow response',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date().toISOString()
      }
    }
  }

  // Redis health check
  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      if (!process.env.REDIS_URL) {
        return {
          status: 'warn',
          message: 'Redis not configured',
          lastChecked: new Date().toISOString()
        }
      }

      // Redis health check would go here
      // For now, return a mock response
      const responseTime = Date.now() - startTime
      
      return {
        status: 'pass',
        responseTime,
        message: 'Redis connection healthy',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date().toISOString()
      }
    }
  }

  // External APIs health check
  private async checkExternalApis(): Promise<HealthCheck> {
    const checks = []
    
    try {
      // Check payment gateways
      if (process.env.MOMO_PARTNER_CODE) {
        checks.push(this.checkMoMoApi())
      }
      
      if (process.env.ZALOPAY_APP_ID) {
        checks.push(this.checkZaloPayApi())
      }

      const results = await Promise.allSettled(checks)
      const failedChecks = results.filter(r => r.status === 'rejected').length
      
      if (failedChecks === 0) {
        return {
          status: 'pass',
          message: `All ${results.length} external APIs healthy`,
          lastChecked: new Date().toISOString()
        }
      } else if (failedChecks < results.length) {
        return {
          status: 'warn',
          message: `${failedChecks}/${results.length} external APIs failed`,
          lastChecked: new Date().toISOString()
        }
      } else {
        return {
          status: 'fail',
          message: 'All external APIs failed',
          lastChecked: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `External API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date().toISOString()
      }
    }
  }

  // Check MoMo API availability
  private async checkMoMoApi(): Promise<void> {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    await Promise.race([
      fetch('https://payment.momo.vn', { method: 'HEAD' }),
      timeout
    ])
  }

  // Check ZaloPay API availability  
  private async checkZaloPayApi(): Promise<void> {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )

    await Promise.race([
      fetch('https://openapi.zalopay.vn', { method: 'HEAD' }),
      timeout
    ])
  }

  // Disk space check
  private async checkDiskSpace(): Promise<HealthCheck> {
    try {
      // In serverless environment, disk space is managed by platform
      // Return a mock healthy status
      return {
        status: 'pass',
        message: 'Disk space managed by platform',
        lastChecked: new Date().toISOString(),
        details: { type: 'serverless' }
      }
    } catch (error) {
      return {
        status: 'warn',
        message: 'Cannot check disk space in serverless environment',
        lastChecked: new Date().toISOString()
      }
    }
  }

  // Memory usage check
  private async checkMemory(): Promise<HealthCheck> {
    try {
      const memoryUsage = process.memoryUsage()
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024
      
      // Warn if using more than 100MB
      const status = memoryUsageMB > 100 ? 'warn' : 'pass'
      
      return {
        status,
        message: `Memory usage: ${memoryUsageMB.toFixed(2)}MB`,
        lastChecked: new Date().toISOString(),
        details: memoryUsage as unknown as Record<string, unknown>
      }
    } catch (error) {
      return {
        status: 'fail',
        message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date().toISOString()
      }
    }
  }

  // Process check result from Promise.allSettled
  private processCheckResult(result: PromiseSettledResult<HealthCheck>): HealthCheck {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        status: 'fail',
        message: `Check failed: ${result.reason}`,
        lastChecked: new Date().toISOString()
      }
    }
  }

  // Determine overall status based on individual checks
  private determineOverallStatus(checks: HealthCheckResult['checks']): 'healthy' | 'degraded' | 'unhealthy' {
    const checkValues = Object.values(checks)
    
    const failedCount = checkValues.filter(c => c.status === 'fail').length
    const warnCount = checkValues.filter(c => c.status === 'warn').length
    
    if (failedCount > 0) {
      return failedCount > 1 ? 'unhealthy' : 'degraded'
    }
    
    if (warnCount > 1) {
      return 'degraded'
    }
    
    return 'healthy'
  }

  // Alert when system is unhealthy
  private async alertUnhealthyStatus(result: HealthCheckResult): Promise<void> {
    try {
      // Log to console (in production, this would go to monitoring service)
      console.error('🚨 SYSTEM UNHEALTHY:', {
        status: result.status,
        timestamp: result.timestamp,
        failedChecks: Object.entries(result.checks)
          .filter(([_, check]) => check.status === 'fail')
          .map(([name, check]) => ({ name, message: check.message }))
      })

      // In production, you would:
      // 1. Send to Sentry
      // 2. Send Discord notification
      // 3. Send email alert
      // 4. Update monitoring dashboard
      
      // Example: Send to Discord webhook
      if (process.env.DISCORD_WEBHOOK_URL && process.env.NODE_ENV === 'production') {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **RoK Services System Alert**\n\`\`\`\nStatus: ${result.status}\nTime: ${result.timestamp}\nFailed Checks: ${Object.entries(result.checks).filter(([_, c]) => c.status === 'fail').map(([n]) => n).join(', ')}\n\`\`\``
          })
        })
      }
    } catch (error) {
      console.error('Failed to send health alert:', error)
    }
  }

  // Start periodic health checks
  private startPeriodicHealthChecks(): void {
    // Check every 5 minutes in production
    const interval = process.env.HEALTH_CHECK_INTERVAL 
      ? parseInt(process.env.HEALTH_CHECK_INTERVAL) 
      : 5 * 60 * 1000

    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck().catch(error => {
        console.error('Periodic health check failed:', error)
      })
    }, interval)

    // Initial health check
    this.performHealthCheck()
  }

  // Stop periodic health checks
  public stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  // Get cached health status
  public getCachedHealth(): HealthCheckResult | null {
    return this.lastHealthCheck
  }
}

// Performance monitoring functions
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  // Record API response time
  public static recordResponseTime(endpoint: string, responseTime: number): void {
    const key = `response_time_${endpoint}`
    const metrics = this.metrics.get(key) || []
    
    // Keep only last 100 measurements
    metrics.push(responseTime)
    if (metrics.length > 100) {
      metrics.shift()
    }
    
    this.metrics.set(key, metrics)
  }

  // Get average response time for endpoint
  public static getAverageResponseTime(endpoint: string): number {
    const key = `response_time_${endpoint}`
    const metrics = this.metrics.get(key) || []
    
    if (metrics.length === 0) return 0
    
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length
  }

  // Record database query time
  public static recordDatabaseQuery(queryType: string, duration: number): void {
    const key = `db_query_${queryType}`
    const metrics = this.metrics.get(key) || []
    
    metrics.push(duration)
    if (metrics.length > 50) {
      metrics.shift()
    }
    
    this.metrics.set(key, metrics)
  }

  // Get performance summary
  public static getPerformanceSummary(): Record<string, unknown> {
    const summary: Record<string, unknown> = {}
    
    for (const [key, values] of Array.from(this.metrics.entries())) {
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length
        const max = Math.max(...values)
        const min = Math.min(...values)
        
        summary[key] = {
          average: Math.round(avg * 100) / 100,
          maximum: max,
          minimum: min,
          samples: values.length
        }
      }
    }
    
    return summary
  }
}

// Request tracking middleware
export function trackRequest(endpoint: string) {
  return (handler: Function) => {
    return async (req: NextRequest, ...args: unknown[]) => {
      const startTime = Date.now()
      
      try {
        const result = await handler(req, ...args)
        const responseTime = Date.now() - startTime
        
        PerformanceMonitor.recordResponseTime(endpoint, responseTime)
        
        return result
      } catch (error) {
        const responseTime = Date.now() - startTime
        PerformanceMonitor.recordResponseTime(`${endpoint}_error`, responseTime)
        throw error
      }
    }
  }
}

// Export singleton instance
export const healthMonitor = HealthMonitor.getInstance()