/**
 * Unified Payment API
 * Single entry point for all payment operations
 */

import {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentVerification,
  WebhookPayload,
  PaymentProviderInterface
} from './types'
import { VNPayPayment } from './vnpay'
import { MoMoPayment } from './momo'
import { ZaloPayPayment } from './zalopay'
import { BankingTransfer } from './banking'

// Lazy-load providers to avoid initialization errors if config is missing
let providers: Map<PaymentProvider, PaymentProviderInterface> | null = null

function getProviders(): Map<PaymentProvider, PaymentProviderInterface> {
  if (!providers) {
    providers = new Map()

    // Wrap each provider initialization to handle missing config
    try {
      const vnpay = new VNPayPayment()
      providers.set('vnpay', vnpay as unknown as PaymentProviderInterface)
    } catch {
      console.warn('VNPay provider not configured')
    }

    try {
      const momo = new MoMoPayment()
      providers.set('momo', momo as unknown as PaymentProviderInterface)
    } catch {
      console.warn('MoMo provider not configured')
    }

    try {
      const zalopay = new ZaloPayPayment()
      providers.set('zalopay', zalopay as unknown as PaymentProviderInterface)
    } catch {
      console.warn('ZaloPay provider not configured')
    }

    try {
      const banking = new BankingTransfer()
      providers.set('banking', banking as unknown as PaymentProviderInterface)
    } catch {
      console.warn('Banking provider not configured')
    }
  }

  return providers
}

/**
 * Create a payment using specified provider
 */
export async function createPayment(
  provider: PaymentProvider,
  request: PaymentRequest
): Promise<PaymentResult> {
  const providerInstance = getProviders().get(provider)

  if (!providerInstance) {
    return {
      success: false,
      error: `Payment provider '${provider}' is not available`
    }
  }

  // Map to provider-specific method names
  if ('createPaymentUrl' in providerInstance) {
    const result = await (
      providerInstance as unknown as {
        createPaymentUrl: (req: PaymentRequest) => Promise<{
          success: boolean
          data?: { paymentUrl: string; orderId: string }
          error?: string
        }>
      }
    ).createPaymentUrl(request)

    return {
      success: result.success,
      paymentUrl: result.data?.paymentUrl,
      orderId: result.data?.orderId,
      error: result.error
    }
  }

  if ('createTransferOrder' in providerInstance) {
    const result = await (
      providerInstance as unknown as {
        createTransferOrder: (req: PaymentRequest) => Promise<{
          success: boolean
          data?: {
            transferCode: string
            bankAccounts: Array<{
              bankName: string
              accountNumber: string
              accountName: string
            }>
            amount: number
            transferContent: string
            expireTime: Date
          }
          error?: string
        }>
      }
    ).createTransferOrder(request)

    return {
      success: result.success,
      orderId: result.data?.transferCode,
      bankAccounts: result.data?.bankAccounts,
      transferContent: result.data?.transferContent,
      expireTime: result.data?.expireTime,
      error: result.error
    }
  }

  return providerInstance.createPayment(request)
}

/**
 * Verify payment status
 */
export async function verifyPayment(
  provider: PaymentProvider,
  orderId: string
): Promise<PaymentVerification> {
  const providerInstance = getProviders().get(provider)

  if (!providerInstance) {
    return {
      verified: false,
      status: 'failed',
      message: `Provider '${provider}' not available`
    }
  }

  // Map to provider-specific method names
  if ('queryPaymentStatus' in providerInstance) {
    const result = await (
      providerInstance as unknown as {
        queryPaymentStatus: (orderId: string) => Promise<{
          success: boolean
          data?: { status: string; transactionNo?: string }
          error?: string
        }>
      }
    ).queryPaymentStatus(orderId)

    return {
      verified: result.success && result.data?.status === 'completed',
      status:
        result.data?.status === 'completed'
          ? 'completed'
          : result.data?.status === 'pending'
            ? 'pending'
            : 'failed',
      transactionId: result.data?.transactionNo,
      message: result.error
    }
  }

  return providerInstance.verifyPayment(orderId)
}

/**
 * Handle webhook from payment provider
 */
export async function handleWebhook(
  provider: PaymentProvider,
  payload: unknown,
  signature?: string
): Promise<WebhookPayload> {
  const providerInstance = getProviders().get(provider)

  if (!providerInstance) {
    throw new Error(`Provider '${provider}' not available`)
  }

  // Map to provider-specific method names
  if ('verifyReturnData' in providerInstance) {
    const result = await (
      providerInstance as unknown as {
        verifyReturnData: (data: unknown) => Promise<{
          valid: boolean
          data: { orderId: string; status: string; amount: number }
        }>
      }
    ).verifyReturnData(payload)

    return {
      provider,
      orderId: result.data?.orderId ?? '',
      status: result.valid && result.data?.status === '00' ? 'completed' : 'failed',
      amount: result.data?.amount ?? 0,
      rawData: payload
    }
  }

  return providerInstance.handleWebhook(payload, signature)
}

/**
 * Get available payment providers
 */
export function getAvailableProviders(): PaymentProvider[] {
  return Array.from(getProviders().keys())
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(provider: PaymentProvider): boolean {
  return getProviders().has(provider)
}

// Re-export types
export * from './types'
