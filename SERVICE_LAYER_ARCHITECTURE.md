# Service Layer Architecture

## Overview

This document outlines the service layer architecture implemented to separate business logic from API routes, improving code organization, testability, and maintainability.

## Architecture Pattern

```
┌─────────────────────────┐
│     API Routes          │  ← Handles HTTP requests/responses
├─────────────────────────┤
│    Service Layer        │  ← Business logic & orchestration
├─────────────────────────┤
│    Data Access (ORM)    │  ← Database operations
└─────────────────────────┘
```

## Service Layer Benefits

### 1. Separation of Concerns
- API routes handle HTTP concerns only
- Services contain business logic
- Database queries isolated in services

### 2. Reusability
- Services can be used across multiple endpoints
- Shared logic centralized
- Consistent business rules

### 3. Testability
- Easy to unit test services
- Mock dependencies
- Test business logic in isolation

### 4. Maintainability
- Clear code organization
- Easy to locate functionality
- Reduced code duplication

## Implemented Services

### 1. BookingService
**Location**: `/src/services/booking.service.ts`

**Responsibilities**:
- Create and manage bookings
- Validate booking rules
- Generate booking numbers
- Handle booking status updates
- Check for duplicate bookings

**Key Methods**:
```typescript
- createBooking(data)
- getBookingById(bookingId, userId?)
- getUserBookings(userId, options)
- updateBookingStatus(bookingId, status)
- cancelBooking(bookingId, userId, reason)
```

### 2. PaymentService
**Location**: `/src/services/payment.service.ts`

**Responsibilities**:
- Process payments through multiple gateways
- Handle payment callbacks
- Process refunds
- Validate payment rules
- Generate payment numbers

**Key Methods**:
```typescript
- createPayment(data)
- verifyPaymentCallback(method, data)
- getPaymentById(paymentId, userId?)
- getUserPayments(userId, options)
- processRefund(paymentId, data)
```

### 3. UserService
**Location**: `/src/services/user.service.ts`

**Responsibilities**:
- User registration and authentication
- Profile management
- Password management
- User statistics
- User search (admin)

**Key Methods**:
```typescript
- createUser(data)
- authenticateUser(email, password)
- updateUserProfile(userId, data)
- changePassword(userId, current, new)
- getUserStats(userId)
```

### 4. LeadService
**Location**: `/src/services/lead.service.ts`

**Responsibilities**:
- Lead capture and management
- Lead assignment
- Lead conversion
- Follow-up scheduling
- Lead analytics

**Key Methods**:
```typescript
- createLead(data)
- updateLead(leadId, data)
- convertToBooking(leadId, data)
- getLeads(query)
- scheduleFollowUp(leadId, data)
```

## Implementation Example

### Before (Business logic in API route):
```typescript
// app/api/bookings/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  // Validation logic
  if (!data.serviceTierId) {
    return NextResponse.json({ error: 'Service required' }, { status: 400 })
  }
  
  // Check existing booking
  const existing = await prisma.booking.findFirst({
    where: { userId: data.userId, status: 'active' }
  })
  
  if (existing) {
    return NextResponse.json({ error: 'Booking exists' }, { status: 409 })
  }
  
  // Generate booking number
  const bookingNumber = `BK${Date.now()}`
  
  // Create booking
  const booking = await prisma.booking.create({
    data: { ...data, bookingNumber }
  })
  
  return NextResponse.json({ booking })
}
```

### After (Using service layer):
```typescript
// app/api/bookings/route.ts
import { BookingService } from '@/services/booking.service'

const bookingService = new BookingService()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const booking = await bookingService.createBooking(data)
    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Service Layer Guidelines

### 1. Service Structure
```typescript
export class ServiceName {
  private logger = getLogger()
  
  // Public methods (business operations)
  async publicMethod() {}
  
  // Private helper methods
  private async helperMethod() {}
}
```

### 2. Error Handling
```typescript
// Use custom error classes
throw new NotFoundError('Resource')
throw new ValidationError('Invalid data')
throw new ConflictError('Already exists')

// Log important operations
this.logger.info('Operation completed', { data })
this.logger.error('Operation failed', { error })
```

### 3. Transaction Management
```typescript
// Use transactions for multi-step operations
async createWithRelations(data) {
  return await prisma.$transaction(async (tx) => {
    const parent = await tx.parent.create({ data })
    const child = await tx.child.create({ 
      data: { parentId: parent.id }
    })
    return { parent, child }
  })
}
```

### 4. Validation
```typescript
// Validate at service layer
private validateBookingData(data) {
  if (!data.userId) {
    throw new ValidationError('User ID required')
  }
  // Additional validations...
}
```

## Testing Services

### Unit Test Example
```typescript
describe('BookingService', () => {
  let service: BookingService
  
  beforeEach(() => {
    service = new BookingService()
  })
  
  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      // Mock prisma
      jest.spyOn(prisma.booking, 'create').mockResolvedValue(mockBooking)
      
      const result = await service.createBooking(mockData)
      
      expect(result).toEqual(mockBooking)
      expect(prisma.booking.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: mockData.userId
        })
      }))
    })
    
    it('should throw error for duplicate booking', async () => {
      // Mock existing booking
      jest.spyOn(service, 'checkExistingBooking').mockResolvedValue(true)
      
      await expect(service.createBooking(mockData))
        .rejects.toThrow(ConflictError)
    })
  })
})
```

## Migration Strategy

### Phase 1: Create Services
- [x] Create service classes
- [x] Move business logic from routes
- [x] Add proper error handling
- [x] Add logging

### Phase 2: Update API Routes
- [ ] Replace inline logic with service calls
- [ ] Simplify route handlers
- [ ] Standardize responses
- [ ] Add error handling middleware

### Phase 3: Add Tests
- [ ] Unit tests for services
- [ ] Integration tests for API routes
- [ ] Mock external dependencies
- [ ] Test error scenarios

### Phase 4: Optimize
- [ ] Add caching where appropriate
- [ ] Implement batch operations
- [ ] Add performance monitoring
- [ ] Optimize database queries

## Best Practices

### 1. Keep Services Focused
- One service per domain entity
- Clear, single responsibility
- Avoid service dependencies

### 2. Use Dependency Injection
```typescript
class BookingService {
  constructor(
    private db = prisma,
    private logger = getLogger()
  ) {}
}
```

### 3. Return Consistent Data
- Always return full entities
- Include necessary relations
- Use DTOs for complex responses

### 4. Handle Errors Gracefully
- Throw meaningful errors
- Log errors with context
- Don't expose internal details

### 5. Document Service Methods
```typescript
/**
 * Create a new booking
 * @param data - Booking creation data
 * @returns Created booking with relations
 * @throws {ConflictError} If user has active booking
 * @throws {NotFoundError} If service tier not found
 */
async createBooking(data: CreateBookingDto): Promise<Booking> {
  // Implementation
}
```

## Future Enhancements

1. **Caching Layer**: Add Redis for frequently accessed data
2. **Event System**: Emit events for important operations
3. **Queue Integration**: Process heavy operations asynchronously
4. **API Versioning**: Support multiple API versions
5. **GraphQL Layer**: Add GraphQL on top of services