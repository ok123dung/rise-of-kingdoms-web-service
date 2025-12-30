/**
 * Webhook Processor Tests
 * Tests for webhook job management (processor and cleanup)
 */

import {
  startWebhookProcessor,
  stopWebhookProcessor,
  startWebhookCleanup,
  stopWebhookCleanup,
  startWebhookJobs,
  stopWebhookJobs,
  getWebhookService
} from '../processor'

// Mock WebhookRetryService
const mockProcessPendingWebhooks = jest.fn()
const mockCleanupOldWebhooks = jest.fn()

jest.mock('../retry-service', () => ({
  WebhookRetryService: jest.fn().mockImplementation(() => ({
    processPendingWebhooks: mockProcessPendingWebhooks,
    cleanupOldWebhooks: mockCleanupOldWebhooks
  }))
}))

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

describe('Webhook Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    // Stop any running processors/cleanups between tests
    stopWebhookProcessor()
    stopWebhookCleanup()
  })

  afterEach(() => {
    jest.useRealTimers()
    stopWebhookProcessor()
    stopWebhookCleanup()
  })

  describe('getWebhookService', () => {
    it('should return WebhookRetryService instance', async () => {
      const service = await getWebhookService()

      expect(service).toBeDefined()
      expect(service.processPendingWebhooks).toBeDefined()
      expect(service.cleanupOldWebhooks).toBeDefined()
    })

    it('should return same instance on subsequent calls (singleton)', async () => {
      const service1 = await getWebhookService()
      const service2 = await getWebhookService()

      expect(service1).toBe(service2)
    })
  })

  describe('startWebhookProcessor', () => {
    it('should process immediately on start', async () => {
      await startWebhookProcessor()

      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(1)
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Webhook processor started')
      )
    })

    it('should process at interval', async () => {
      await startWebhookProcessor(1000) // 1 second interval

      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)
      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(2)

      jest.advanceTimersByTime(1000)
      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(3)
    })

    it('should use default interval of 60 seconds', async () => {
      await startWebhookProcessor()

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook processor started with 60000ms interval'
      )
    })

    it('should warn if already running', async () => {
      await startWebhookProcessor()
      await startWebhookProcessor()

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Webhook processor already running'
      )
    })
  })

  describe('stopWebhookProcessor', () => {
    it('should stop the processor', async () => {
      await startWebhookProcessor(1000)

      jest.advanceTimersByTime(1000)
      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(2)

      stopWebhookProcessor()
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook processor stopped')

      jest.advanceTimersByTime(1000)
      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(2) // No more calls
    })

    it('should handle stopping when not running', () => {
      stopWebhookProcessor() // Should not throw
      expect(mockLogger.info).not.toHaveBeenCalledWith('Webhook processor stopped')
    })
  })

  describe('startWebhookCleanup', () => {
    it('should cleanup immediately on start', async () => {
      await startWebhookCleanup()

      expect(mockCleanupOldWebhooks).toHaveBeenCalledTimes(1)
      expect(mockCleanupOldWebhooks).toHaveBeenCalledWith(30)
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Webhook cleanup started')
      )
    })

    it('should cleanup at interval', async () => {
      await startWebhookCleanup(1000) // 1 second interval for testing

      expect(mockCleanupOldWebhooks).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)
      expect(mockCleanupOldWebhooks).toHaveBeenCalledTimes(2)
    })

    it('should use default interval of 24 hours', async () => {
      await startWebhookCleanup()

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook cleanup started with 86400000ms interval'
      )
    })

    it('should warn if already running', async () => {
      await startWebhookCleanup()
      await startWebhookCleanup()

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Webhook cleanup already running'
      )
    })
  })

  describe('stopWebhookCleanup', () => {
    it('should stop the cleanup', async () => {
      await startWebhookCleanup(1000)

      jest.advanceTimersByTime(1000)
      expect(mockCleanupOldWebhooks).toHaveBeenCalledTimes(2)

      stopWebhookCleanup()
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook cleanup stopped')

      jest.advanceTimersByTime(1000)
      expect(mockCleanupOldWebhooks).toHaveBeenCalledTimes(2) // No more calls
    })

    it('should handle stopping when not running', () => {
      stopWebhookCleanup() // Should not throw
      expect(mockLogger.info).not.toHaveBeenCalledWith('Webhook cleanup stopped')
    })
  })

  describe('startWebhookJobs', () => {
    it('should start both processor and cleanup', async () => {
      await startWebhookJobs()

      expect(mockProcessPendingWebhooks).toHaveBeenCalledTimes(1)
      expect(mockCleanupOldWebhooks).toHaveBeenCalledTimes(1)
    })
  })

  describe('stopWebhookJobs', () => {
    it('should stop both processor and cleanup', async () => {
      await startWebhookJobs()

      stopWebhookJobs()

      expect(mockLogger.info).toHaveBeenCalledWith('Webhook processor stopped')
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook cleanup stopped')
    })
  })
})
