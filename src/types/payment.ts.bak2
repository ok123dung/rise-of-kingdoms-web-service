// Payment-related type definitions

export interface PaymentResponse {
  transactionId: string
  amount: number
  booking_id: string
  method: 'momo' | 'zalopay' | 'vnpay' | 'banking'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  timestamp?: string
  reference?: string
}

export interface PaymentError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface BankingInfo {
  bankName: string
  accountNumber: string
  accountName: string
  amount: number
  transferContent: string
  qrCode?: string
}

export interface PaymentCallbackData {
  transactionId: string
  amount: number
  status: string
  method: string
  [key: string]: unknown
}

export interface PaymentVerificationResult {
  verified: boolean
  transactionId?: string
  amount?: number
  status?: string
  message?: string
}
