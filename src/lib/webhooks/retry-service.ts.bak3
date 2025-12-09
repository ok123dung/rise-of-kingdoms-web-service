import { getLogger } from '@/lib/monitoring/logger'

// Lazy imports to avoid module-level side effects during build
let _prisma: Awaited<typeof import('@/lib/db')>['prisma'] | null = null
let _emitWebSocketEvent:
  | Awaited<typeof import('@/lib/websocket/init')>['emitWebSocketEvent']
  | null = null

async function getPrisma() {
  if (!_prisma) {
    const { prisma } = await import('@/lib/db')
    _prisma = prisma
  }
  return _prisma
}

async function getEmitWebSocketEvent() {
  if (!_emitWebSocketEvent) {
    const { emitWebSocketEvent } = await import('@/lib/websocket/init')
    _emitWebSocketEvent = emitWebSocketEvent
  }
  return _emitWebSocketEvent
}

export interface WebhookRetryConfig {
  maxAttempts: number
  initialDelay: number // in ms
  maxDelay: number // in ms
  backoffMultiplier: number
}

const DEFAULT_CONFIG: WebhookRetryConfig = {
  maxAttempts: 5,
  initialDelay: 60000, // 1 minute
  maxDelay: 3600000, // 1 hour
  backoffMultiplier: 2
}

export class WebhookRetryService {
  private config: WebhookRetryConfig

  constructor(config: Partial<WebhookRetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // Store webhook event for processing
  async storeWebhookEvent(
    provider: string,
    event_type: string,
    event_id: string,
    payload: Record<string, unknown>
  ) {
    const prisma = await getPrisma()
    try {
      // Check if event already exists
      const existingEvent = await prisma.webhook_events.findUnique({
        where: { event_id }
      })

      if (existingEvent) {
        getLogger().info('Webhook event already exists', { event_id })
        return existingEvent
      }

      // Create new event
      const event = await prisma.webhook_events.create({
        data: {
          id: crypto.randomUUID(),
          provider,
          event_type,
          event_id,
          payload: JSON.parse(JSON.stringify(payload)) as Record<string, unknown>,
          status: 'pending',
          attempts: 0,
          updated_at: new Date()
        }
      })

      getLogger().info('Webhook event stored', {
        event_id,
        provider,
        event_type
      })

      return event
    } catch (error) {
      getLogger().error('Failed to store webhook event', error as Error)
      throw error
    }
  }

  // Process webhook event
  async processWebhookEvent(event_id: string): Promise<boolean> {
    const prisma = await getPrisma()
    try {
      const event = await prisma.webhook_events.findUnique({
        where: { event_id }
      })

      if (!event) {
        getLogger().error('Webhook event not found', new Error('Event not found'), { event_id })
        return false
      }

      if (event.status === 'completed') {
        getLogger().info('Webhook event already processed', { event_id })
        return true
      }

      if (event.status === 'failed' && event.attempts >= this.config.maxAttempts) {
        getLogger().error(
          'Webhook event exceeded max attempts',
          new Error('Max attempts exceeded'),
          { event_id }
        )
        return false
      }

      // Update status to processing
      await prisma.webhook_events.update({
        where: { id: event.id },
        data: {
          status: 'processing',
          last_attempt_at: new Date()
        }
      })

      // Process based on provider and event type
      const success = await this.handleWebhookEvent(event)

      if (success) {
        // Mark as completed
        await prisma.webhook_events.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            processed_at: new Date()
          }
        })

        getLogger().info('Webhook event processed successfully', { event_id })
        return true
      } else {
        // Schedule retry
        await this.scheduleRetry(event)
        return false
      }
    } catch (error) {
      getLogger().error('Failed to process webhook event', error as Error)

      // Update error status
      await prisma.webhook_events.update({
        where: { event_id },
        data: {
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return false
    }
  }

  // Handle specific webhook event
  private async handleWebhookEvent(event: {
    provider: string
    payload: unknown
    id: string
    event_id: string
    attempts: number
  }): Promise<boolean> {
    const eventWithPayload = { payload: event.payload as Record<string, unknown> }
    try {
      switch (event.provider) {
        case 'momo':
          return await this.handleMoMoWebhook(eventWithPayload)
        case 'zalopay':
          return await this.handleZaloPayWebhook(eventWithPayload)
        case 'vnpay':
          return await this.handleVNPayWebhook(eventWithPayload)
        default:
          getLogger().error('Unknown webhook provider', new Error('Unknown provider'), {
            provider: event.provider
          })
          return false
      }
    } catch (error) {
      getLogger().error('Webhook handler error', error as Error)
      return false
    }
  }

  // Handle MoMo webhook
  private async handleMoMoWebhook(event: { payload: Record<string, unknown> }): Promise<boolean> {
    const prisma = await getPrisma()
    try {
      const { payload } = event

      // Extract payment info
      const orderId = payload.orderId as string
      const requestId = payload.requestId as string
      const _amount = payload.amount as number
      const resultCode = payload.resultCode as number
      const message = payload.message as string
      const transId = payload.transId as string

      if (resultCode !== 0) {
        getLogger().warn('MoMo payment failed', { orderId, message })
        return true // Don't retry failed payments
      }

      // Find payment by order ID
      const payment = await prisma.payments.findFirst({
        where: {
          payment_number: orderId,
          payment_method: 'momo'
        },
        include: {
          bookings: {
            include: { users: true }
          }
        }
      })

      if (!payment) {
        getLogger().error('Payment not found for MoMo webhook', new Error('Payment not found'), {
          orderId
        })
        return false // Retry later
      }

      // Use transaction to ensure atomicity
      await prisma.$transaction(async tx => {
        // Update payment status
        await tx.payments.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gateway_transaction_id: transId,
            gateway_response: {
              momoRequestId: requestId,
              momoMessage: message,
              momoTransId: transId
            }
          }
        })

        // Update booking payment status
        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: { payment_status: 'paid' }
        })
      })

      // Send real-time notification (outside transaction)
      const emitWebSocketEvent = await getEmitWebSocketEvent()
      emitWebSocketEvent('user', payment.bookings.user_id, 'payment:completed', {
        payment_id: payment.id,
        amount: payment.amount,
        method: 'MoMo'
      })

      getLogger().info('MoMo payment processed', { orderId, transId })
      return true
    } catch (error) {
      getLogger().error('MoMo webhook processing error', error as Error)
      return false
    }
  }

  // Handle ZaloPay webhook
  private async handleZaloPayWebhook(event: {
    payload: Record<string, unknown>
  }): Promise<boolean> {
    const prisma = await getPrisma()
    try {
      const { payload } = event

      const app_trans_id = payload.app_trans_id as string
      const zp_trans_id = payload.zp_trans_id as string
      const status = payload.status as number
      const _amount = payload.amount as number

      if (status !== 1) {
        getLogger().warn('ZaloPay payment failed', { app_trans_id })
        return true
      }

      const payment = await prisma.payments.findFirst({
        where: {
          payment_number: app_trans_id,
          payment_method: 'zalopay'
        },
        include: {
          bookings: {
            include: { users: true }
          }
        }
      })

      if (!payment) {
        getLogger().error('Payment not found for ZaloPay webhook', new Error('Payment not found'), {
          app_trans_id
        })
        return false
      }

      // Use transaction to ensure atomicity
      await prisma.$transaction(async tx => {
        await tx.payments.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gateway_transaction_id: zp_trans_id,
            gateway_response: {
              zaloPayTransId: zp_trans_id,
              appTransId: app_trans_id,
              status
            }
          }
        })

        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: { payment_status: 'paid' }
        })
      })

      // Send real-time notification (outside transaction)
      const emitWebSocketEvent = await getEmitWebSocketEvent()
      emitWebSocketEvent('user', payment.bookings.user_id, 'payment:completed', {
        payment_id: payment.id,
        amount: payment.amount,
        method: 'ZaloPay'
      })

      getLogger().info('ZaloPay payment processed', { app_trans_id, zp_trans_id })
      return true
    } catch (error) {
      getLogger().error('ZaloPay webhook processing error', error as Error)
      return false
    }
  }

  // Handle VNPay webhook
  private async handleVNPayWebhook(event: { payload: Record<string, unknown> }): Promise<boolean> {
    const prisma = await getPrisma()
    try {
      const { payload } = event

      const vnp_TxnRef = payload.vnp_TxnRef as string
      const vnp_TransactionNo = payload.vnp_TransactionNo as string
      const vnp_ResponseCode = payload.vnp_ResponseCode as string
      const _vnp_Amount = payload.vnp_Amount as number

      if (vnp_ResponseCode !== '00') {
        getLogger().warn('VNPay payment failed', { vnp_TxnRef })
        return true
      }

      const payment = await prisma.payments.findFirst({
        where: {
          payment_number: vnp_TxnRef,
          payment_method: 'vnpay'
        },
        include: {
          bookings: {
            include: { users: true }
          }
        }
      })

      if (!payment) {
        getLogger().error('Payment not found for VNPay webhook', new Error('Payment not found'), {
          vnp_TxnRef
        })
        return false
      }

      // Use transaction to ensure atomicity
      await prisma.$transaction(async tx => {
        await tx.payments.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gateway_transaction_id: vnp_TransactionNo,
            gateway_response: {
              vnpayTransactionNo: vnp_TransactionNo,
              vnpTxnRef: vnp_TxnRef,
              vnpResponseCode: vnp_ResponseCode
            }
          }
        })

        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: { payment_status: 'paid' }
        })
      })

      // Send real-time notification (outside transaction)
      const emitWebSocketEvent = await getEmitWebSocketEvent()
      emitWebSocketEvent('user', payment.bookings.user_id, 'payment:completed', {
        payment_id: payment.id,
        amount: payment.amount,
        method: 'VNPay'
      })

      getLogger().info('VNPay payment processed', { vnp_TxnRef, vnp_TransactionNo })
      return true
    } catch (error) {
      getLogger().error('VNPay webhook processing error', error as Error)
      return false
    }
  }

  // Schedule retry for failed webhook
  private async scheduleRetry(event: { id: string; event_id: string; attempts: number }) {
    const prisma = await getPrisma()
    const attempts = event.attempts + 1
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempts - 1),
      this.config.maxDelay
    )

    const next_retry_at = new Date(Date.now() + delay)

    await prisma.webhook_events.update({
      where: { id: event.id },
      data: {
        status: attempts >= this.config.maxAttempts ? 'failed' : 'pending',
        attempts,
        next_retry_at: attempts < this.config.maxAttempts ? next_retry_at : null,
        error_message: `Retry scheduled for ${next_retry_at.toISOString()}`
      }
    })

    getLogger().info('Webhook retry scheduled', {
      event_id: event.event_id,
      attempts,
      next_retry_at: next_retry_at?.toISOString()
    })
  }

  // Process pending webhooks (run this in a cron job)
  async processPendingWebhooks() {
    const prisma = await getPrisma()
    try {
      const now = new Date()

      const pendingEvents = await prisma.webhook_events.findMany({
        where: {
          status: 'pending',
          OR: [{ next_retry_at: null }, { next_retry_at: { lte: now } }],
          attempts: { lt: this.config.maxAttempts }
        },
        orderBy: { created_at: 'asc' },
        take: 10 // Process 10 at a time
      })

      getLogger().info(`Processing ${pendingEvents.length} pending webhooks`)

      const results = await Promise.allSettled(
        pendingEvents.map(event => this.processWebhookEvent(event.event_id))
      )

      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length
      const failed = results.filter(r => r.status === 'rejected' || !r.value).length

      getLogger().info('Webhook processing completed', { successful, failed })
    } catch (error) {
      getLogger().error('Failed to process pending webhooks', error as Error)
    }
  }

  // Clean up old completed/failed webhooks
  async cleanupOldWebhooks(daysToKeep = 30) {
    const prisma = await getPrisma()
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const deleted = await prisma.webhook_events.deleteMany({
        where: {
          status: { in: ['completed', 'failed'] },
          created_at: { lt: cutoffDate }
        }
      })

      getLogger().info(`Cleaned up ${deleted.count} old webhook events`)
    } catch (error) {
      getLogger().error('Failed to cleanup old webhooks', error as Error)
    }
  }
}
