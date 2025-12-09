import { getLogger } from '@/lib/monitoring/logger'

import type { WebhookRetryService } from './retry-service'

let processorInterval: NodeJS.Timeout | null = null
let cleanupInterval: NodeJS.Timeout | null = null

// Lazy instantiation to avoid module-level side effects during build
let _webhookService: WebhookRetryService | null = null

async function getWebhookService(): Promise<WebhookRetryService> {
  if (!_webhookService) {
    const { WebhookRetryService } = await import('./retry-service')
    _webhookService = new WebhookRetryService({
      maxAttempts: 5,
      initialDelay: 60000, // 1 minute
      maxDelay: 3600000, // 1 hour
      backoffMultiplier: 2
    })
  }
  return _webhookService
}

export async function startWebhookProcessor(intervalMs = 60000) {
  if (processorInterval) {
    getLogger().warn('Webhook processor already running')
    return
  }

  const webhookService = await getWebhookService()

  // Process immediately on start
  void webhookService.processPendingWebhooks()

  // Set up interval
  processorInterval = setInterval(() => {
    void webhookService.processPendingWebhooks()
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

export async function startWebhookCleanup(intervalMs = 86400000) {
  // 24 hours
  if (cleanupInterval) {
    getLogger().warn('Webhook cleanup already running')
    return
  }

  const webhookService = await getWebhookService()

  // Cleanup immediately on start
  void webhookService.cleanupOldWebhooks(30)

  // Set up interval
  cleanupInterval = setInterval(() => {
    void webhookService.cleanupOldWebhooks(30)
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
export async function startWebhookJobs() {
  await startWebhookProcessor()
  await startWebhookCleanup()
}

// Stop all webhook jobs
export function stopWebhookJobs() {
  stopWebhookProcessor()
  stopWebhookCleanup()
}

// Export lazy getter for direct use
export { getWebhookService }
