// Re-export Prisma generated types for use throughout the application
// This file bridges Prisma's generated types with the application code

import type { Prisma } from '@prisma/client'

// Export Prisma namespace types
export type { Prisma }

// Re-export model types from Prisma client
// These are inferred from the Prisma schema
export type User = Prisma.UserGetPayload<object>
export type Service = Prisma.ServiceGetPayload<object>
export type ServiceTier = Prisma.ServiceTierGetPayload<object>
export type Booking = Prisma.BookingGetPayload<object>
export type Payment = Prisma.PaymentGetPayload<object>
export type Communication = Prisma.CommunicationGetPayload<object>
export type Lead = Prisma.LeadGetPayload<object>
export type Staff = Prisma.StaffGetPayload<object>
export type Account = Prisma.AccountGetPayload<object>
export type Session = Prisma.SessionGetPayload<object>
export type VerificationToken = Prisma.VerificationTokenGetPayload<object>
export type SystemLog = Prisma.SystemLogGetPayload<object>
export type SecurityLog = Prisma.SecurityLogGetPayload<object>
export type AuditLog = Prisma.AuditLogGetPayload<object>
export type ServiceTask = Prisma.ServiceTaskGetPayload<object>
export type PasswordResetToken = Prisma.PasswordResetTokenGetPayload<object>
export type TwoFactorAuth = Prisma.TwoFactorAuthGetPayload<object>
export type FileUpload = Prisma.FileUploadGetPayload<object>
export type WebhookEvent = Prisma.WebhookEventGetPayload<object>
export type PasswordHistory = Prisma.PasswordHistoryGetPayload<object>

// Types with relations
export type UserWithStaff = Prisma.UserGetPayload<{
  include: { staffProfile: true }
}>

export type ServiceWithTiers = Prisma.ServiceGetPayload<{
  include: { serviceTiers: true }
}>

export type ServiceTierWithService = Prisma.ServiceTierGetPayload<{
  include: { service: true }
}>

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    user: true
    serviceTier: {
      include: { service: true }
    }
    payments: true
  }
}>

export type BookingWithUser = Prisma.BookingGetPayload<{
  include: { user: true }
}>

export type BookingWithServiceTier = Prisma.BookingGetPayload<{
  include: {
    serviceTier: {
      include: { service: true }
    }
  }
}>

export type PaymentWithBooking = Prisma.PaymentGetPayload<{
  include: {
    booking: {
      include: {
        user: true
        serviceTier: {
          include: { service: true }
        }
      }
    }
  }
}>

export type PaymentWithRelations = PaymentWithBooking

export type LeadWithUser = Prisma.LeadGetPayload<{
  include: { assignedUser: true }
}>

export type StaffWithUser = Prisma.StaffGetPayload<{
  include: { user: true }
}>

// Input types for queries
export type BookingWhereInput = Prisma.BookingWhereInput
export type BookingOrderByWithRelationInput = Prisma.BookingOrderByWithRelationInput
export type UserWhereInput = Prisma.UserWhereInput
export type ServiceWhereInput = Prisma.ServiceWhereInput
export type PaymentWhereInput = Prisma.PaymentWhereInput
export type LeadWhereInput = Prisma.LeadWhereInput

// Json input type
export type InputJsonValue = Prisma.InputJsonValue
export type JsonValue = Prisma.JsonValue

// Transaction isolation level
export type TransactionIsolationLevel = Prisma.TransactionIsolationLevel
