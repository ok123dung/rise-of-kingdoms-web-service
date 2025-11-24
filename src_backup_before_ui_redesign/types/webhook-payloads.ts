/**
 * Webhook Payload Type Definitions
 *
 * This file contains TypeScript interfaces for all payment gateway webhook payloads.
 * These types replace the usage of `any` types throughout the webhook handling code.
 */

/**
 * VNPay Webhook Payload
 * Documentation: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/
 */
export interface VNPayWebhookParams {
  vnp_TmnCode: string
  vnp_Amount: string // Amount in VND cents (multiply by 100)
  vnp_BankCode?: string
  vnp_BankTranNo?: string
  vnp_CardType?: string
  vnp_PayDate: string // Format: yyyyMMddHHmmss
  vnp_OrderInfo: string
  vnp_TransactionNo: string
  vnp_ResponseCode: string // "00" = success
  vnp_TransactionStatus: string
  vnp_TxnRef: string // Order ID
  vnp_SecureHashType?: string
  vnp_SecureHash?: string
  [key: string]: string | undefined // Allow other vnp_* parameters
}

/**
 * MoMo Webhook Payload
 * Documentation: https://developers.momo.vn/v3/
 */
export interface MoMoWebhookPayload {
  partnerCode: string
  orderId: string
  requestId: string
  amount: number
  orderInfo: string
  orderType: string
  transId: string // MoMo transaction ID
  resultCode: number // 0 = success
  message: string
  payType: string
  responseTime: number // Timestamp in milliseconds
  extraData: string
  signature: string
}

/**
 * ZaloPay Webhook Payload (parsed from data field)
 * Documentation: https://docs.zalopay.vn/
 */
export interface ZaloPayWebhookData {
  app_id: number
  app_trans_id: string // Our order ID
  app_user: string
  app_time: number // Timestamp in milliseconds
  embed_data: string // JSON string with additional data
  item: string // JSON array of items
  amount: number
  discount_amount?: number
  zp_trans_id: string // ZaloPay transaction ID
  server_time: number // Timestamp in milliseconds
  channel: number
  merchant_user_id?: string
  user_fee_amount?: number
  status: number // 1 = success, 2 = failed, 3 = processing
}

/**
 * ZaloPay Webhook Request (form data)
 */
export interface ZaloPayWebhookRequest {
  data: string // JSON string of ZaloPayWebhookData
  mac: string // HMAC signature
}

/**
 * ZaloPay Embed Data (parsed from embed_data field)
 */
export interface ZaloPayEmbedData {
  bookingId: string
  redirecturl?: string
  [key: string]: unknown
}

/**
 * Generic Webhook Event (stored in database)
 */
export interface WebhookEventData {
  id: string
  provider: 'vnpay' | 'momo' | 'zalopay'
  eventType: string
  eventId: string
  payload: VNPayWebhookParams | MoMoWebhookPayload | ZaloPayWebhookData
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  lastAttemptAt?: Date
  nextRetryAt?: Date
  processedAt?: Date
  errorMessage?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

/**
 * Payment Gateway Response Types
 */
export interface PaymentGatewayResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Type guards for webhook payloads
 */
export function isVNPayWebhookParams(payload: unknown): payload is VNPayWebhookParams {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'vnp_TxnRef' in payload &&
    'vnp_Amount' in payload &&
    'vnp_ResponseCode' in payload
  )
}

export function isMoMoWebhookPayload(payload: unknown): payload is MoMoWebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'orderId' in payload &&
    'transId' in payload &&
    'resultCode' in payload &&
    'signature' in payload
  )
}

export function isZaloPayWebhookData(payload: unknown): payload is ZaloPayWebhookData {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'app_trans_id' in payload &&
    'zp_trans_id' in payload &&
    'status' in payload
  )
}

/**
 * Webhook Processing Result
 */
export interface WebhookProcessingResult {
  success: boolean
  message: string
  eventId?: string
  retryable?: boolean
  error?: Error
}
