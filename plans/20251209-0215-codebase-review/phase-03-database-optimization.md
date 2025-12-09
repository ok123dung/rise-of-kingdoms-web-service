# Phase 03: Database & Performance Optimization

**Priority:** MEDIUM
**Status:** Pending
**Estimated Effort:** 3-4 hours

---

## Context

Database layer has good architecture (circuit breaker, pooling) but needs cleanup and optimization.

---

## Issues

### 3.1 Multiple Prisma Instances
**File:** `src/lib/db.ts`

**Current:** 3 separate instances (prisma, basePrisma, prismaAdmin)
**Risk:** Connection pool exhaustion, memory overhead

### 3.2 Missing @updatedAt
**File:** `prisma/schema.prisma`

**Current:** Manual timestamp management
**Risk:** Inconsistent timestamps, bugs

### 3.3 Duplicate Caching Logic
**File:** `src/lib/db.ts:284-291`

**Current:** Same caching logic for dev and prod
**Fix:** Simplify to single conditional

### 3.4 Raw Query Usage
**Files:** Various API routes

**Current:** `$queryRawUnsafe` used in 10+ locations
**Risk:** SQL injection if inputs not sanitized

---

## Implementation Steps

### Step 1: Add @updatedAt to Schema
```prisma
model User {
  id         String   @id @default(cuid())
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt  // ✅ Auto-managed
  // ...
}
```

### Step 2: Simplify Prisma Caching
```typescript
// Before (duplicate logic)
if (!isBuildPhase && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaEnhanced
}
if (!isBuildPhase && process.env.NODE_ENV === 'production') {
  globalForPrisma.prisma = prismaEnhanced
}

// After (simplified)
if (!isBuildPhase) {
  globalForPrisma.prisma = prismaEnhanced
}
```

### Step 3: Replace $queryRawUnsafe
```typescript
// Before
await prisma.$queryRawUnsafe('SELECT 1')

// After
await prisma.$queryRaw`SELECT 1`
```

### Step 4: Consolidate Prisma Instances
Consider using single enhanced client with appropriate context for all operations.

---

## Success Criteria

- [ ] All models have `@updatedAt`
- [ ] No `$queryRawUnsafe` in codebase
- [ ] Simplified caching logic
- [ ] Connection pool stable under load

---

## Related Files

- `src/lib/db.ts`
- `prisma/schema.prisma`
- `src/app/api/**/*.ts`
