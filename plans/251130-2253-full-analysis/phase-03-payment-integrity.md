# Phase 3: Payment Integrity

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1](./phase-01-critical-security-fixes.md), [Phase 2](./phase-02-security-hardening.md)
- **Research:** [Payments & Database](./research/researcher-02-payments-database.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-30 |
| Priority | P1 - High |
| Status | Pending |
| Est. Time | 4-5 days |

## Key Insights

1. Refund processing not atomic - race conditions possible
2. No audit trail for payment state changes - compliance gap
3. No payment timeout/expiry handling - stale pending payments
4. No rate limiting on payment attempts per user
5. Booking state race condition during payment

## Requirements

- Wrap refund operations in Prisma transactions
- Create PaymentAuditLog model for state transitions
- Add payment expiry mechanism with cleanup cron
- Rate limit payment attempts (3/hour per user per booking)
- Use optimistic locking for booking state checks

---

## Issue 9: Non-Atomic Refund Processing

### Current Code

```typescript
// src/services/payment.service.ts:215-223
const updated = await prisma.payment.update({
  where: { id: paymentId },
  data: {
    refundAmount: data.amount,
    refundedAt: new Date(),
    refundReason: data.reason,
    status: 'refunded'
  }
})
// Booking update separate - race condition!
```

### Related Files

- `src/services/payment.service.ts`
- `prisma/schema.prisma`

### Implementation Steps

1. Add idempotency key field to Payment model:

```prisma
model Payment {
  // ...
  refundIdempotencyKey String? @unique @map("refund_idempotency_key")
  // ...
}
```

2. Wrap refund in transaction:

```typescript
async processRefund(paymentId: string, data: RefundData): Promise<Payment> {
  const idempotencyKey = `refund_${paymentId}_${Date.now()}`

  return await prisma.$transaction(async (tx) => {
    // Check idempotency
    const existing = await tx.payment.findFirst({
      where: { refundIdempotencyKey: data.idempotencyKey }
    })
    if (existing) return existing

    // Lock payment row
    const payment = await tx.payment.findUnique({
      where: { id: paymentId }
    })

    if (payment.status !== 'completed') {
      throw new ValidationError('Only completed payments can be refunded')
    }

    // Process refund with gateway...
    const refundResult = await this.processGatewayRefund(payment, data)

    // Update payment
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: {
        refundAmount: data.amount,
        refundedAt: new Date(),
        refundReason: data.reason,
        refundIdempotencyKey: data.idempotencyKey,
        status: 'refunded'
      }
    })

    // Update booking in same transaction
    await tx.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'refunded' }
    })

    // Create audit log
    await tx.paymentAuditLog.create({
      data: {
        paymentId,
        action: 'refund',
        previousStatus: 'completed',
        newStatus: 'refunded',
        amount: data.amount,
        reason: data.reason,
        performedBy: data.adminId,
        metadata: refundResult
      }
    })

    return updated
  })
}
```

---

## Issue 10: Missing Payment Audit Trail

### Current State

Payment status changes without recording actor, reason, or timestamp.

### Related Files

- `prisma/schema.prisma`
- `src/services/payment.service.ts`

### Implementation Steps

1. Create PaymentAuditLog model:

```prisma
model PaymentAuditLog {
  id             String   @id @default(cuid())
  paymentId      String   @map("payment_id")
  action         String   // created, processing, completed, failed, refunded
  previousStatus String?  @map("previous_status")
  newStatus      String   @map("new_status")
  amount         Decimal? @db.Decimal(12, 2)
  reason         String?  @db.VarChar(500)
  performedBy    String?  @map("performed_by")
  ipAddress      String?  @map("ip_address")
  metadata       Json?
  createdAt      DateTime @default(now()) @map("created_at")
  payment        Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)

  @@index([paymentId, createdAt])
  @@index([action, createdAt])
  @@map("payment_audit_logs")
}

model Payment {
  // ... existing fields
  auditLogs PaymentAuditLog[]
}
```

2. Create audit logging utility:

```typescript
// src/services/payment-audit.service.ts
export async function logPaymentChange(
  tx: Prisma.TransactionClient,
  data: {
    paymentId: string
    action: string
    previousStatus?: string
    newStatus: string
    amount?: number
    reason?: string
    performedBy?: string
    ipAddress?: string
    metadata?: any
  }
) {
  await tx.paymentAuditLog.create({ data })
}
```

3. Integrate audit logging in all payment state changes

---

## Issue 11: Missing Payment Timeout Handling

### Current State

Pending payments never expire, blocking new attempts indefinitely.

### Related Files

- `prisma/schema.prisma`
- `src/services/payment.service.ts`
- `src/app/api/cron/` (needs new cron job)

### Implementation Steps

1. Add expiry field to Payment:

```prisma
model Payment {
  // ...
  expiresAt DateTime? @map("expires_at")
  // ...
  @@index([status, expiresAt])
}
```

2. Set expiry on payment creation (15 minutes):

```typescript
const payment = await prisma.payment.create({
  data: {
    // ...
    expiresAt: new Date(Date.now() + 15 * 60 * 1000)
  }
})
```

3. Create cleanup cron job:

```typescript
// src/app/api/cron/expire-payments/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expired = await prisma.payment.updateMany({
    where: {
      status: 'pending',
      expiresAt: { lt: new Date() }
    },
    data: {
      status: 'expired',
      failureReason: 'Payment expired'
    }
  })

  return Response.json({ expired: expired.count })
}
```

4. Update `checkExistingPayment` to ignore expired:

```typescript
private async checkExistingPayment(bookingId: string): Promise<boolean> {
  const count = await prisma.payment.count({
    where: {
      bookingId,
      status: { in: ['pending', 'processing'] },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  })
  return count > 0
}
```

---

## Issue 12: No Rate Limiting on Payment Attempts

### Current State

Users can create unlimited payment attempts per booking.

### Related Files

- `src/services/payment.service.ts`
- `src/lib/rate-limit.ts`
- `src/app/api/payments/create/route.ts`

### Implementation Steps

1. Add payment-specific rate limiter:

```typescript
// src/lib/rate-limit-payments.ts
import { RateLimiter } from './rate-limit'

export const paymentAttemptLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  keyGenerator: (req, bookingId, userId) => `payment:${userId}:${bookingId}`
})
```

2. Check rate limit before creating payment:

```typescript
async createPayment(data: CreatePaymentData) {
  // Rate limit check
  const rateLimitKey = `payment:${data.userId}:${data.bookingId}`
  const isAllowed = await paymentAttemptLimiter.check(rateLimitKey)
  if (!isAllowed) {
    throw new TooManyRequestsError('Too many payment attempts. Try again in 1 hour.')
  }

  // Continue with payment creation...
}
```

3. Track attempts in database for persistence:

```prisma
model PaymentAttempt {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  bookingId String   @map("booking_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, bookingId, createdAt])
  @@map("payment_attempts")
}
```

---

## Issue 13: Booking State Race Condition

### Current Code

```typescript
// src/services/payment.service.ts:261-263
if (['cancelled', 'completed'].includes(booking.status)) {
  throw new ValidationError('Cannot create payment for this booking')
}
// No lock - status can change between check and payment creation
```

### Related Files

- `src/services/payment.service.ts`

### Implementation Steps

1. Use optimistic locking with version field:

```prisma
model Booking {
  // ...
  version Int @default(0)
  // ...
}
```

2. Or use SELECT FOR UPDATE (raw query):

```typescript
private async validateBookingWithLock(
  bookingId: string,
  userId: string
): Promise<Booking> {
  return await prisma.$transaction(async (tx) => {
    // Lock the row
    const [booking] = await tx.$queryRaw<Booking[]>`
      SELECT * FROM bookings
      WHERE id = ${bookingId}
      FOR UPDATE
    `

    if (!booking) throw new NotFoundError('Booking')
    if (booking.userId !== userId) throw new ValidationError('Unauthorized')
    if (booking.paymentStatus === 'completed') throw new ValidationError('Already paid')
    if (['cancelled', 'completed'].includes(booking.status)) {
      throw new ValidationError('Cannot create payment')
    }

    return booking
  })
}
```

---

## Architecture: Payment Flow

```
User Request
     |
     v
Rate Limit Check ---- Exceeded ---> 429 Error
     |
     v
Booking Lock (FOR UPDATE)
     |
     v
Validate State
     |
     v
Create Payment (with expiry)
     |
     v
Log Audit Entry
     |
     v
Process Gateway
     |
     v
Return Payment URL
```

---

## Todo List

- [ ] Fix refund atomicity (Issue 9)
  - [ ] Add idempotency key field
  - [ ] Wrap refund in transaction
  - [ ] Update booking in same transaction
  - [ ] Add tests
- [ ] Create payment audit trail (Issue 10)
  - [ ] Create PaymentAuditLog model
  - [ ] Create migration
  - [ ] Add audit logging utility
  - [ ] Integrate in all state changes
- [ ] Implement payment expiry (Issue 11)
  - [ ] Add expiresAt field
  - [ ] Set expiry on creation
  - [ ] Create cleanup cron
  - [ ] Configure Vercel cron
  - [ ] Update existing payment check
- [ ] Add payment rate limiting (Issue 12)
  - [ ] Create payment rate limiter
  - [ ] Add PaymentAttempt tracking
  - [ ] Apply to createPayment
- [ ] Fix booking race condition (Issue 13)
  - [ ] Choose locking strategy
  - [ ] Implement SELECT FOR UPDATE
  - [ ] Add tests

---

## Success Criteria

- [ ] Concurrent refund requests handled correctly
- [ ] All payment state changes audited
- [ ] Stale pending payments auto-expire
- [ ] Max 3 payment attempts per hour enforced
- [ ] No race condition in booking validation
- [ ] All tests pass

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Transaction deadlocks | High | Use consistent lock ordering |
| Cron job fails silently | Medium | Add monitoring, alerts |
| Rate limit too aggressive | Medium | Make configurable, log rejections |

## Security Considerations

- Audit logs immutable (no DELETE, no UPDATE)
- Cron endpoint protected by secret
- Rate limit keyed to authenticated user
- Transaction isolation level appropriate for finance

## Next Steps

After completion, proceed to [Phase 4: Performance Optimization](./phase-04-performance-optimization.md)
