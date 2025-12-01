# Phase 1: Critical Security Fixes

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** None (first phase)
- **Research:** [Architecture & Security](./research/researcher-01-architecture-security.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-30 |
| Priority | P0 - Critical |
| Status | Pending |
| Est. Time | 2-3 days |

## Key Insights

1. JWT fallback secret exposes all tokens if env var missing
2. Webhook callbacks processed without signature validation
3. `gatewayTransactionId` not unique - duplicate webhook processing possible

## Requirements

- Remove hardcoded JWT fallback; fail fast on missing secret
- Implement HMAC/RSA signature validation for MoMo, VNPay, ZaloPay webhooks
- Add unique constraint on `gatewayTransactionId` in schema

---

## Issue 1: JWT Hardcoded Fallback

### Current Code

```typescript
// src/lib/auth/jwt.ts:5
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'
```

### Related Files

- `src/lib/auth/jwt.ts` (main file)
- `src/lib/env-validation.ts` (env validation)
- `src/lib/init.ts` (app initialization)

### Implementation Steps

1. Remove fallback value from JWT_SECRET assignment
2. Add startup validation in `src/lib/init.ts` or `src/lib/env-validation.ts`
3. Throw descriptive error if NEXTAUTH_SECRET missing
4. Add unit test for startup validation

### Code Change

```typescript
// src/lib/auth/jwt.ts
const JWT_SECRET = process.env.NEXTAUTH_SECRET
if (!JWT_SECRET) {
  throw new Error('CRITICAL: NEXTAUTH_SECRET environment variable not set')
}
```

---

## Issue 2: Webhook Signature Validation Missing

### Current Code

```typescript
// src/services/payment.service.ts:83-94
async verifyPaymentCallback(paymentMethod: string, callbackData: Record<string, any>) {
  switch (paymentMethod) {
    case 'momo':
      return await this.momoPayment.handleWebhook(callbackData as any)  // No signature check
    case 'vnpay':
      return await this.vnpayPayment.verifyReturnUrl(callbackData)
    case 'zalopay':
      return await this.zalopayPayment.handleCallback(callbackData as any)
    // ...
  }
}
```

### Related Files

- `src/services/payment.service.ts` (main service)
- `src/lib/payments/momo.ts` (MoMo handler)
- `src/lib/payments/vnpay.ts` (VNPay handler)
- `src/lib/payments/zalopay.ts` (ZaloPay handler)
- `src/app/api/webhooks/momo/route.ts`
- `src/app/api/webhooks/vnpay/route.ts`
- `src/app/api/webhooks/zalopay/route.ts`

### Implementation Steps

1. **MoMo:** Add HMAC-SHA256 signature validation
   - MoMo uses `signature` field in callback
   - Verify using `secretKey` from MoMo config

2. **VNPay:** Add secure hash validation
   - VNPay uses `vnp_SecureHash` field
   - Verify using HMAC-SHA512 with hash secret

3. **ZaloPay:** Add MAC verification
   - ZaloPay uses `mac` field in callback
   - Verify using HMAC-SHA256 with key2

4. Create shared signature verification utility:

```typescript
// src/lib/payments/signature-utils.ts
import crypto from 'crypto'

export function verifyHmacSignature(
  data: string,
  signature: string,
  secretKey: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  const computed = crypto
    .createHmac(algorithm, secretKey)
    .update(data)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  )
}
```

5. Update webhook route handlers to validate BEFORE processing:

```typescript
// src/app/api/webhooks/momo/route.ts
export async function POST(request: Request) {
  const body = await request.json()

  // Validate signature FIRST
  const isValid = verifyMoMoSignature(body)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Then process...
}
```

---

## Issue 3: Missing Unique Constraint on gatewayTransactionId

### Current Schema

```prisma
// prisma/schema.prisma - Payment model
gatewayTransactionId String?   @map("gateway_transaction_id")
// Missing @unique!
```

### Related Files

- `prisma/schema.prisma`
- `src/services/payment.service.ts`

### Implementation Steps

1. Add unique constraint to schema:

```prisma
model Payment {
  // ...
  gatewayTransactionId String?   @unique @map("gateway_transaction_id")
  // ...
}
```

2. Create migration:
```bash
npx prisma migrate dev --name add_unique_gateway_transaction_id
```

3. Add check in payment service before creating payment:

```typescript
// Before creating payment, check if gatewayTransactionId exists
const existing = await prisma.payment.findUnique({
  where: { gatewayTransactionId: transactionId }
})
if (existing) {
  throw new ConflictError('Transaction already processed')
}
```

4. Handle potential duplicates in existing data before migration

---

## Todo List

- [ ] Fix JWT secret fallback (Issue 1)
  - [ ] Remove hardcoded fallback
  - [ ] Add startup validation
  - [ ] Add unit test
- [ ] Implement webhook signature validation (Issue 2)
  - [ ] Create signature-utils.ts utility
  - [ ] Add MoMo HMAC-SHA256 validation
  - [ ] Add VNPay HMAC-SHA512 validation
  - [ ] Add ZaloPay MAC validation
  - [ ] Update webhook route handlers
  - [ ] Add integration tests
- [ ] Add gatewayTransactionId unique constraint (Issue 3)
  - [ ] Check existing duplicates in DB
  - [ ] Update Prisma schema
  - [ ] Create and run migration
  - [ ] Add pre-insert uniqueness check

---

## Success Criteria

- [ ] App fails to start if NEXTAUTH_SECRET missing
- [ ] All webhook endpoints validate signatures before processing
- [ ] Forged webhook requests return 401
- [ ] Duplicate transactions rejected with 409 Conflict
- [ ] All tests pass

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration fails on existing duplicates | High | Query for duplicates first, resolve manually |
| Gateway signature format changes | Medium | Document expected formats, add logging |
| Timing attack on signature comparison | Low | Use crypto.timingSafeEqual |

## Security Considerations

- Use `crypto.timingSafeEqual` for signature comparison (timing attack prevention)
- Log failed signature validations for security monitoring
- Rate limit failed webhook attempts
- Store signature verification data in WebhookEvent for audit

## Next Steps

After completion, proceed to [Phase 2: Security Hardening](./phase-02-security-hardening.md)
