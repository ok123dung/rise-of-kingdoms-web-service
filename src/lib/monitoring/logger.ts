import * as Sentry from '@sentry/nextjs'

import { generateShortId } from '@/lib/crypto-utils'

// Express-like types for compatibility
interface ExpressRequest {
  user?: { id: string }
  method?: string
  url?: string
  path?: string
  headers?: Record<string, string>
  body?: unknown
  ip?: string
  connection?: {
    remoteAddress?: string
  }
}

interface ExpressResponse {
  statusCode?: number
  locals?: Record<string, unknown>
  setHeader: (name: string, value: string) => void
  end: (chunk?: unknown, encoding?: string) => void
}

interface ExpressNextFunction {
  (error?: unknown): void
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  user_id?: string
  booking_id?: string
  payment_id?: string
  sessionId?: string
  requestId?: string
  user_agent?: string
  ip?: string
  [key: string]: string | number | boolean | null | undefined
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  timestamp: Date
  service: string
  environment: string
}

class Logger {
  private service: string
  private environment: string

  constructor() {
    this.service = 'rok-services-backend'
    this.environment = process.env.NODE_ENV ?? 'development'
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context,
      error,
      timestamp: new Date(),
      service: this.service,
      environment: this.environment
    }
  }

  /**
   * Sanitize log message to prevent log injection attacks
   * Removes newlines and control characters from user-controlled input
   */
  private sanitizeLogMessage(message: string): string {
    return message.replace(/[\r\n\x00-\x1F\x7F]/g, ' ').substring(0, 2000)
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    // Sanitize message to prevent log injection
    const sanitizedMessage = this.sanitizeLogMessage(entry.message)
    const contextStr = entry.context ? JSON.stringify(entry.context) : ''
    const errorStr = entry.error
      ? ` | Error: ${this.sanitizeLogMessage(entry.error.message)} | Stack: ${entry.error.stack?.replace(/[\r\n]/g, ' -> ')}`
      : ''

    return `[${timestamp}] ${level} ${sanitizedMessage} ${contextStr}${errorStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const currentLevelIndex = logLevels.indexOf(
      (process.env.LOG_LEVEL as LogLevel) ?? LogLevel.INFO
    )
    const messageLevelIndex = logLevels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      // Detect build phase - skip database operations during build
      const isBuildPhase =
        process.env.NEXT_PHASE === 'phase-production-build' ||
        (process.env.VERCEL && process.env.VERCEL_ENV === undefined)

      // Only persist important logs to database in production (not during build)
      if (
        !isBuildPhase && // Skip during build phase
        this.environment === 'production' &&
        process.env.DATABASE_URL && // Only log to DB if URL is configured
        !process.env.CI && // Skip DB logging during CI/Build
        (entry.level === LogLevel.ERROR ||
          entry.level === LogLevel.FATAL ||
          entry.level === LogLevel.WARN)
      ) {
         
        const { prisma } = await import('@/lib/db')
        if (!prisma) return // Safety check if prisma is null during build
        await prisma.system_logs.create({
          data: {
            id: crypto.randomUUID(),
            level: entry.level,
            message: entry.message,
            service: entry.service,
            environment: entry.environment,
            context: entry.context ? JSON.parse(JSON.stringify(entry.context)) : undefined,
            error: entry.error
              ? JSON.parse(
                  JSON.stringify({
                    message: entry.error.message,
                    stack: entry.error.stack,
                    name: entry.error.name
                  })
                )
              : undefined,
            timestamp: entry.timestamp
          }
        })
      }
    } catch (error) {
      // Avoid infinite logging loop
       
      console.error('Failed to persist log to database:', error)
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context)
    // eslint-disable-next-line no-console
    console.debug(this.formatLogEntry(entry))
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return

    const entry = this.createLogEntry(LogLevel.INFO, message, context)
    console.info(this.formatLogEntry(entry))

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: context
    })
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return

    const entry = this.createLogEntry(LogLevel.WARN, message, context)
    console.warn(this.formatLogEntry(entry))

    // Persist to database
    void this.persistLog(entry)

    // Send to Sentry
    Sentry.captureMessage(message, 'warning')
    if (context) {
      Sentry.setContext('warning_context', context)
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error)
    console.error(this.formatLogEntry(entry))

    // Persist to database
    void this.persistLog(entry)

    // Send to Sentry
    if (error) {
      Sentry.captureException(error, {
        tags: {
          service: this.service,
          environment: this.environment
        },
        contexts: {
          error_context: context ?? {}
        }
      })
    } else {
      Sentry.captureMessage(message, 'error')
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error)
    console.error(this.formatLogEntry(entry))

    // Persist to database immediately
    void this.persistLog(entry)

    // Send to Sentry with high priority
    if (error) {
      Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          service: this.service,
          environment: this.environment,
          fatal: true
        },
        contexts: {
          fatal_context: context ?? {}
        }
      })
    } else {
      Sentry.captureMessage(message, 'fatal')
    }
  }

  // Business-specific logging methods
  logPaymentEvent(
    event: 'created' | 'completed' | 'failed' | 'refunded',
    payment_id: string,
    context?: LogContext
  ): void {
    this.info(`Payment ${event}`, {
      ...context,
      payment_id,
      event: `payment_${event}`
    })
  }

  logBookingEvent(
    event: 'created' | 'confirmed' | 'started' | 'completed' | 'cancelled',
    booking_id: string,
    context?: LogContext
  ): void {
    this.info(`Booking ${event}`, {
      ...context,
      booking_id,
      event: `booking_${event}`
    })
  }

  logUserEvent(
    event: 'registered' | 'login' | 'logout' | 'profile_updated',
    user_id: string,
    context?: LogContext
  ): void {
    this.info(`User ${event}`, {
      ...context,
      user_id,
      event: `user_${event}`
    })
  }

  logAPIRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level =
      statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO

    const logContext: LogContext = {
      ...context,
      method,
      path,
      statusCode,
      duration,
      event: 'api_request'
    }

    if (level === LogLevel.ERROR) {
      this.error(`API ${method} ${path} - ${statusCode} (${duration}ms)`, undefined, logContext)
    } else if (level === LogLevel.WARN) {
      this.warn(`API ${method} ${path} - ${statusCode} (${duration}ms)`, logContext)
    } else {
      this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, logContext)
    }
  }

  logSecurityEvent(
    event:
      | 'auth_failed'
      | 'rate_limit_exceeded'
      | 'suspicious_activity'
      | 'unauthorized_access'
      | 'login_attempt_while_locked'
      | 'login_failed'
      | 'login_success'
      | 'oauth_login'
      | 'signin'
      | 'signout'
      | 'account_locked'
      | 'account_unlocked_manually'
      | 'session_token_rotated'
      | '2fa_setup_initiated'
      | '2fa_enabled'
      | '2fa_login_success'
      | '2fa_backup_code_used'
      | '2fa_login_failed'
      | '2fa_disabled'
      | '2fa_backup_codes_regenerated',
    context?: LogContext
  ): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      event: `security_${event}`,
      security: true
    })
  }

  logPerformanceMetric(metric: string, value: number, unit: string, context?: LogContext): void {
    this.info(`Performance metric: ${metric} = ${value}${unit}`, {
      ...context,
      metric,
      value,
      unit,
      event: 'performance_metric'
    })
  }
}

// Singleton instance
let loggerInstance: Logger | null = null

export function getLogger(): Logger {
  loggerInstance ??= new Logger()
  return loggerInstance
}

// Performance monitoring
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  static startTimer(name: string): void {
    this.timers.set(name, Date.now())
  }

  static endTimer(name: string, context?: LogContext): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      getLogger().warn(`Timer '${name}' was not started`, context)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(name)

    getLogger().logPerformanceMetric(name, duration, 'ms', context)
    return duration
  }

  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    this.startTimer(name)
    try {
      const result = await fn()
      this.endTimer(name, context)
      return result
    } catch (error) {
      this.endTimer(name, { ...context, error: true })
      throw error
    }
  }

  static measure<T>(name: string, fn: () => T, context?: LogContext): T {
    this.startTimer(name)
    try {
      const result = fn()
      this.endTimer(name, context)
      return result
    } catch (error) {
      this.endTimer(name, { ...context, error: true })
      throw error
    }
  }
}

// Error boundary for React components
export function logError(error: Error, errorInfo?: { componentStack?: string }): void {
  getLogger().error('React error boundary caught error', error, {
    errorInfo: errorInfo?.componentStack ?? undefined,
    component: errorInfo?.componentStack,
    event: 'react_error'
  })
}

// API middleware for automatic logging
export function createAPILogger() {
  return (
    req: ExpressRequest & { user?: { id: string } },
    res: ExpressResponse,
    next: ExpressNextFunction
  ) => {
    const startTime = Date.now()
    const requestId = generateShortId(8)

    // Add request ID to headers
    res.setHeader('X-Request-ID', requestId)

    // Log request
    getLogger().debug(`API Request: ${req.method} ${req.path}`, {
      requestId,
      method: req.method,
      path: req.path,
      user_agent: req.headers?.['user-agent'],
      ip: req.ip ?? req.connection?.remoteAddress,
      user_id: req.user?.id
    })

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function (...args: Parameters<typeof originalEnd>) {
      const duration = Date.now() - startTime

      getLogger().logAPIRequest(
        req.method ?? 'UNKNOWN',
        req.path ?? req.url ?? 'UNKNOWN',
        res.statusCode ?? 0,
        duration,
        {
          requestId,
          user_id: req.user?.id,
          user_agent: req.headers?.['user-agent'],
          ip: req.ip ?? req.connection?.remoteAddress
        }
      )

      originalEnd.apply(this, args)
    }

    next()
  }
}

// Health check logging
export function logHealthCheck(
  service: string,
  status: 'healthy' | 'unhealthy' | 'degraded',
  details?: Record<string, unknown>
): void {
  const level =
    status === 'healthy' ? LogLevel.INFO : status === 'degraded' ? LogLevel.WARN : LogLevel.ERROR

  const logContext: LogContext = {
    service,
    status,
    event: 'health_check',
    ...(details ? { detailsJson: JSON.stringify(details) } : {})
  }

  const logger = getLogger()
  if (level === LogLevel.ERROR) {
    logger.error(`Health check: ${service} is ${status}`, undefined, logContext)
  } else if (level === LogLevel.WARN) {
    logger.warn(`Health check: ${service} is ${status}`, logContext)
  } else {
    logger.info(`Health check: ${service} is ${status}`, logContext)
  }
}

// Database query logging
export function logDatabaseQuery(
  query: string,
  duration: number,
  rowCount?: number,
  error?: Error
): void {
  if (error) {
    getLogger().error(`Database query failed: ${query}`, error, {
      query,
      duration,
      event: 'database_error'
    })
  } else if (duration > 1000) {
    // Log slow queries
    getLogger().warn(`Slow database query: ${query} (${duration}ms)`, {
      query,
      duration,
      rowCount,
      event: 'slow_query'
    })
  } else {
    getLogger().debug(`Database query: ${query} (${duration}ms)`, {
      query,
      duration,
      rowCount,
      event: 'database_query'
    })
  }
}

// Application monitoring wrapper
export class ApplicationMonitor {
  private static instance: ApplicationMonitor
  private logger: Logger
  private healthChecks: Map<
    string,
    { status: string; lastCheck: number; details?: Record<string, unknown> }
  > = new Map()

  private constructor() {
    this.logger = getLogger()
    this.startHealthCheckInterval()
  }

  static getInstance(): ApplicationMonitor {
    if (!ApplicationMonitor.instance) {
      ApplicationMonitor.instance = new ApplicationMonitor()
    }
    return ApplicationMonitor.instance
  }

  private startHealthCheckInterval(): void {
    // Run health checks every 30 seconds
    setInterval(() => {
      void this.runHealthChecks()
    }, 30000)
  }

  private async runHealthChecks(): Promise<void> {
    const checks = [
      { name: 'database', check: () => Promise.resolve(this.checkDatabase()) },
      { name: 'redis', check: () => Promise.resolve(this.checkRedis()) },
      { name: 'external_apis', check: () => this.checkExternalAPIs() },
      { name: 'disk_space', check: () => Promise.resolve(this.checkDiskSpace()) },
      { name: 'memory', check: () => Promise.resolve(this.checkMemory()) }
    ]

    await Promise.all(
      checks.map(async check => {
        try {
          const result = await check.check()
          this.healthChecks.set(check.name, {
            status: result.status,
            lastCheck: Date.now(),
            details: result.details
          })

          logHealthCheck(
            check.name,
            result.status as 'healthy' | 'unhealthy' | 'degraded',
            result.details
          )
        } catch (error) {
          this.healthChecks.set(check.name, {
            status: 'unhealthy',
            lastCheck: Date.now(),
            details: { error: error instanceof Error ? error.message : String(error) }
          })

          this.logger.error(
            `Health check failed for ${check.name}`,
            error instanceof Error ? error : new Error(String(error))
          )
        }
      })
    )
  }

  private checkDatabase(): { status: string; details?: Record<string, unknown> } {
    try {
      // Skip database health check for now
      return { status: 'healthy', details: { message: 'Database check skipped' } }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error) }
      }
    }
  }

  private checkRedis(): { status: string; details?: Record<string, unknown> } {
    // If Redis is configured
    if (process.env.REDIS_URL) {
      // Add Redis health check here
      return { status: 'healthy' }
    }
    return { status: 'healthy', details: { message: 'Redis not configured' } }
  }

  private async checkExternalAPIs(): Promise<{
    status: string
    details?: Record<string, unknown>
  }> {
    const apis = [
      { name: 'momo', url: 'https://test-payment.momo.vn' },
      { name: 'vnpay', url: 'https://sandbox.vnpayment.vn' },
      { name: 'zalopay', url: 'https://sb-openapi.zalopay.vn' }
    ]

    const results = await Promise.allSettled(
      apis.map(async api => {
        const response = await fetch(api.url, { method: 'HEAD' })
        return { name: api.name, status: response.ok ? 'healthy' : 'unhealthy' }
      })
    )

    const unhealthy = results.filter(
      r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.status === 'unhealthy')
    )

    return {
      status:
        unhealthy.length === 0
          ? 'healthy'
          : unhealthy.length < apis.length
            ? 'degraded'
            : 'unhealthy',
      details: { total: apis.length, unhealthy: unhealthy.length }
    }
  }

  private checkDiskSpace(): { status: string; details?: Record<string, unknown> } {
    try {
      // Only check disk space in Node.js environment and not in Edge Runtime
       
      if (typeof window === 'undefined' && typeof process !== 'undefined' && process?.memoryUsage) {
        // Simplified disk check - in production use proper disk usage tools
        const used = process.memoryUsage()
        const rss = used.rss / 1024 / 1024 // MB
        return {
          status: 'healthy',
          details: { message: 'Disk space check simplified', memoryRSS: Math.round(rss) }
        }
      }
      return {
        status: 'healthy',
        details: { message: 'Disk space check skipped in browser/edge runtime' }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : String(error) }
      }
    }
  }

  private checkMemory(): { status: string; details?: Record<string, unknown> } {
    // Check if we're in Node.js environment with process.memoryUsage available
    if (!process?.memoryUsage) {
      return {
        status: 'healthy',
        details: { message: 'Memory check skipped in edge runtime' }
      }
    }

    const used = process.memoryUsage()
    const totalHeap = used.heapTotal / 1024 / 1024 // MB
    const usedHeap = used.heapUsed / 1024 / 1024 // MB
    const usage = (usedHeap / totalHeap) * 100

    return {
      status: usage > 90 ? 'unhealthy' : usage > 70 ? 'degraded' : 'healthy',
      details: {
        heapUsed: Math.round(usedHeap),
        heapTotal: Math.round(totalHeap),
        usage: Math.round(usage)
      }
    }
  }

  getHealthStatus(): {
    overall: string
    services: Record<
      string,
      { status: string; lastCheck: number; details?: Record<string, unknown> }
    >
  } {
    const services = Object.fromEntries(this.healthChecks)
    const unhealthyCount = Array.from(this.healthChecks.values()).filter(
      check => check.status === 'unhealthy'
    ).length
    const degradedCount = Array.from(this.healthChecks.values()).filter(
      check => check.status === 'degraded'
    ).length

    let overall = 'healthy'
    if (unhealthyCount > 0) overall = 'unhealthy'
    else if (degradedCount > 0) overall = 'degraded'

    return { overall, services }
  }
}

// Initialize application monitoring
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  ApplicationMonitor.getInstance()
}

export default getLogger
