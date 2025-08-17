import { WebhookRetryService } from './retry-service'
import { getLogger } from '@/lib/monitoring/logger'

let processorInterval: NodeJS.Timeout | null = null
let cleanupInterval: NodeJS.Timeout | null = null

const webhookService = new WebhookRetryService({
  maxAttempts: 5,
  initialDelay: 60000, // 1 minute
  maxDelay: 3600000, // 1 hour
  backoffMultiplier: 2
})

export function startWebhookProcessor(intervalMs: number = 60000) {
  if (processorInterval) {
    getLogger().warn('Webhook processor already running')
    return
  }

  // Process immediately on start
  webhookService.processPendingWebhooks()

  // Set up interval
  processorInterval = setInterval(() => {
    webhookService.processPendingWebhooks()
  }, intervalMs)

  getLogger().info(`Webhook processor started with ${intervalMs}ms interval`)
}

export function stopWebhookProcessor() {
  if (processorInterval) {
    clearInterval(processorInterval)
    processorInterval = null
    getLogger().info('Webhook processor stopped')
  }
}

export function startWebhookCleanup(intervalMs: number = 86400000) { // 24 hours
  if (cleanupInterval) {
    getLogger().warn('Webhook cleanup already running')
    return
  }

  // Cleanup immediately on start
  webhookService.cleanupOldWebhooks(30)

  // Set up interval
  cleanupInterval = setInterval(() => {
    webhookService.cleanupOldWebhooks(30)
  }, intervalMs)

  getLogger().info(`Webhook cleanup started with ${intervalMs}ms interval`)
}

export function stopWebhookCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
    getLogger().info('Webhook cleanup stopped')
  }
}

// Start all webhook jobs
export function startWebhookJobs() {
  startWebhookProcessor()
  startWebhookCleanup()
}

// Stop all webhook jobs
export function stopWebhookJobs() {
  stopWebhookProcessor()
  stopWebhookCleanup()
}

// Export service instance for direct use
export { webhookService }