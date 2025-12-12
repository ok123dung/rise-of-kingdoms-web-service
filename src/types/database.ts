// Database model type definitions based on Prisma schema
import type { Decimal, JsonValue } from '@prisma/client/runtime/library'

// Utility type for Prisma Decimal values
export type DecimalLike = number | Decimal | { toNumber: () => number }

// Re-export JsonValue from Prisma for consistency
export type { JsonValue }

export interface User {
  id: string
  email: string
  password: string
  fullName: string
  phone?: string | null
  discordUsername?: string | null
  rokPlayerId?: string | null
  rokKingdom?: string | null
  rokPower?: bigint | null
  status: string
  emailVerified?: Date | null
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  basePrice: DecimalLike
  currency: string
}

export interface ServiceTier {
  id: string
  serviceId: string
  name: string
  slug: string
  price: DecimalLike
  originalPrice?: DecimalLike | null
  features: JsonValue
  limitations?: JsonValue | null
  services: Service
}

export interface Booking {
  id: string
  bookingNumber: string
  userId: string
  serviceTierId: string
  status: string
  paymentStatus: string
  totalAmount: DecimalLike
  discountAmount: DecimalLike
  finalAmount: DecimalLike
  currency: string
  bookingDetails?: JsonValue | null
  customerRequirements?: string | null
  startDate?: Date | null
  endDate?: Date | null
  assignedStaffId?: string | null
  completionPercentage: number
  customerRating?: number | null
  customerFeedback?: string | null
  internalNotes?: string | null
  createdAt: Date
  updatedAt: Date
  user: User
  serviceTier: ServiceTier
}

export interface Payment {
  id: string
  bookingId: string
  paymentNumber: string
  amount: DecimalLike
  currency: string
  paymentMethod: string
  paymentGateway: string
  gatewayTransactionId?: string | null
  gatewayOrderId?: string | null
  status: string
  failureReason?: string | null
  gatewayResponse?: JsonValue | null
  paidAt?: Date | null
  refundedAt?: Date | null
  refundAmount: DecimalLike
  refundReason?: string | null
  createdAt: Date
  updatedAt: Date
  bookings?: Booking
}

export interface ServiceTask {
  id: string
  bookingId: string
  type: string
  title: string
  description?: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: string
  assignedTo?: string | null
  dueDate?: Date | null
  completedAt?: Date | null
  metadata?: JsonValue | null
  createdAt: Date
  updatedAt: Date
}

export interface BookingWithRelations extends Booking {
  payments?: Payment[]
  serviceTier: ServiceTier & {
    services: Service
  }
}

export interface PaymentWithBooking extends Payment {
  booking: BookingWithRelations
}

// Utility function to convert Decimal to number
export function toNumber(value: DecimalLike | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'toNumber' in value) return value.toNumber()
  return 0
}

// Type guards for JSON fields
export function isStringArray(value: JsonValue | null | undefined): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

export function parseFeatures(value: JsonValue | null | undefined): string[] {
  if (isStringArray(value)) return value
  return []
}
