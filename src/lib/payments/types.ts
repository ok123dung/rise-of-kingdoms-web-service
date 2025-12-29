/**
 * Unified Payment Types
 * Shared type definitions across all payment providers
 */

export type PaymentProvider = 'vnpay' | 'momo' | 'zalopay' | 'banking' | 'vietqr'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface PaymentRequest {
  booking_id: string
  amount: number
  orderInfo?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  returnUrl?: string
  metadata?: Record<string, unknown>
}

export interface PaymentResult {
  success: boolean
  orderId?: string
  transactionId?: string
  paymentUrl?: string
  qrCode?: string
  qrDataUrl?: string
  bankAccounts?: BankAccount[]
  transferContent?: string
  expireTime?: Date
  error?: string
}

export interface PaymentVerification {
  verified: boolean
  status: PaymentStatus
  amount?: number
  transactionId?: string
  paidAt?: Date
  message?: string
}

export interface WebhookPayload {
  provider: PaymentProvider
  orderId: string
  transactionId?: string
  amount: number
  status: PaymentStatus
  rawData: unknown
}

export interface BankAccount {
  bankName: string
  accountNumber: string
  accountName: string
  branch?: string
}

/**
 * Payment Provider Interface
 * All payment providers must implement this interface
 */
export interface PaymentProviderInterface {
  readonly name: PaymentProvider

  /**
   * Create a payment and return payment URL or QR code
   */
  createPayment(request: PaymentRequest): Promise<PaymentResult>

  /**
   * Verify payment status
   */
  verifyPayment(orderId: string): Promise<PaymentVerification>

  /**
   * Handle webhook/IPN callback
   */
  handleWebhook(payload: unknown, signature?: string): Promise<WebhookPayload>

  /**
   * Check if provider is configured and ready
   */
  isConfigured(): boolean
}

/**
 * Payment configuration per provider
 */
export interface PaymentConfig {
  vnpay?: {
    tmnCode: string
    hashSecret: string
    url: string
  }
  momo?: {
    partnerCode: string
    accessKey: string
    secretKey: string
  }
  zalopay?: {
    appId: string
    key1: string
    key2: string
  }
  banking?: {
    accounts: BankAccount[]
  }
}
