# Phase 02: Authentication Security Hardening

**Priority:** HIGH
**Status:** Pending
**Estimated Effort:** 4-6 hours

---

## Context

Authentication system has good foundation but critical security gaps that could be exploited.

---

## Issues

### 2.1 CSRF Not Enforced on Signup
**File:** `src/app/auth/signup/page.tsx`
**File:** `src/app/api/auth/signup/route.ts`

**Current:** CSRF token generated but not validated server-side
**Risk:** Cross-site request forgery attacks

### 2.2 Timing Attack in check-2fa
**File:** `src/app/api/auth/check-2fa/route.ts`

**Current:** Returns different response times for valid/invalid users
**Risk:** Credential enumeration via timing analysis

### 2.3 User ID Leakage
**File:** `src/app/api/auth/check-2fa/route.ts`

**Current:** Returns `user_id` before authentication complete
**Risk:** Information disclosure

### 2.4 In-Memory Rate Limiting
**File:** `src/lib/rate-limit.ts`

**Current:** Uses in-memory LRU cache
**Risk:** Ineffective across serverless instances

---

## Implementation Steps

### Step 1: Enforce CSRF on Signup
```typescript
// src/app/api/auth/signup/route.ts
import { verifyCsrfToken } from '@/lib/security/csrf'

export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get('x-csrf-token')
  if (!verifyCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  // ... rest of handler
}
```

### Step 2: Fix Timing Attack
```typescript
// src/app/api/auth/check-2fa/route.ts
import { timingSafeEqual } from 'crypto'

// Add constant-time delay regardless of result
const RESPONSE_DELAY_MS = 200

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // ... authentication logic ...

  // Ensure constant response time
  const elapsed = Date.now() - startTime
  if (elapsed < RESPONSE_DELAY_MS) {
    await new Promise(r => setTimeout(r, RESPONSE_DELAY_MS - elapsed))
  }

  return response
}
```

### Step 3: Remove User ID from Response
```typescript
// Before
return { requires2FA: false, user_id: user.id }

// After
return { requires2FA: false }
```

### Step 4: Implement Redis Rate Limiting
```typescript
// src/lib/rate-limit-redis.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
})

export async function checkRateLimit(key: string, limit: number, window: number) {
  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, window)
  }
  return current <= limit
}
```

---

## Success Criteria

- [ ] CSRF validated on all auth endpoints
- [ ] Constant response time on check-2fa
- [ ] No user IDs exposed before auth
- [ ] Redis rate limiting in production
- [ ] Security audit passes

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CSRF bypass | Medium | High | Enforce all endpoints |
| Credential enum | Medium | Medium | Constant-time responses |
| Rate limit bypass | High | Medium | Use Redis |

---

## Related Files

- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/check-2fa/route.ts`
- `src/lib/security/csrf.ts`
- `src/lib/rate-limit.ts`
