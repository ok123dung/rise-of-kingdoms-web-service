// Re-export Prisma generated types for use throughout the application
// This file bridges Prisma's generated types with the application code

import type { Prisma } from '@prisma/client'

// Export Prisma namespace types
export type { Prisma }

// Re-export model types from Prisma client
// These are inferred from the Prisma schema
export type User = Prisma.usersGetPayload<object>
export type Service = Prisma.servicesGetPayload<object>
export type ServiceTier = Prisma.service_tiersGetPayload<object>
export type Booking = Prisma.bookingsGetPayload<object>
export type Payment = Prisma.paymentsGetPayload<object>
export type Communication = Prisma.communicationsGetPayload<object>
export type Lead = Prisma.leadsGetPayload<object>
export type Staff = Prisma.staffGetPayload<object>
export type Account = Prisma.accountsGetPayload<object>
export type Session = Prisma.sessionsGetPayload<object>
export type VerificationToken = Prisma.verification_tokensGetPayload<object>
export type SystemLog = Prisma.system_logsGetPayload<object>
export type SecurityLog = Prisma.security_logsGetPayload<object>
export type AuditLog = Prisma.audit_logsGetPayload<object>
export type ServiceTask = Prisma.service_tasksGetPayload<object>
export type PasswordResetToken = Prisma.password_reset_tokensGetPayload<object>
export type TwoFactorAuth = Prisma.two_factor_authGetPayload<object>
export type FileUpload = Prisma.file_uploadsGetPayload<object>
export type WebhookEvent = Prisma.webhook_eventsGetPayload<object>
export type PasswordHistory = Prisma.password_historyGetPayload<object>

// Types with relations
export type UserWithStaff = Prisma.usersGetPayload<{
  include: { staff: true }
}>

export type ServiceWithTiers = Prisma.servicesGetPayload<{
  include: { service_tiers: true }
}>

export type ServiceTierWithService = Prisma.service_tiersGetPayload<{
  include: { services: true }
}>

export type BookingWithRelations = Prisma.bookingsGetPayload<{
  include: {
    users: true
    service_tiers: {
      include: { services: true }
    }
    payments: true
  }
}>

export type BookingWithUser = Prisma.bookingsGetPayload<{
  include: { users: true }
}>

export type BookingWithServiceTier = Prisma.bookingsGetPayload<{
  include: {
    service_tiers: {
      include: { services: true }
    }
  }
}>

export type PaymentWithBooking = Prisma.paymentsGetPayload<{
  include: {
    bookings: {
      include: {
        users: true
        service_tiers: {
          include: { services: true }
        }
      }
    }
  }
}>

export type PaymentWithRelations = PaymentWithBooking

export type LeadWithUser = Prisma.leadsGetPayload<{
  include: { users: true }
}>

export type StaffWithUser = Prisma.staffGetPayload<{
  include: { users: true }
}>

// Input types for queries
export type BookingWhereInput = Prisma.bookingsWhereInput
export type BookingOrderByWithRelationInput = Prisma.bookingsOrderByWithRelationInput
export type UserWhereInput = Prisma.usersWhereInput
export type ServiceWhereInput = Prisma.servicesWhereInput
export type PaymentWhereInput = Prisma.paymentsWhereInput
export type LeadWhereInput = Prisma.leadsWhereInput

// Json input type
export type InputJsonValue = Prisma.InputJsonValue
export type JsonValue = Prisma.JsonValue

// Transaction isolation level
export type TransactionIsolationLevel = Prisma.TransactionIsolationLevel
