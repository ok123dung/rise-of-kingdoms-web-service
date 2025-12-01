# Phase 5: Testing Coverage

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phases 1-4 (features must exist to test)
- **Research:** Both research reports

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-30 |
| Priority | P2 - Medium |
| Status | Pending |
| Est. Time | 5-7 days |

## Key Insights

1. Only 5 test files exist for ~90+ source files (~5% coverage)
2. Payment flows have minimal test coverage
3. No security-focused tests (signature validation, CSRF, etc.)
4. No load/stress tests for rate limiting

## Current Test Files

```
src/__tests__/
├── api/
│   ├── auth/signup.test.ts
│   └── health.test.ts
├── integration/
│   └── webhooks.test.ts
└── lib/
    ├── payments/payment-flows.test.ts
    └── validation.test.ts
```

## Target Coverage

| Category | Current | Target | Priority |
|----------|---------|--------|----------|
| Critical Security | 0% | 80% | P0 |
| Payment Flows | ~10% | 60% | P1 |
| Auth Endpoints | ~20% | 50% | P1 |
| API Routes | ~5% | 40% | P2 |
| Utilities | ~10% | 50% | P3 |

---

## Test Categories

### 1. Critical Security Tests (P0)

**Files to Create:**
- `src/__tests__/security/jwt-validation.test.ts`
- `src/__tests__/security/webhook-signatures.test.ts`
- `src/__tests__/security/csrf-protection.test.ts`
- `src/__tests__/security/rate-limiting.test.ts`

**JWT Validation Tests:**
```typescript
// src/__tests__/security/jwt-validation.test.ts
describe('JWT Security', () => {
  it('should throw if NEXTAUTH_SECRET not set', () => {
    const originalEnv = process.env.NEXTAUTH_SECRET
    delete process.env.NEXTAUTH_SECRET

    expect(() => require('@/lib/auth/jwt')).toThrow('NEXTAUTH_SECRET')

    process.env.NEXTAUTH_SECRET = originalEnv
  })

  it('should reject invalid tokens', async () => {
    const result = await verifyToken('invalid.token.here')
    expect(result).toBeNull()
  })

  it('should reject expired tokens', async () => {
    // Create expired token and verify rejection
  })
})
```

**Webhook Signature Tests:**
```typescript
// src/__tests__/security/webhook-signatures.test.ts
describe('Webhook Signature Validation', () => {
  describe('MoMo', () => {
    it('should reject invalid signature', async () => {
      const payload = { /* valid structure, invalid sig */ }
      const response = await POST('/api/webhooks/momo', payload)
      expect(response.status).toBe(401)
    })

    it('should accept valid signature', async () => {
      const payload = createSignedMoMoPayload(...)
      const response = await POST('/api/webhooks/momo', payload)
      expect(response.status).toBe(200)
    })
  })

  // Similar for VNPay, ZaloPay
})
```

### 2. Payment Flow Tests (P1)

**Files to Create/Expand:**
- `src/__tests__/services/payment.service.test.ts`
- `src/__tests__/api/payments/create.test.ts`
- `src/__tests__/api/payments/refund.test.ts`

**Payment Service Tests:**
```typescript
describe('PaymentService', () => {
  describe('createPayment', () => {
    it('should create payment for valid booking', async () => {})
    it('should reject if booking already paid', async () => {})
    it('should reject if pending payment exists', async () => {})
    it('should set correct expiry time', async () => {})
    it('should create audit log entry', async () => {})
  })

  describe('processRefund', () => {
    it('should wrap refund in transaction', async () => {})
    it('should reject concurrent refund requests', async () => {})
    it('should update booking status atomically', async () => {})
    it('should respect idempotency key', async () => {})
  })

  describe('rate limiting', () => {
    it('should reject after 3 attempts per hour', async () => {})
    it('should reset after window expires', async () => {})
  })
})
```

### 3. Auth Endpoint Tests (P1)

**Files to Expand:**
- `src/__tests__/api/auth/signup.test.ts`
- `src/__tests__/api/auth/signin.test.ts` (new)
- `src/__tests__/api/auth/2fa.test.ts` (new)

**Auth Tests:**
```typescript
describe('Auth Endpoints', () => {
  describe('POST /api/auth/signup', () => {
    it('should validate email format', async () => {})
    it('should enforce password policy', async () => {})
    it('should rate limit signup attempts', async () => {})
    it('should sanitize input after validation', async () => {})
  })

  describe('2FA', () => {
    it('should generate valid TOTP secret', async () => {})
    it('should verify TOTP codes correctly', async () => {})
    it('should accept backup codes', async () => {})
    it('should invalidate used backup codes', async () => {})
  })
})
```

### 4. Integration Tests (P2)

**Files to Create:**
- `src/__tests__/integration/payment-flow.test.ts`
- `src/__tests__/integration/booking-lifecycle.test.ts`

**Payment Flow Integration:**
```typescript
describe('Payment Flow Integration', () => {
  it('should complete full payment cycle', async () => {
    // 1. Create booking
    const booking = await createTestBooking()

    // 2. Create payment
    const payment = await paymentService.createPayment({
      bookingId: booking.id,
      paymentMethod: 'momo',
      userId: testUser.id
    })

    // 3. Simulate webhook
    const webhookResult = await simulateMoMoWebhook(payment)

    // 4. Verify states
    const updatedPayment = await getPayment(payment.id)
    expect(updatedPayment.status).toBe('completed')

    const updatedBooking = await getBooking(booking.id)
    expect(updatedBooking.paymentStatus).toBe('completed')
  })
})
```

### 5. Utility Tests (P3)

**Files to Create:**
- `src/__tests__/lib/crypto-utils.test.ts`
- `src/__tests__/lib/security.test.ts`
- `src/__tests__/lib/ip-utils.test.ts`

---

## Test Infrastructure

### Setup Files

```typescript
// jest.setup.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'jest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>()

jest.mock('@/lib/db', () => ({
  prisma: prismaMock
}))

beforeEach(() => {
  mockReset(prismaMock)
})
```

### Test Utilities

```typescript
// src/__tests__/utils/test-helpers.ts
export async function createTestUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    ...overrides
  }
}

export async function createTestBooking(userId: string, overrides = {}) {
  return {
    id: 'test-booking-id',
    userId,
    status: 'pending',
    paymentStatus: 'pending',
    finalAmount: 100000,
    ...overrides
  }
}

export function createSignedMoMoPayload(data: any, secretKey: string) {
  const rawSignature = // construct per MoMo spec
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex')
  return { ...data, signature }
}
```

---

## Related Files

- `jest.config.js` - Jest configuration
- `jest.setup.ts` - Test setup
- `package.json` - Test scripts
- `src/__tests__/` - All test files

---

## Todo List

- [ ] Set up test infrastructure
  - [ ] Configure jest-mock-extended
  - [ ] Create test helpers
  - [ ] Add test database config
- [ ] Create security tests (P0)
  - [ ] JWT validation tests
  - [ ] Webhook signature tests (MoMo, VNPay, ZaloPay)
  - [ ] CSRF protection tests
  - [ ] Rate limiting tests
- [ ] Create payment tests (P1)
  - [ ] PaymentService unit tests
  - [ ] Payment creation tests
  - [ ] Refund tests
  - [ ] Idempotency tests
- [ ] Create auth tests (P1)
  - [ ] Signup validation tests
  - [ ] 2FA tests
  - [ ] Password policy tests
- [ ] Create integration tests (P2)
  - [ ] Full payment flow
  - [ ] Booking lifecycle
- [ ] Create utility tests (P3)
  - [ ] Crypto utils
  - [ ] IP detection
  - [ ] Input sanitization

---

## Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:security": "jest --testPathPattern=security",
    "test:payments": "jest --testPathPattern=payments",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

---

## Success Criteria

- [ ] Security tests: 80%+ coverage on critical paths
- [ ] Payment tests: 60%+ coverage
- [ ] All webhook signature validation tested
- [ ] Rate limiting behavior verified
- [ ] Integration tests pass in CI
- [ ] No regressions from Phase 1-4 changes

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tests too brittle | Medium | Use mocks, avoid implementation details |
| Slow test suite | Low | Parallel execution, mock DB |
| False positives | Medium | Review test assertions carefully |

## Coverage Report Target

```
-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   35    |   30     |   40    |   35    |
 lib/auth/                   |   80    |   75     |   85    |   80    |
 lib/payments/               |   60    |   55     |   65    |   60    |
 services/                   |   50    |   45     |   55    |   50    |
 app/api/auth/               |   50    |   45     |   55    |   50    |
 app/api/payments/           |   60    |   55     |   65    |   60    |
-----------------------------|---------|----------|---------|---------|
```

## Next Steps

After completion, proceed to [Phase 6: Code Quality](./phase-06-code-quality.md)
