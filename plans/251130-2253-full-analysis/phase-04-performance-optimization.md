# Phase 4: Performance Optimization

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1](./phase-01-critical-security-fixes.md) (for unique constraint)
- **Research:** [Payments & Database](./research/researcher-02-payments-database.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-30 |
| Priority | P2 - Medium |
| Status | Pending |
| Est. Time | 2-3 days |

## Key Insights

1. Missing index on `gatewayTransactionId` - O(n) webhook lookups
2. No index on `refundedAt` - slow refund reconciliation
3. User payment history via booking relation - slow pagination
4. N+1 queries in payment reports

## Requirements

- Add missing database indexes
- Optimize critical query paths
- Add connection pooling configuration
- Implement query result caching where appropriate

---

## Database Index Analysis

### Current Indexes (Payment Model)

```prisma
@@index([bookingId])
@@index([status])
@@index([createdAt])
@@index([paymentGateway, status])
```

### Missing Indexes

| Operation | Current Index | Missing Index | Impact |
|-----------|---------------|---------------|--------|
| Webhook lookup by txn ID | None | `gatewayTransactionId` | O(n) -> O(1) |
| Refund reports | None | `refundedAt` partial | Full scan -> Index scan |
| User payment history | Via booking FK | Composite | Slow for heavy users |
| Payment reconciliation | None | `status, paidAt` | Report generation slow |

---

## Implementation Steps

### Step 1: Add Missing Payment Indexes

```prisma
model Payment {
  // ... existing fields

  @@index([bookingId])
  @@index([status])
  @@index([createdAt])
  @@index([paymentGateway, status])
  // New indexes
  @@index([gatewayTransactionId])
  @@index([status, paidAt])
  @@map("payments")
}
```

### Step 2: Add Partial Index for Refunds

```sql
-- Migration: add_refund_index
CREATE INDEX idx_payment_refunded ON payments(refunded_at)
WHERE refunded_at IS NOT NULL;
```

In Prisma (workaround using raw SQL in migration):

```typescript
// prisma/migrations/XXXXXXXX_add_performance_indexes/migration.sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_gateway_txn
ON payments(gateway_transaction_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_refunded
ON payments(refunded_at) WHERE refunded_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_status_paid
ON payments(status, paid_at);
```

### Step 3: Add User-Booking Index

```prisma
model Booking {
  // ... existing

  @@index([userId, status])
  @@index([status, createdAt])
  @@index([paymentStatus])
  @@index([assignedStaffId, status])
  @@index([serviceTierId])
  // New: User payment history optimization
  @@index([userId, paymentStatus, createdAt])
  @@map("bookings")
}
```

---

## Query Optimizations

### Optimize User Payment History

**Current (N+1 prone):**
```typescript
const payments = await prisma.payment.findMany({
  where: { booking: { userId } },
  include: {
    booking: {
      include: { serviceTier: { include: { service: true } } }
    }
  }
})
```

**Optimized (single query with selection):**
```typescript
const payments = await prisma.$queryRaw`
  SELECT
    p.*,
    b.booking_number,
    b.status as booking_status,
    st.name as tier_name,
    s.name as service_name
  FROM payments p
  JOIN bookings b ON p.booking_id = b.id
  JOIN service_tiers st ON b.service_tier_id = st.id
  JOIN services s ON st.service_id = s.id
  WHERE b.user_id = ${userId}
  ORDER BY p.created_at DESC
  LIMIT ${limit} OFFSET ${offset}
`
```

### Optimize Webhook Lookup

**Current:**
```typescript
const payment = await prisma.payment.findFirst({
  where: { gatewayTransactionId: txnId }
})
```

**After Index:** Same query, but O(1) instead of O(n).

### Optimize Payment Reports

```typescript
// Daily payment summary - optimized with index
const summary = await prisma.payment.groupBy({
  by: ['status', 'paymentGateway'],
  where: {
    createdAt: {
      gte: startOfDay,
      lt: endOfDay
    }
  },
  _sum: { amount: true },
  _count: true
})
```

---

## Connection Pooling

### Current State

Default Prisma connection pool - may not be optimized for serverless.

### Configuration

```typescript
// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// For serverless (Vercel)
// DATABASE_URL should include:
// ?pgbouncer=true&connection_limit=1

// For Prisma Accelerate (recommended)
// Use Prisma Data Proxy URL
```

### Environment Configuration

```bash
# .env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://..." # For migrations
```

---

## Caching Strategy

### Payment Status Cache

For frequently checked payment statuses:

```typescript
// src/lib/cache/payment-cache.ts
import { LRUCache } from 'lru-cache'

const paymentStatusCache = new LRUCache<string, string>({
  max: 1000,
  ttl: 30 * 1000 // 30 seconds
})

export async function getPaymentStatus(paymentId: string): Promise<string> {
  const cached = paymentStatusCache.get(paymentId)
  if (cached) return cached

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { status: true }
  })

  if (payment) {
    paymentStatusCache.set(paymentId, payment.status)
  }

  return payment?.status ?? 'unknown'
}

export function invalidatePaymentCache(paymentId: string) {
  paymentStatusCache.delete(paymentId)
}
```

### Service Tier Cache

Static data that rarely changes:

```typescript
// src/lib/cache/service-cache.ts
const serviceTierCache = new LRUCache<string, ServiceTier>({
  max: 100,
  ttl: 5 * 60 * 1000 // 5 minutes
})
```

---

## Related Files

- `prisma/schema.prisma` - Schema changes
- `prisma/migrations/` - New migration
- `src/services/payment.service.ts` - Query updates
- `src/lib/cache/` - New cache utilities

---

## Todo List

- [ ] Add missing indexes
  - [ ] Add gatewayTransactionId index
  - [ ] Add refundedAt partial index
  - [ ] Add status+paidAt index
  - [ ] Add userId+paymentStatus+createdAt index
- [ ] Create migration
  - [ ] Use CONCURRENTLY for zero-downtime
  - [ ] Test on staging first
  - [ ] Document rollback procedure
- [ ] Optimize queries
  - [ ] Refactor getUserPayments
  - [ ] Optimize payment reports
  - [ ] Add query explain analysis
- [ ] Configure connection pooling
  - [ ] Update DATABASE_URL for pgbouncer
  - [ ] Consider Prisma Accelerate
- [ ] Implement caching
  - [ ] Add payment status cache
  - [ ] Add service tier cache
  - [ ] Add cache invalidation

---

## Success Criteria

- [ ] Webhook lookup < 10ms (from 100ms+)
- [ ] User payment history < 50ms
- [ ] Refund reports < 100ms
- [ ] No N+1 queries in critical paths
- [ ] Connection pool properly configured

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Index creation locks table | High | Use CONCURRENTLY |
| Cache invalidation missed | Medium | TTL fallback, eventual consistency |
| Connection pool exhaustion | High | Monitor, adjust limits |

## Performance Monitoring

Add query timing logs:

```typescript
const start = performance.now()
const result = await prisma.payment.findMany(...)
const duration = performance.now() - start

if (duration > 100) {
  logger.warn('Slow query', { duration, query: 'findMany payments' })
}
```

## Next Steps

After completion, proceed to [Phase 5: Testing Coverage](./phase-05-testing-coverage.md)
