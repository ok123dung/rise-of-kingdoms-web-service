/**
 * Edge Logger Tests
 * Tests for edge-compatible logger
 */

import { getEdgeLogger } from '../edge-logger'

describe('EdgeLogger', () => {
  const originalEnv = process.env
  let consoleSpy: {
    log: jest.SpyInstance
    error: jest.SpyInstance
    warn: jest.SpyInstance
    debug: jest.SpyInstance
  }

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation()
    }
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    jest.restoreAllMocks()
    process.env = originalEnv
  })

  describe('getEdgeLogger', () => {
    it('should return logger object with all methods', () => {
      const logger = getEdgeLogger()

      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('debug')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })
  })

  describe('info', () => {
    it('should log info message', () => {
      const logger = getEdgeLogger()
      logger.info('Test info message')

      expect(consoleSpy.log).toHaveBeenCalled()
      const loggedMessage = consoleSpy.log.mock.calls[0][0]
      expect(loggedMessage).toContain('INFO')
      expect(loggedMessage).toContain('Test info message')
    })

    it('should include timestamp', () => {
      const logger = getEdgeLogger()
      logger.info('Test message')

      const loggedMessage = consoleSpy.log.mock.calls[0][0]
      expect(loggedMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should include context when provided', () => {
      const logger = getEdgeLogger()
      logger.info('Test message', { user_id: 'user-123', action: 'login' })

      const loggedMessage = consoleSpy.log.mock.calls[0][0]
      expect(loggedMessage).toContain('user_id')
      expect(loggedMessage).toContain('user-123')
    })
  })

  describe('error', () => {
    it('should log error message', () => {
      const logger = getEdgeLogger()
      logger.error('Test error message')

      expect(consoleSpy.error).toHaveBeenCalled()
      const loggedMessage = consoleSpy.error.mock.calls[0][0]
      expect(loggedMessage).toContain('ERROR')
      expect(loggedMessage).toContain('Test error message')
    })

    it('should include error details when provided', () => {
      const logger = getEdgeLogger()
      const error = new Error('Something went wrong')
      logger.error('Test error', error)

      const loggedMessage = consoleSpy.error.mock.calls[0][0]
      expect(loggedMessage).toContain('Something went wrong')
    })

    it('should include context when provided', () => {
      const logger = getEdgeLogger()
      logger.error('Test error', undefined, { request_id: 'req-456' })

      const loggedMessage = consoleSpy.error.mock.calls[0][0]
      expect(loggedMessage).toContain('request_id')
      expect(loggedMessage).toContain('req-456')
    })

    it('should handle error and context together', () => {
      const logger = getEdgeLogger()
      const error = new Error('DB connection failed')
      logger.error('Database error', error, { database: 'postgres' })

      const loggedMessage = consoleSpy.error.mock.calls[0][0]
      expect(loggedMessage).toContain('DB connection failed')
      expect(loggedMessage).toContain('database')
    })
  })

  describe('warn', () => {
    it('should log warning message', () => {
      const logger = getEdgeLogger()
      logger.warn('Test warning message')

      expect(consoleSpy.warn).toHaveBeenCalled()
      const loggedMessage = consoleSpy.warn.mock.calls[0][0]
      expect(loggedMessage).toContain('WARN')
      expect(loggedMessage).toContain('Test warning message')
    })

    it('should include context when provided', () => {
      const logger = getEdgeLogger()
      logger.warn('Rate limit approaching', { remaining: 10, limit: 100 })

      const loggedMessage = consoleSpy.warn.mock.calls[0][0]
      expect(loggedMessage).toContain('remaining')
    })
  })

  describe('debug', () => {
    it('should log debug message in development', () => {
      process.env.NODE_ENV = 'development'
      const logger = getEdgeLogger()
      logger.debug('Debug message')

      expect(consoleSpy.debug).toHaveBeenCalled()
      const loggedMessage = consoleSpy.debug.mock.calls[0][0]
      expect(loggedMessage).toContain('DEBUG')
    })

    it('should not log debug message in production', () => {
      process.env.NODE_ENV = 'production'
      const logger = getEdgeLogger()
      logger.debug('Debug message')

      expect(consoleSpy.debug).not.toHaveBeenCalled()
    })

    it('should include context in debug logs', () => {
      process.env.NODE_ENV = 'development'
      const logger = getEdgeLogger()
      logger.debug('Debug details', { step: 1, total: 5 })

      const loggedMessage = consoleSpy.debug.mock.calls[0][0]
      expect(loggedMessage).toContain('step')
    })
  })

  describe('message formatting', () => {
    it('should format message with all components', () => {
      const logger = getEdgeLogger()
      const error = new Error('Test error')
      logger.error('Failed operation', error, { operation: 'save', entity: 'user' })

      const loggedMessage = consoleSpy.error.mock.calls[0][0]

      // Check timestamp format
      expect(loggedMessage).toMatch(/^\[/)
      // Check level
      expect(loggedMessage).toContain('ERROR')
      // Check message
      expect(loggedMessage).toContain('Failed operation')
      // Check error
      expect(loggedMessage).toContain('Test error')
      // Check context
      expect(loggedMessage).toContain('Context:')
    })

    it('should handle empty context', () => {
      const logger = getEdgeLogger()
      logger.info('Simple message', {})

      const loggedMessage = consoleSpy.log.mock.calls[0][0]
      expect(loggedMessage).toContain('Context: {}')
    })

    it('should handle non-Error objects in error field', () => {
      const logger = getEdgeLogger()
      logger.error('Error occurred', 'string error' as unknown as Error)

      const loggedMessage = consoleSpy.error.mock.calls[0][0]
      expect(loggedMessage).toContain('string error')
    })
  })
})
