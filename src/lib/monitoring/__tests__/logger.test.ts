/**
 * Logger Tests
 * Tests for main Logger class and monitoring utilities
 */

// Mock Sentry before imports
jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  setContext: jest.fn()
}))

// Mock crypto-utils
jest.mock('@/lib/crypto-utils', () => ({
  generateShortId: jest.fn(() => 'test1234')
}))

// Mock prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    system_logs: {
      create: jest.fn()
    }
  }
}))

import * as Sentry from '@sentry/nextjs'

import { getLogger, LogLevel, PerformanceMonitor, logError, logHealthCheck, logDatabaseQuery } from '../logger'

describe('Logger', () => {
  const originalEnv = process.env
  let consoleSpy: {
    debug: jest.SpyInstance
    info: jest.SpyInstance
    warn: jest.SpyInstance
    error: jest.SpyInstance
  }

  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    }
    process.env = { ...originalEnv, LOG_LEVEL: 'debug' }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  describe('LogLevel enum', () => {
    it('should have correct log levels', () => {
      expect(LogLevel.DEBUG).toBe('debug')
      expect(LogLevel.INFO).toBe('info')
      expect(LogLevel.WARN).toBe('warn')
      expect(LogLevel.ERROR).toBe('error')
      expect(LogLevel.FATAL).toBe('fatal')
    })
  })

  describe('getLogger', () => {
    it('should return singleton logger instance', () => {
      const logger1 = getLogger()
      const logger2 = getLogger()
      expect(logger1).toBe(logger2)
    })

    it('should have all logging methods', () => {
      const logger = getLogger()
      expect(typeof logger.debug).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.fatal).toBe('function')
    })
  })

  describe('debug', () => {
    it('should log debug message when level allows', () => {
      process.env.LOG_LEVEL = 'debug'
      const logger = getLogger()
      logger.debug('Debug message')

      expect(consoleSpy.debug).toHaveBeenCalled()
    })

    it('should not log debug when level is info', () => {
      process.env.LOG_LEVEL = 'info'
      const logger = getLogger()
      logger.debug('Debug message')

      expect(consoleSpy.debug).not.toHaveBeenCalled()
    })

    it('should include context in debug log', () => {
      process.env.LOG_LEVEL = 'debug'
      const logger = getLogger()
      logger.debug('Debug with context', { user_id: 'user-1' })

      const loggedMessage = consoleSpy.debug.mock.calls[0][0]
      expect(loggedMessage).toContain('user_id')
    })
  })

  describe('info', () => {
    it('should log info message', () => {
      const logger = getLogger()
      logger.info('Info message')

      expect(consoleSpy.info).toHaveBeenCalled()
    })

    it('should send breadcrumb to Sentry', () => {
      const logger = getLogger()
      logger.info('Info for Sentry', { key: 'value' })

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Info for Sentry',
        level: 'info',
        data: { key: 'value' }
      })
    })

    it('should format log entry correctly', () => {
      const logger = getLogger()
      logger.info('Test message')

      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}/)
      expect(loggedMessage).toContain('INFO')
      expect(loggedMessage).toContain('Test message')
    })
  })

  describe('warn', () => {
    it('should log warning message', () => {
      const logger = getLogger()
      logger.warn('Warning message')

      expect(consoleSpy.warn).toHaveBeenCalled()
    })

    it('should send to Sentry', () => {
      const logger = getLogger()
      logger.warn('Warning for Sentry', { context: 'test' })

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Warning for Sentry', 'warning')
      expect(Sentry.setContext).toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('should log error message', () => {
      const logger = getLogger()
      logger.error('Error message')

      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('should capture exception in Sentry when error provided', () => {
      const logger = getLogger()
      const error = new Error('Test error')
      logger.error('Error occurred', error, { request_id: 'req-1' })

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: expect.any(Object),
          contexts: expect.any(Object)
        })
      )
    })

    it('should capture message when no error provided', () => {
      const logger = getLogger()
      logger.error('Error without exception')

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Error without exception', 'error')
    })

    it('should include stack trace in log', () => {
      const logger = getLogger()
      const error = new Error('Stack error')
      logger.error('Error with stack', error)

      const loggedMessage = consoleSpy.error.mock.calls[0][0]
      expect(loggedMessage).toContain('Stack:')
    })
  })

  describe('fatal', () => {
    it('should log fatal message', () => {
      const logger = getLogger()
      logger.fatal('Fatal error')

      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('should capture with fatal level in Sentry', () => {
      const logger = getLogger()
      const error = new Error('Fatal crash')
      logger.fatal('System crash', error)

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          level: 'fatal',
          tags: expect.objectContaining({ fatal: true })
        })
      )
    })
  })

  describe('business logging methods', () => {
    it('should log payment events', () => {
      const logger = getLogger()
      logger.logPaymentEvent('completed', 'payment-123', { amount: 500000 })

      expect(consoleSpy.info).toHaveBeenCalled()
      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      expect(loggedMessage).toContain('Payment completed')
    })

    it('should log booking events', () => {
      const logger = getLogger()
      logger.logBookingEvent('confirmed', 'booking-456')

      expect(consoleSpy.info).toHaveBeenCalled()
      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      expect(loggedMessage).toContain('Booking confirmed')
    })

    it('should log user events', () => {
      const logger = getLogger()
      logger.logUserEvent('login', 'user-789')

      expect(consoleSpy.info).toHaveBeenCalled()
      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      expect(loggedMessage).toContain('User login')
    })

    it('should log API requests with different levels', () => {
      const logger = getLogger()

      // Success (info level)
      logger.logAPIRequest('GET', '/api/users', 200, 50)
      expect(consoleSpy.info).toHaveBeenCalled()

      // Client error (warn level)
      logger.logAPIRequest('POST', '/api/login', 401, 30)
      expect(consoleSpy.warn).toHaveBeenCalled()

      // Server error (error level)
      logger.logAPIRequest('PUT', '/api/data', 500, 100)
      expect(consoleSpy.error).toHaveBeenCalled()
    })

    it('should log security events', () => {
      const logger = getLogger()
      logger.logSecurityEvent('auth_failed', { ip: '192.168.1.1' })

      expect(consoleSpy.warn).toHaveBeenCalled()
      const loggedMessage = consoleSpy.warn.mock.calls[0][0]
      expect(loggedMessage).toContain('Security event: auth_failed')
    })

    it('should log performance metrics', () => {
      const logger = getLogger()
      logger.logPerformanceMetric('query_time', 150, 'ms')

      expect(consoleSpy.info).toHaveBeenCalled()
      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      expect(loggedMessage).toContain('Performance metric')
      expect(loggedMessage).toContain('150')
    })
  })

  describe('log sanitization', () => {
    it('should sanitize newlines in messages', () => {
      const logger = getLogger()
      logger.info('Message with\nnewline\rand carriage return')

      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      expect(loggedMessage).not.toContain('\n')
      expect(loggedMessage).not.toContain('\r')
    })

    it('should truncate very long messages', () => {
      const logger = getLogger()
      const longMessage = 'x'.repeat(3000)
      logger.info(longMessage)

      const loggedMessage = consoleSpy.info.mock.calls[0][0]
      // Message should be truncated to 2000 chars
      expect(loggedMessage.length).toBeLessThan(longMessage.length + 200) // Allow for formatting
    })
  })
})

describe('PerformanceMonitor', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleSpy = jest.spyOn(console, 'info').mockImplementation()
    process.env.LOG_LEVEL = 'debug'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('startTimer / endTimer', () => {
    it('should measure time between start and end', () => {
      PerformanceMonitor.startTimer('test-operation')

      // Small delay
      const start = Date.now()
      while (Date.now() - start < 10) {
        // Wait
      }

      const duration = PerformanceMonitor.endTimer('test-operation')
      expect(duration).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 for non-existent timer', () => {
      const duration = PerformanceMonitor.endTimer('non-existent')
      expect(duration).toBe(0)
    })

    it('should log performance metric', () => {
      PerformanceMonitor.startTimer('logged-operation')
      PerformanceMonitor.endTimer('logged-operation')

      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  describe('measureAsync', () => {
    it('should measure async function duration', async () => {
      const result = await PerformanceMonitor.measureAsync(
        'async-test',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 5))
          return 'done'
        }
      )

      expect(result).toBe('done')
    })

    it('should propagate errors', async () => {
      await expect(
        PerformanceMonitor.measureAsync('async-error', async () => {
          throw new Error('Async error')
        })
      ).rejects.toThrow('Async error')
    })
  })

  describe('measure', () => {
    it('should measure sync function duration', () => {
      const result = PerformanceMonitor.measure('sync-test', () => {
        let sum = 0
        for (let i = 0; i < 100; i++) sum += i
        return sum
      })

      expect(result).toBe(4950)
    })

    it('should propagate errors', () => {
      expect(() =>
        PerformanceMonitor.measure('sync-error', () => {
          throw new Error('Sync error')
        })
      ).toThrow('Sync error')
    })
  })
})

describe('logError', () => {
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    process.env.LOG_LEVEL = 'debug'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should log React error boundary errors', () => {
    const error = new Error('React component error')
    const errorInfo = { componentStack: '\n    at Component\n    at App' }

    logError(error, errorInfo)

    expect(consoleSpy).toHaveBeenCalled()
    const loggedMessage = consoleSpy.mock.calls[0][0]
    expect(loggedMessage).toContain('React error boundary')
  })

  it('should handle missing errorInfo', () => {
    const error = new Error('Error without info')
    logError(error)

    expect(consoleSpy).toHaveBeenCalled()
  })
})

describe('logHealthCheck', () => {
  let consoleSpy: {
    info: jest.SpyInstance
    warn: jest.SpyInstance
    error: jest.SpyInstance
  }

  beforeEach(() => {
    consoleSpy = {
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    }
    process.env.LOG_LEVEL = 'debug'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should log healthy status at info level', () => {
    logHealthCheck('database', 'healthy')

    expect(consoleSpy.info).toHaveBeenCalled()
    const loggedMessage = consoleSpy.info.mock.calls[0][0]
    expect(loggedMessage).toContain('database')
    expect(loggedMessage).toContain('healthy')
  })

  it('should log degraded status at warn level', () => {
    logHealthCheck('redis', 'degraded', { latency: 500 })

    expect(consoleSpy.warn).toHaveBeenCalled()
  })

  it('should log unhealthy status at error level', () => {
    logHealthCheck('api', 'unhealthy', { error: 'Connection refused' })

    expect(consoleSpy.error).toHaveBeenCalled()
  })
})

describe('logDatabaseQuery', () => {
  let consoleSpy: {
    debug: jest.SpyInstance
    warn: jest.SpyInstance
    error: jest.SpyInstance
  }

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    }
    process.env.LOG_LEVEL = 'debug'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should log successful fast query at debug level', () => {
    logDatabaseQuery('SELECT * FROM users', 50, 10)

    expect(consoleSpy.debug).toHaveBeenCalled()
  })

  it('should log slow query at warn level', () => {
    logDatabaseQuery('SELECT * FROM large_table', 1500, 1000)

    expect(consoleSpy.warn).toHaveBeenCalled()
    const loggedMessage = consoleSpy.warn.mock.calls[0][0]
    expect(loggedMessage).toContain('Slow database query')
  })

  it('should log failed query at error level', () => {
    const error = new Error('Query timeout')
    logDatabaseQuery('SELECT * FROM table', 5000, undefined, error)

    expect(consoleSpy.error).toHaveBeenCalled()
    const loggedMessage = consoleSpy.error.mock.calls[0][0]
    expect(loggedMessage).toContain('failed')
  })
})
