# Phase 2: Security Hardening

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** [Phase 1: Critical Security Fixes](./phase-01-critical-security-fixes.md)
- **Research:** [Architecture & Security](./research/researcher-01-architecture-security.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-30 |
| Priority | P1 - High |
| Status | Pending |
| Est. Time | 3-4 days |

## Key Insights

1. CSP only in middleware, not enforced in production builds via next.config
2. CSRF token generated but not validated on state-changing endpoints
3. Rate limit IP detection via spoofable `x-forwarded-for`
4. Input sanitization happens before Zod validation (wrong order)
5. Unbounded `failureReason` and `gatewayResponse` fields

## Requirements

- Enforce CSP in both middleware AND next.config headers
- Implement CSRF token validation on all POST/PUT/DELETE endpoints
- Validate `x-forwarded-for` against trusted proxies
- Reorder validation: Zod first, then sanitize
- Add field length limits to schema

---

## Issue 4: Incomplete CSP Enforcement

### Current State

```javascript
// next.config.js:60 - CSP delegated to middleware only
// CSP is handled by middleware
```

Problem: Middleware CSP doesn't apply to static assets, API routes outside matcher.

### Related Files

- `next.config.js`
- `src/middleware.ts`
- `src/lib/security/csp-config.ts`

### Implementation Steps

1. Add CSP header to `next.config.js` headers array:

```javascript
// next.config.js
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}
```

2. Keep middleware CSP for dynamic nonce-based protection on protected routes
3. Test both static and dynamic routes have CSP applied

---

## Issue 5: Missing CSRF Token Validation

### Current State

Nonce generated in middleware but not used for CSRF protection on mutations.

### Related Files

- `src/middleware.ts`
- `src/hooks/useCSRF.ts`
- `src/lib/csrf-protection.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/payments/create/route.ts`
- All state-changing API routes

### Implementation Steps

1. Create CSRF validation middleware:

```typescript
// src/lib/csrf-validation.ts
import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function validateCSRFToken(request: Request): Promise<boolean> {
  const cookieStore = cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) return false

  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}

export function withCSRFValidation(handler: Function) {
  return async (request: Request, context: any) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const valid = await validateCSRFToken(request)
      if (!valid) {
        return Response.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        )
      }
    }
    return handler(request, context)
  }
}
```

2. Set CSRF cookie on login/session init
3. Update `useCSRF` hook to include token in all mutation requests
4. Apply to all state-changing endpoints

---

## Issue 6: Rate Limit IP Spoofing

### Current Code

```typescript
// src/app/api/auth/signup/route.ts:22
const clientId = request.headers.get('x-forwarded-for') || request.ip || 'anonymous'
```

### Related Files

- `src/app/api/auth/signup/route.ts`
- `src/lib/rate-limit.ts`
- `src/lib/rate-limit-edge.ts`

### Implementation Steps

1. Create trusted proxy validation:

```typescript
// src/lib/ip-utils.ts
const TRUSTED_PROXIES = [
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '127.0.0.1'
]

export function getClientIP(request: Request): string {
  // For Cloudflare
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  // For Vercel
  const xRealIP = request.headers.get('x-real-ip')
  if (xRealIP) return xRealIP

  // Validate x-forwarded-for
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    // Return first non-trusted IP (rightmost trusted proxy chain)
    return ips[0] // Simplified; production should validate chain
  }

  return 'anonymous'
}
```

2. Update rate limit calls to use `getClientIP()`
3. Document trusted proxy configuration for deployment

---

## Issue 7: Input Sanitization Ordering

### Current Code

```typescript
// src/app/api/auth/signup/route.ts:36-40
sanitizeInput(body.fullName),
sanitizeInput(body.email.toLowerCase()),
```

Sanitization before validation can alter input in unexpected ways.

### Related Files

- `src/app/api/auth/signup/route.ts`
- `src/lib/validation.ts`
- `src/lib/security.ts` (sanitizeInput)

### Implementation Steps

1. Reorder processing: validate with Zod FIRST, then sanitize:

```typescript
// Correct order
const validated = signupSchema.parse(body)  // Zod first
const sanitized = {
  fullName: sanitizeInput(validated.fullName),
  email: sanitizeInput(validated.email.toLowerCase()),
  // ...
}
```

2. Ensure Zod schemas are strict enough to catch injection
3. Apply pattern to all API routes

---

## Issue 8: Unbounded Error Fields

### Current Schema

```prisma
failureReason  String?   @map("failure_reason")  // No limit
errorMessage   String?   @map("error_message")    // No limit
gatewayResponse Json?    @map("gateway_response") // No schema
```

### Related Files

- `prisma/schema.prisma`
- `src/services/payment.service.ts`

### Implementation Steps

1. Add length constraints:

```prisma
failureReason  String?   @map("failure_reason") @db.VarChar(500)
errorMessage   String?   @map("error_message") @db.VarChar(500)
```

2. Truncate values before insert:

```typescript
function truncateError(message: string | undefined, maxLength = 500): string | undefined {
  if (!message) return undefined
  return message.length > maxLength ? message.slice(0, maxLength) + '...' : message
}
```

3. Add Zod schema for `gatewayResponse`:

```typescript
const gatewayResponseSchema = z.object({
  transactionId: z.string().optional(),
  status: z.string().optional(),
  message: z.string().max(500).optional(),
  // ... other expected fields
}).passthrough().catch({})
```

4. Create migration for VarChar limits

---

## Todo List

- [ ] Fix CSP enforcement (Issue 4)
  - [ ] Add CSP to next.config headers
  - [ ] Test static routes have CSP
  - [ ] Document CSP policy
- [ ] Implement CSRF validation (Issue 5)
  - [ ] Create csrf-validation.ts utility
  - [ ] Update useCSRF hook
  - [ ] Apply to auth endpoints
  - [ ] Apply to payment endpoints
  - [ ] Apply to all mutation endpoints
- [ ] Fix rate limit IP detection (Issue 6)
  - [ ] Create ip-utils.ts
  - [ ] Update rate limit calls
  - [ ] Document proxy config
- [ ] Fix input sanitization order (Issue 7)
  - [ ] Audit all API routes
  - [ ] Reorder validation before sanitization
  - [ ] Add tests
- [ ] Add field length limits (Issue 8)
  - [ ] Update Prisma schema
  - [ ] Create migration
  - [ ] Add truncation utility
  - [ ] Validate gatewayResponse JSON

---

## Success Criteria

- [ ] CSP header present on all routes (static + dynamic)
- [ ] CSRF validation active on all POST/PUT/DELETE routes
- [ ] Rate limiting uses verified client IP
- [ ] All API routes: validate -> sanitize order
- [ ] No unbounded string fields in schema
- [ ] All tests pass

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| CSP breaks third-party scripts | Medium | Test GA, analytics in staging |
| CSRF blocks legitimate requests | High | Grace period, clear error messages |
| Migration truncates existing data | Low | Backup before migration |

## Security Considerations

- CSP should use nonces for inline scripts where possible
- CSRF tokens must be HttpOnly, SameSite=Strict cookies
- Log all CSRF validation failures
- Rate limit should fallback safely if IP detection fails

## Next Steps

After completion, proceed to [Phase 3: Payment Integrity](./phase-03-payment-integrity.md)
