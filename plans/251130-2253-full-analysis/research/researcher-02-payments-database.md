# Payment Integration & Database Analysis
**Date:** 2025-11-30 | **Project:** rok-services | **Focus:** Payments & Schema

---

## DATABASE SCHEMA ASSESSMENT

### Payment Model Quality
**Strengths:**
- Proper foreign key relationships (booking FK with cascade handling)
- Good index strategy for query patterns: `[bookingId, status, createdAt, paymentGateway+status]`
- Decimal(12,2) for financial amounts (correct precision)
- Unique `paymentNumber` prevents duplication
- Adequate status tracking with `paidAt`, `refundedAt` timestamps

**Concerns:**
- **Missing index on `gatewayTransactionId`** - webhook lookups (line 88-90) will full scan if verifying via this field
- `failureReason` as String (unbounded) - no length constraint, risk of data bloat
- `gatewayResponse` stored as JSON without schema validation - no audit trail integrity
- **No database-level unique constraint on `gatewayTransactionId`** - possible duplicate webhook processing

### Booking-Payment Relationship
- Correctly normalized 1:N (one booking → multiple payments for retries)
- `paymentStatus` on Booking denormalized but reasonable for query performance
- Missing **payment reconciliation audit** model (no record of state transitions)

### WebhookEvent Model (line 378-397)
**Strengths:**
- Duplicate detection via unique `eventId`
- Retry logic with exponential backoff support (`nextRetryAt`)
- Proper indexing: `[provider+status, nextRetryAt, eventId]`

**Gaps:**
- No signature verification data stored - cannot replay audit
- `errorMessage` unbounded string risk

---

## PAYMENT INTEGRATION QUALITY

### PaymentService Analysis
**Good practices (src/services/payment.service.ts):**
- ✓ Ownership validation before payment retrieval (line 119)
- ✓ Idempotent payment creation check (line 31-34, prevents duplicate pending payments)
- ✓ Error handling with graceful status updates (line 71-77)
- ✓ Refund validation: only completed payments eligible (line 181-182)
- ✓ Booking state validation: prevents payment on cancelled/completed bookings (line 261-263)

**Critical Issues:**
- **SECURITY GAP**: `verifyPaymentCallback()` (line 83-94) casts callback data `as any` without signature verification
  - No HMAC/RSA validation before processing
  - Direct delegation to gateway handlers without pre-validation
  - Vulnerable to forged webhook attempts

- **MISSING**: Webhook signature verification before database update
  - MoMo, VNPay, ZaloPay all require signature validation per their docs
  - If not implemented in handlers, payment hijacking possible

- **REFUND LOGIC**: Line 219 updates refund amount without atomic transaction
  - Race condition if concurrent refund requests processed
  - No idempotency key for refund operations

### Payment Method Implementation
**Type-handling issue (lines 45-47, 295, 303, 311, 319):**
- Repetitive `typeof amount === 'number' ? amount : amount.toNumber()`
- Suggests inconsistent Decimal handling; should normalize on input

**Missing implementations:**
- No timeout handling for payment gateway calls (line 293-323)
- No circuit breaker pattern for failing gateways
- No rate limiting per user per day
- Banking transfer lacks webhook/automation (manual reconciliation only)

---

## SECURITY ASSESSMENT

### Critical (P0)

1. **Webhook Signature Validation Missing**
   - Lines 83-94: Delegates unvalidated callback data directly to handlers
   - Risk: Payment state manipulation without authorization
   - Fix: Validate HMAC/signature before `verifyPaymentCallback()` returns data

2. **Decimal Amount Type Inconsistency**
   - Lines 45-47, 295, 303, 311, 319: Repeated type guards
   - Risk: Silent truncation or precision loss in edge cases
   - Fix: Normalize Prisma Decimal → number at boundary; use consistent types

3. **Missing Transaction ID Uniqueness Constraint**
   - Schema: `gatewayTransactionId` not marked unique; webhook deduplication relies on WebhookEvent
   - Risk: Duplicate payment records if webhook processed twice
   - Fix: Add `@unique` constraint + check before Payment creation

### High (P1)

4. **Unbounded Error/Response Fields**
   - `failureReason`, `gatewayResponse` as String/Json without limits
   - Risk: Database bloat; injection vectors in gateway_response JSON
   - Fix: Add @db.VarChar(500) limit; validate JSON schema on insert

5. **No Audit Trail for Payment State Changes**
   - Service updates status without recording reason/actor
   - Risk: Cannot trace payment status changes; regulatory compliance gap
   - Fix: Create PaymentAuditLog model; log all transitions with timestamp/userId

6. **Concurrent Refund Processing Not Atomic**
   - Lines 215-223: Multiple sequential updates without transaction wrapper
   - Risk: Partial refund records; inconsistent state between Payment and booking
   - Fix: Wrap in Prisma transaction; add idempotency key field

### Medium (P2)

7. **Missing Payment Timeout Handling**
   - Service doesn't set expiry on pending payments
   - Risk: Stale pending payments block new attempts indefinitely
   - Fix: Add `expiresAt` field; cron job to expire/cancel old pending

8. **No Rate Limiting on Payment Attempts**
   - User can create unlimited payment attempts per booking
   - Risk: DOS via gateway API exhaustion
   - Fix: Add rate limiter; limit retries to 3 attempts per hour

9. **Booking State Race Condition**
   - Payment validation checks booking state (lines 238-265), but no SELECT FOR UPDATE
   - Risk: Concurrent booking status changes during payment processing
   - Fix: Use Prisma raw query with FOR UPDATE or optimistic locking

---

## PERFORMANCE BOTTLENECKS

### Query Analysis
| Operation | Current Index | Issue | Impact |
|-----------|---------------|-------|--------|
| `getPaymentById()` lookup | Primary key ✓ | Heavy join on booking→user→serviceTier | N+1 in bulk payment reports |
| Webhook processing | provider+status | Lookup by `gatewayTransactionId` unindexed | O(n) full scan per webhook |
| User payment history | Missing userId index | Filters via booking relation | Slow pagination for users with many bookings |
| Refund search | None | No index on refunded status | Full table scan for reconciliation reports |

**Recommendation:** Add missing indexes:
```sql
CREATE INDEX idx_payment_gateway_txn ON payments(gateway_transaction_id);
CREATE INDEX idx_payment_refunded_at ON payments(refunded_at) WHERE refunded_at IS NOT NULL;
CREATE INDEX idx_booking_user_status ON bookings(user_id, status, created_at);
```

---

## SQL INJECTION & DATA VALIDATION

**ORM Protection:**
- ✓ Prisma ORM prevents SQL injection on all queries (parameterized by default)
- ✓ Type safety via TypeScript

**Application Validation Gaps:**
- `verifyPaymentCallback()` casts callback as `any` (line 86-90) - no schema validation
- No Zod schema shown for payment input validation
- `gatewayResponse` JSON stored without JSON schema validation
- `failureReason` accepted without sanitization

**Fix Required:** Implement Zod schemas for all gateway callback types before processing.

---

## RECOMMENDATIONS (Priority Order)

### Immediate (Sprint 1)
1. **Add webhook signature validation** before `verifyPaymentCallback()` - implement HMAC check per gateway docs
2. **Create PaymentAuditLog model** + audit all state changes for compliance
3. **Add @unique constraint** on `gatewayTransactionId` + check logic
4. **Implement atomic refund transaction** wrapper using Prisma $transaction

### Short-term (Sprint 2)
5. Normalize Decimal handling; remove repetitive type guards
6. Add missing indexes on `gateway_transaction_id`, `refunded_at`
7. Implement payment expiry logic + cleanup cron
8. Add rate limiting: max 3 payment attempts/hour per user per booking
9. Implement SELECT FOR UPDATE on booking during payment state checks

### Medium-term (Sprint 3)
10. Add circuit breaker + timeout handling for payment gateway calls
11. Implement payment reconciliation report (daily: match DB vs gateway API)
12. Add comprehensive webhook retry metrics + dead-letter queue for failed webhooks
13. Schema validation for `gatewayResponse` JSON using Zod

---

## UNRESOLVED QUESTIONS

- Are webhook signature validations implemented in the individual gateway handler classes (momo.ts, vnpay.ts, zalopay.ts)? This analysis assumes they might be missing based on the service-level code.
- Is there a background job that expires stale pending payments? Not observed in schema/service.
- What is the SLA for webhook processing? High-priority for payment gateways (sub-second).
- Is there a reconciliation process comparing DB payment states vs. actual gateway API states daily?
