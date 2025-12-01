# Phase 6: Code Quality

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Dependencies:** Phases 1-5 (cleanup after features complete)
- **Research:** [Architecture & Security](./research/researcher-01-architecture-security.md)

## Overview

| Field | Value |
|-------|-------|
| Date | 2025-11-30 |
| Priority | P3 - Low |
| Status | Pending |
| Est. Time | 3-4 days |

## Key Insights

1. Loose token type in middleware - no interface definition
2. Error type casting loses details (`error as Error`)
3. Repetitive Decimal type guards throughout codebase
4. Missing environment variable validation at startup
5. Inconsistent error handling patterns

## Requirements

- Define proper TypeScript interfaces for all token types
- Improve error handling with proper type narrowing
- Normalize Decimal handling with utility functions
- Validate all required env vars at startup
- Standardize error handling across codebase

---

## Issue 14: Loose Token Type

### Current Code

```typescript
// src/middleware.ts:14
const { token } = req.nextauth
// token type assumed but not defined
if (token?.role !== 'admin') { ... }
```

### Related Files

- `src/middleware.ts`
- `src/types/` (new types needed)
- `next-auth.d.ts` (type augmentation)

### Implementation Steps

1. Create NextAuth type augmentation:

```typescript
// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin' | 'superadmin'
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: 'user' | 'admin' | 'superadmin'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: 'user' | 'admin' | 'superadmin'
  }
}
```

2. Update middleware to use typed token:

```typescript
// src/middleware.ts
import type { JWT } from 'next-auth/jwt'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as JWT | null

    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (token?.role !== 'admin' && token?.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    // ...
  }
)
```

---

## Issue 15: Error Type Casting

### Current Code

```typescript
// Multiple locations
} catch (error) {
  getLogger().error('JWT verification error', error as Error)
  return null
}
```

Problem: `error as Error` loses actual error type, could be non-Error object.

### Related Files

- `src/lib/auth/jwt.ts`
- `src/services/payment.service.ts`
- `src/lib/error-handler.ts`
- Multiple API routes

### Implementation Steps

1. Create error type guard:

```typescript
// src/lib/errors/type-guards.ts
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function toError(value: unknown): Error {
  if (isError(value)) return value
  if (typeof value === 'string') return new Error(value)
  if (typeof value === 'object' && value !== null) {
    return new Error(JSON.stringify(value))
  }
  return new Error('Unknown error')
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}
```

2. Update error handling:

```typescript
// Before
} catch (error) {
  logger.error('Error', error as Error)
}

// After
} catch (error) {
  logger.error('Error', toError(error))
}
```

---

## Issue 16: Repetitive Decimal Handling

### Current Code

```typescript
// Appears 6+ times in payment.service.ts
typeof amount === 'number' ? amount : amount.toNumber()
```

### Related Files

- `src/services/payment.service.ts`
- `src/lib/payments/*.ts`

### Implementation Steps

1. Create Decimal utility:

```typescript
// src/lib/utils/decimal.ts
import { Prisma } from '@prisma/client'

export function toNumber(value: number | Prisma.Decimal): number {
  return typeof value === 'number' ? value : value.toNumber()
}

export function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value)
}

export function formatCurrency(
  value: number | Prisma.Decimal,
  currency = 'VND'
): string {
  const num = toNumber(value)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency
  }).format(num)
}
```

2. Replace all occurrences:

```typescript
// Before
amount: typeof payment.amount === 'number' ? payment.amount : payment.amount.toNumber()

// After
amount: toNumber(payment.amount)
```

---

## Issue 17: Environment Validation

### Current State

Environment variables accessed without startup validation.

### Related Files

- `src/lib/env-validation.ts` (exists but incomplete)
- `src/lib/init.ts`
- `src/instrumentation.ts`

### Implementation Steps

1. Expand environment validation:

```typescript
// src/lib/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Payment gateways
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),

  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),

  ZALOPAY_APP_ID: z.string().optional(),
  ZALOPAY_KEY1: z.string().optional(),
  ZALOPAY_KEY2: z.string().optional(),

  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment configuration')
  }

  return parsed.data
}

// Validated env singleton
let _env: Env | null = null

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv()
  }
  return _env
}
```

2. Call at startup:

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env-validation')
    validateEnv() // Throws if invalid
  }
}
```

---

## Issue 18: Inconsistent Error Handling

### Current State

Mix of:
- Custom error classes
- Plain Error throws
- Direct response.json({ error })
- handleApiError utility (inconsistent use)

### Related Files

- `src/lib/errors.ts`
- `src/lib/error-handler.ts`
- All API routes

### Implementation Steps

1. Standardize error classes:

```typescript
// src/lib/errors/index.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number
  abstract readonly code: string
  readonly isOperational = true

  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message
      }
    }
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404
  readonly code = 'NOT_FOUND'

  constructor(resource: string) {
    super(`${resource} not found`)
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400
  readonly code = 'VALIDATION_ERROR'
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401
  readonly code = 'UNAUTHORIZED'
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403
  readonly code = 'FORBIDDEN'
}

export class ConflictError extends AppError {
  readonly statusCode = 409
  readonly code = 'CONFLICT'
}

export class TooManyRequestsError extends AppError {
  readonly statusCode = 429
  readonly code = 'TOO_MANY_REQUESTS'
}

export class PaymentError extends AppError {
  readonly statusCode = 402
  readonly code = 'PAYMENT_ERROR'
}
```

2. Create unified error handler:

```typescript
// src/lib/errors/handler.ts
import { NextResponse } from 'next/server'
import { AppError } from './index'
import { ZodError } from 'zod'
import { getLogger } from '@/lib/monitoring/logger'

export function handleApiError(error: unknown): NextResponse {
  const logger = getLogger()

  // Operational errors
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.flatten()
      }
    }, { status: 400 })
  }

  // Unexpected errors - log and hide details
  logger.error('Unexpected error', toError(error))

  return NextResponse.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  }, { status: 500 })
}
```

3. Use consistently in all routes:

```typescript
// Example API route
export async function POST(request: Request) {
  try {
    // ... logic
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Code Cleanup Checklist

### Remove Dead Code
- [ ] Audit for unused imports
- [ ] Remove commented-out code
- [ ] Remove unused utility functions
- [ ] Clean up unused type definitions

### Standardize Imports
- [ ] Use path aliases consistently (`@/`)
- [ ] Order: external, internal, types
- [ ] Remove duplicate imports

### Documentation
- [ ] Add JSDoc to public functions
- [ ] Update inline comments
- [ ] Document complex algorithms

---

## Related Files

- `src/types/` - Type definitions
- `src/lib/errors/` - Error handling
- `src/lib/utils/` - Utilities
- `src/lib/env-validation.ts` - Env validation
- All API routes

---

## Todo List

- [ ] Fix token types (Issue 14)
  - [ ] Create next-auth.d.ts
  - [ ] Update middleware
  - [ ] Update API routes using token
- [ ] Fix error handling (Issue 15)
  - [ ] Create type guards
  - [ ] Update all catch blocks
- [ ] Normalize Decimal handling (Issue 16)
  - [ ] Create decimal utility
  - [ ] Replace all occurrences
- [ ] Add env validation (Issue 17)
  - [ ] Expand validation schema
  - [ ] Call at startup
  - [ ] Document required vars
- [ ] Standardize errors (Issue 18)
  - [ ] Refactor error classes
  - [ ] Create unified handler
  - [ ] Apply to all routes
- [ ] Code cleanup
  - [ ] Remove dead code
  - [ ] Standardize imports
  - [ ] Add documentation

---

## Success Criteria

- [ ] No `any` types in critical paths
- [ ] All token accesses type-safe
- [ ] Consistent error handling
- [ ] Startup fails fast on missing env
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] ESLint passes

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Refactor breaks existing code | High | Comprehensive tests from Phase 5 |
| Type changes cascade widely | Medium | Incremental updates, test each |
| Startup validation too strict | Low | Review required vs optional vars |

## Quality Metrics

After completion:
- TypeScript strict mode: 0 errors
- ESLint: 0 errors, <10 warnings
- No `// @ts-ignore` comments
- No `any` in business logic
- All public functions documented

## Next Steps

After completion:
1. Run full test suite
2. Performance regression testing
3. Security audit
4. Deploy to staging
5. Production deployment

---

## Summary

This phase focuses on code maintainability and developer experience. While lower priority than security/payment fixes, these improvements reduce future bug risk and make the codebase easier to work with.
