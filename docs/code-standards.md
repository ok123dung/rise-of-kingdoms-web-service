# Code Standards

**Project:** ROK Services
**Last Updated:** 2025-12-09

---

## 1. TypeScript Standards

### 1.1 Configuration
```json
{
  "strict": true,
  "noEmit": true,
  "skipLibCheck": true,
  "esModuleInterop": true
}
```

### 1.2 Type Safety Rules
- **NO `any` types** in new code (use `unknown` for truly unknown types)
- Explicit return types for public functions
- Use type guards for runtime type checking
- Leverage Prisma-generated types for database operations

```typescript
// Good
export function processPayment(data: PaymentInput): Promise<PaymentResult> {
  // ...
}

// Bad
export function processPayment(data: any): any {
  // ...
}
```

### 1.3 Type Definitions Location
- Shared types: `src/types/`
- Component props: inline with component
- API types: colocated with route handlers
- Prisma types: auto-generated, extended in `src/types/prisma.ts`

---

## 2. Naming Conventions

### 2.1 Files & Directories

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookingForm.tsx` |
| Pages | lowercase | `page.tsx` |
| Hooks | camelCase with `use` prefix | `useWebSocket.ts` |
| Services | camelCase with `.service` suffix | `booking.service.ts` |
| Utilities | camelCase | `validation.ts` |
| Types | PascalCase | `PaymentTypes.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_CONSTANTS.ts` |

### 2.2 Code Elements

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookingCard` |
| Functions | camelCase | `createBooking` |
| Variables | camelCase | `paymentStatus` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Interfaces | PascalCase with `I` prefix (optional) | `PaymentData` or `IPaymentData` |
| Types | PascalCase | `PaymentStatus` |
| Enums | PascalCase | `BookingStatus` |
| Enum values | SCREAMING_SNAKE_CASE | `PENDING`, `COMPLETED` |

### 2.3 Database Fields (Prisma)
- Models: PascalCase (`User`, `ServiceTier`)
- Fields: camelCase (`userId`, `createdAt`)
- Database columns: snake_case via `@map` (`user_id`, `created_at`)

```prisma
model ServiceTier {
  id        String   @id @default(cuid())
  serviceId String   @map("service_id")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("service_tiers")
}
```

---

## 3. Component Patterns

### 3.1 Component Structure
```typescript
// 1. Imports (external, then internal, then relative)
import { useState } from 'react'
import { Button } from '@/components/ui'
import { formatCurrency } from './utils'

// 2. Types
interface BookingCardProps {
  booking: Booking
  onSelect: (id: string) => void
}

// 3. Component
export function BookingCard({ booking, onSelect }: BookingCardProps) {
  // 3.1 Hooks
  const [isLoading, setIsLoading] = useState(false)

  // 3.2 Derived state
  const formattedAmount = formatCurrency(booking.amount)

  // 3.3 Handlers
  const handleClick = () => {
    onSelect(booking.id)
  }

  // 3.4 Render
  return (
    <div onClick={handleClick}>
      {/* ... */}
    </div>
  )
}
```

### 3.2 Client vs Server Components
```typescript
// Client component (required for hooks, events, browser APIs)
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [state, setState] = useState(false)
  // ...
}
```

```typescript
// Server component (default - no directive needed)
import { db } from '@/lib/db'

export async function DataComponent() {
  const data = await db.service.findMany()
  // ...
}
```

### 3.3 Component Categories
- **UI Components** (`/components/ui/`): Reusable, no business logic
- **Feature Components** (`/components/[feature]/`): Feature-specific with business logic
- **Layout Components** (`/components/layout/`): Page structure
- **Dynamic Components** (`/components/dynamic/`): Lazy-loaded heavy components

---

## 4. Service Layer Patterns

### 4.1 Service Structure
```typescript
// src/services/booking.service.ts

import { db } from '@/lib/db'
import { BookingInput, BookingResult } from '@/types'
import { ValidationError } from '@/lib/errors'

export class BookingService {
  /**
   * Creates a new booking with validation and notifications
   */
  static async create(input: BookingInput): Promise<BookingResult> {
    // 1. Validate input
    const validated = await this.validate(input)

    // 2. Execute business logic
    const booking = await db.booking.create({
      data: validated,
      include: { serviceTier: true }
    })

    // 3. Side effects (notifications, logging)
    await this.sendNotifications(booking)

    // 4. Return result
    return { success: true, booking }
  }

  private static async validate(input: BookingInput) {
    // Validation logic
  }

  private static async sendNotifications(booking: Booking) {
    // Notification logic
  }
}
```

### 4.2 Service Responsibilities
- Input validation
- Business logic execution
- Database operations
- Side effects (emails, notifications)
- Error handling

---

## 5. API Route Patterns

### 5.1 Route Handler Structure
```typescript
// src/app/api/bookings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { withAuth, getCurrentUser } from '@/lib/auth'
import { BookingService } from '@/services/booking.service'
import { bookingSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/error-handler'
import { getLogger } from '@/lib/monitoring/logger'

const logger = getLogger('api:bookings')

export const POST = withAuth(async (request: NextRequest) => {
  const requestId = crypto.randomUUID()

  try {
    // 1. Parse and validate input
    const body = await request.json()
    const validated = bookingSchema.parse(body)

    // 2. Get authenticated user
    const user = await getCurrentUser()

    // 3. Execute service
    const result = await BookingService.create({
      ...validated,
      userId: user.id
    })

    // 4. Log and return
    logger.info('Booking created', { requestId, bookingId: result.booking.id })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, requestId)
  }
})
```

### 5.2 Response Format
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    message: string,
    code?: string,
    statusCode: number,
    timestamp: string,
    requestId?: string
  }
}
```

---

## 6. Error Handling

### 6.1 Custom Error Classes
```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 402, 'PAYMENT_ERROR')
  }
}
```

### 6.2 Error Handling Pattern
```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  logger.error('Unexpected error', error)
  return handleApiError(error, requestId)
}
```

---

## 7. Validation Patterns

### 7.1 Zod Schemas
```typescript
// src/lib/validation.ts

import { z } from 'zod'

export const emailSchema = z.string().email().max(255)

export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')

export const phoneSchema = z.string()
  .regex(/^(\+84|0)(3|5|7|8|9)[0-9]{8}$/, 'Invalid Vietnamese phone number')

export const bookingSchema = z.object({
  serviceTierId: z.string().cuid(),
  requirements: z.string().max(1000).optional(),
  startDate: z.coerce.date().optional()
})
```

### 7.2 Input Sanitization
```typescript
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}
```

---

## 8. Database Patterns

### 8.1 Prisma Model Naming (Dec 2025)

Recent TypeScript fixes resolved 60+ type errors by correcting Prisma model and relation names:

**Model Names (Prisma schema):**
- Plural forms: `User`, `Booking`, `Service`, `Payment` (singular in schema)
- Related model methods use plural names: `user.bookings()`, `booking.payments()`
- Use correct database column names via `@map()` directive

**Include Relations (API queries):**
```typescript
// CORRECT - Plural relations
include: {
  users: { ... },      // not "user"
  bookings: { ... },   // not "booking"
  services: { ... }    // not "service"
}

// Common fixes made:
// service: {...} → services: {...}
// booking: {...} → bookings: {...}
// user: {...} → users: {...}
// payment: {...} → payments: {...}
```

**Auth Types Fix:**
```typescript
// UserWithStaff interface corrected
interface UserWithStaff {
  // OLD: staffProfile: Staff
  // NEW:
  staff?: Staff | null  // Correct relation name from schema
}
```

### 8.2 Query Patterns
```typescript
// Include related data to prevent N+1
const booking = await db.booking.findUnique({
  where: { id },
  include: {
    serviceTier: { include: { service: true } },
    payments: { where: { status: 'completed' } },
    users: { select: { id: true, email: true, fullName: true } }
  }
})

// Use transactions for atomic operations
await db.$transaction(async (tx) => {
  await tx.payments.update({ where: { id }, data: { status: 'completed' } })
  await tx.bookings.update({ where: { id: bookingId }, data: { paymentStatus: 'paid' } })
})
```

### 8.3 Index Guidelines
- Add indexes for frequently queried fields
- Use composite indexes for multi-column queries
- Index foreign key columns

---

## 9. Security Patterns

### 9.1 Authentication Middleware
```typescript
export const withAuth = (handler: RouteHandler) => {
  return async (request: NextRequest) => {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(request)
  }
}
```

### 9.2 Authorization Checks
```typescript
// Check resource ownership
if (booking.userId !== user.id && !isAdmin(user)) {
  throw new AuthorizationError('Access denied')
}
```

### 9.3 Rate Limiting
```typescript
import { withRateLimit, rateLimiters } from '@/lib/rate-limit'

// Apply rate limiting
const rateLimitResult = await withRateLimit(request, rateLimiters.auth)
if (rateLimitResult) return rateLimitResult
```

---

## 10. Testing Standards

### 10.1 Test File Structure
```typescript
// src/__tests__/services/booking.service.test.ts

import { BookingService } from '@/services/booking.service'
import { db } from '@/lib/db'

jest.mock('@/lib/db')

describe('BookingService', () => {
  describe('create', () => {
    it('should create booking with valid input', async () => {
      // Arrange
      const input = { serviceTierId: 'tier123', userId: 'user123' }

      // Act
      const result = await BookingService.create(input)

      // Assert
      expect(result.success).toBe(true)
      expect(result.booking).toBeDefined()
    })

    it('should throw ValidationError for invalid input', async () => {
      // ...
    })
  })
})
```

### 10.2 Test Categories
- **Unit tests:** Individual functions/classes
- **Integration tests:** API routes with database
- **E2E tests:** Full user flows (Playwright)

---

## 11. Logging Standards

### 11.1 Log Levels
- `error`: Application errors requiring investigation
- `warn`: Unexpected but handled situations
- `info`: Significant business events
- `debug`: Detailed debugging information (dev only)

### 11.2 Logging Pattern
```typescript
import { getLogger } from '@/lib/monitoring/logger'

const logger = getLogger('payment-service')

// Include context
logger.info('Payment processed', {
  paymentId,
  amount,
  gateway,
  userId
})

// Log errors with stack traces
logger.error('Payment failed', error, {
  paymentId,
  gateway
})
```

---

## 12. Import Organization

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { NextRequest, NextResponse } from 'next/server'

// 2. External libraries
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Internal absolute imports
import { db } from '@/lib/db'
import { Button } from '@/components/ui'
import { BookingService } from '@/services/booking.service'

// 4. Relative imports
import { formatAmount } from './utils'
import type { BookingProps } from './types'
```

---

## 13. Code Review Checklist

- [ ] TypeScript types are explicit (no `any`)
- [ ] Error handling is comprehensive
- [ ] Input validation is in place
- [ ] Database queries are optimized (no N+1)
- [ ] Sensitive operations are authenticated
- [ ] Rate limiting is applied where needed
- [ ] Logging is appropriate
- [ ] Tests are included for new code
- [ ] Documentation is updated
