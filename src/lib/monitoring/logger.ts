import * as Sentry from '@sentry/nextjs'

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  userId?: string
  bookingId?: string
  paymentId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  [key: string]: any
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
    this.environment = process.env.NODE_ENV || 'development'
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

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const contextStr = entry.context ? JSON.stringify(entry.context) : ''
    const errorStr = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : ''
    
    return `[${timestamp}] ${level} ${entry.message} ${contextStr}${errorStr}`
  }

  private shouldLog(level: LogLevel): boolean {
    const logLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL]
    const currentLevelIndex = logLevels.indexOf(process.env.LOG_LEVEL as LogLevel || LogLevel.INFO)
    const messageLevelIndex = logLevels.indexOf(level)
    
    return messageLevelIndex >= currentLevelIndex
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context)
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
    
    // Send to Sentry
    if (error) {
      Sentry.captureException(error, {
        tags: {
          service: this.service,
          environment: this.environment
        },
        contexts: {
          error_context: context || {}
        }
      })
    } else {
      Sentry.captureMessage(message, 'error')
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error)
    console.error(this.formatLogEntry(entry))
    
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
          fatal_context: context || {}
        }
      })
    } else {
      Sentry.captureMessage(message, 'fatal')
    }
  }

  // Business-specific logging methods
  logPaymentEvent(
    event: 'created' | 'completed' | 'failed' | 'refunded',
    paymentId: string,
    context?: LogContext
  ): void {
    this.info(`Payment ${event}`, {
      ...context,
      paymentId,
      event: `payment_${event}`
    })
  }

  logBookingEvent(
    event: 'created' | 'confirmed' | 'started' | 'completed' | 'cancelled',
    bookingId: string,
    context?: LogContext
  ): void {
    this.info(`Booking ${event}`, {
      ...context,
      bookingId,
      event: `booking_${event}`
    })
  }

  logUserEvent(
    event: 'registered' | 'login' | 'logout' | 'profile_updated',
    userId: string,
    context?: LogContext
  ): void {
    this.info(`User ${event}`, {
      ...context,
      userId,
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
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    
    this[level](`API ${method} ${path} - ${statusCode} (${duration}ms)`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
      event: 'api_request'
    })
  }

  logSecurityEvent(
    event: 'auth_failed' | 'rate_limit_exceeded' | 'suspicious_activity' | 'unauthorized_access',
    context?: LogContext
  ): void {
    this.warn(`Security event: ${event}`, {
      ...context,
      event: `security_${event}`,
      security: true
    })
  }

  logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext
  ): void {
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
  if (!loggerInstance) {
    loggerInstance = new Logger()
  }
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

  static measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startTimer(name)
      try {
        const result = await fn()
        this.endTimer(name, context)
        resolve(result)
      } catch (error) {
        this.endTimer(name, { ...context, error: true })
        reject(error)
      }
    })
  }

  static measure<T>(
    name: string,
    fn: () => T,
    context?: LogContext
  ): T {
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
export function logError(error: Error, errorInfo?: any): void {
  getLogger().error('React error boundary caught error', error, {
    errorInfo,
    component: errorInfo?.componentStack,
    event: 'react_error'
  })
}

// API middleware for automatic logging
export function createAPILogger() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now()
    const requestId = Math.random().toString(36).substring(7)
    
    // Add request ID to headers
    res.setHeader('X-Request-ID', requestId)
    
    // Log request
    getLogger().debug(`API Request: ${req.method} ${req.path}`, {
      requestId,
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id
    })

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function(...args: any[]) {
      const duration = Date.now() - startTime
      
      getLogger().logAPIRequest(
        req.method,
        req.path,
        res.statusCode,
        duration,
        {
          requestId,
          userId: req.user?.id,
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.connection.remoteAddress
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
  details?: any
): void {
  const level = status === 'healthy' ? LogLevel.INFO : status === 'degraded' ? LogLevel.WARN : LogLevel.ERROR
  
  getLogger()[level](`Health check: ${service} is ${status}`, {
    service,
    status,
    details,
    event: 'health_check'
  })
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
  } else if (duration > 1000) { // Log slow queries
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

export default getLogger
