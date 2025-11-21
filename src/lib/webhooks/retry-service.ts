import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { emitWebSocketEvent } from '@/lib/websocket/init'

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
  async storeWebhookEvent(provider: string, eventType: string, eventId: string, payload: any) {
    try {
      // Check if event already exists
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId }
      })

      if (existingEvent) {
        getLogger().info('Webhook event already exists', { eventId })
        return existingEvent
      }

      // Create new event
      const event = await prisma.webhookEvent.create({
        data: {
          provider,
          eventType,
          eventId,
          payload,
          status: 'pending',
          attempts: 0
        }
      })

      getLogger().info('Webhook event stored', {
        eventId,
        provider,
        eventType
      })

      return event
    } catch (error) {
      getLogger().error('Failed to store webhook event', error as Error)
      throw error
    }
  }

  // Process webhook event
  async processWebhookEvent(eventId: string): Promise<boolean> {
    try {
      const event = await prisma.webhookEvent.findUnique({
        where: { eventId }
      })

      if (!event) {
        getLogger().error('Webhook event not found', new Error('Event not found'), { eventId })
        return false
      }

      if (event.status === 'completed') {
        getLogger().info('Webhook event already processed', { eventId })
        return true
      }

      if (event.status === 'failed' && event.attempts >= this.config.maxAttempts) {
        getLogger().error(
          'Webhook event exceeded max attempts',
          new Error('Max attempts exceeded'),
          { eventId }
        )
        return false
      }

      // Update status to processing
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: {
          status: 'processing',
          lastAttemptAt: new Date()
        }
      })

      // Process based on provider and event type
      const success = await this.handleWebhookEvent(event)

      if (success) {
        // Mark as completed
        await prisma.webhookEvent.update({
          where: { id: event.id },
          data: {
            status: 'completed',
            processedAt: new Date()
          }
        })

        getLogger().info('Webhook event processed successfully', { eventId })
        return true
      } else {
        // Schedule retry
        await this.scheduleRetry(event)
        return false
      }
    } catch (error) {
      getLogger().error('Failed to process webhook event', error as Error)

      // Update error status
      await prisma.webhookEvent.update({
        where: { eventId },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      return false
    }
  }

  // Handle specific webhook event
  private async handleWebhookEvent(event: any): Promise<boolean> {
    try {
      switch (event.provider) {
        case 'momo':
          return await this.handleMoMoWebhook(event)
        case 'zalopay':
          return await this.handleZaloPayWebhook(event)
        case 'vnpay':
          return await this.handleVNPayWebhook(event)
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
  private async handleMoMoWebhook(event: any): Promise<boolean> {
    try {
      const { payload } = event

      // Extract payment info
      const { orderId, requestId, amount, resultCode, message, transId } = payload

      if (resultCode !== 0) {
        getLogger().warn('MoMo payment failed', { orderId, message })
        return true // Don't retry failed payments
      }

      // Find payment by order ID
      const payment = await prisma.payment.findFirst({
        where: {
          paymentNumber: orderId,
          paymentMethod: 'momo'
        },
        include: {
          booking: {
            include: {
              user: true
            }
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
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gatewayTransactionId: transId,
            gatewayResponse: {
              momoRequestId: requestId,
              momoMessage: message,
              momoTransId: transId
            }
          }
        })

        // Update booking payment status
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'paid' }
        })
      })

      // Send real-time notification (outside transaction)
      emitWebSocketEvent('user', payment.booking.userId, 'payment:completed', {
        paymentId: payment.id,
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
  private async handleZaloPayWebhook(event: any): Promise<boolean> {
    try {
      const { payload } = event

      const { app_trans_id, zp_trans_id, status, amount } = payload

      if (status !== 1) {
        getLogger().warn('ZaloPay payment failed', { app_trans_id })
        return true
      }

      const payment = await prisma.payment.findFirst({
        where: {
          paymentNumber: app_trans_id,
          paymentMethod: 'zalopay'
        },
        include: {
          booking: {
            include: {
              user: true
            }
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
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gatewayTransactionId: zp_trans_id,
            gatewayResponse: {
              zaloPayTransId: zp_trans_id,
              appTransId: app_trans_id,
              status
            }
          }
        })

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'paid' }
        })
      })

      // Send real-time notification (outside transaction)
      emitWebSocketEvent('user', payment.booking.userId, 'payment:completed', {
        paymentId: payment.id,
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
  private async handleVNPayWebhook(event: any): Promise<boolean> {
    try {
      const { payload } = event

      const { vnp_TxnRef, vnp_TransactionNo, vnp_ResponseCode, vnp_Amount } = payload

      if (vnp_ResponseCode !== '00') {
        getLogger().warn('VNPay payment failed', { vnp_TxnRef })
        return true
      }

      const payment = await prisma.payment.findFirst({
        where: {
          paymentNumber: vnp_TxnRef,
          paymentMethod: 'vnpay'
        },
        include: {
          booking: {
            include: {
              user: true
            }
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
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            gatewayTransactionId: vnp_TransactionNo,
            gatewayResponse: {
              vnpayTransactionNo: vnp_TransactionNo,
              vnpTxnRef: vnp_TxnRef,
              vnpResponseCode: vnp_ResponseCode
            }
          }
        })

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'paid' }
        })
      })

      // Send real-time notification (outside transaction)
      emitWebSocketEvent('user', payment.booking.userId, 'payment:completed', {
        paymentId: payment.id,
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
  private async scheduleRetry(event: any) {
    const attempts = event.attempts + 1
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempts - 1),
      this.config.maxDelay
    )

    const nextRetryAt = new Date(Date.now() + delay)

    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: attempts >= this.config.maxAttempts ? 'failed' : 'pending',
        attempts,
        nextRetryAt: attempts < this.config.maxAttempts ? nextRetryAt : null,
        errorMessage: `Retry scheduled for ${nextRetryAt.toISOString()}`
      }
    })

    getLogger().info('Webhook retry scheduled', {
      eventId: event.eventId,
      attempts,
      nextRetryAt: nextRetryAt?.toISOString()
    })
  }

  // Process pending webhooks (run this in a cron job)
  async processPendingWebhooks() {
    try {
      const now = new Date()

      const pendingEvents = await prisma.webhookEvent.findMany({
        where: {
          status: 'pending',
          OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
          attempts: { lt: this.config.maxAttempts }
        },
        orderBy: { createdAt: 'asc' },
        take: 10 // Process 10 at a time
      })

      getLogger().info(`Processing ${pendingEvents.length} pending webhooks`)

      const results = await Promise.allSettled(
        pendingEvents.map(event => this.processWebhookEvent(event.eventId))
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
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const deleted = await prisma.webhookEvent.deleteMany({
        where: {
          status: { in: ['completed', 'failed'] },
          createdAt: { lt: cutoffDate }
        }
      })

      getLogger().info(`Cleaned up ${deleted.count} old webhook events`)
    } catch (error) {
      getLogger().error('Failed to cleanup old webhooks', error as Error)
    }
  }
}
