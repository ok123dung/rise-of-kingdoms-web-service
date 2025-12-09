# Phase 01: Critical Fixes

**Priority:** CRITICAL
**Status:** Pending
**Estimated Effort:** 2-4 hours

---

## Context

Build configuration currently hides TypeScript and ESLint errors, allowing bugs to reach production undetected.

---

## Issues

### 1.1 TypeScript Errors Ignored
**File:** `next.config.js:7`
```javascript
typescript: {
  ignoreBuildErrors: true  // ❌ DANGEROUS
}
```

**Impact:** Type errors deployed to production

### 1.2 ESLint Disabled
**File:** `next.config.js:4`
```javascript
eslint: {
  ignoreDuringBuilds: true  // ❌ DANGEROUS
}
```

**Impact:** Code quality regressions undetected

### 1.3 Known Type Errors (60+)
- Prisma schema field naming inconsistencies
- Missing required fields in creates
- Relation name mismatches (`user` vs `users`)

---

## Implementation Steps

### Step 1: Audit Type Errors
```bash
cd rok-services
npx tsc --noEmit 2>&1 | head -100
```

### Step 2: Fix Prisma Relations
Update schema to use consistent naming:
```prisma
model Booking {
  user    User @relation(fields: [user_id], references: [id])
  // Not: users User
}
```

### Step 3: Add Missing Fields
Ensure all creates include required fields:
- `id` (use `crypto.randomUUID()`)
- `updated_at` (use `new Date()`)

### Step 4: Enable Type Checking
```javascript
// next.config.js
typescript: {
  ignoreBuildErrors: false  // ✅
}
```

### Step 5: Enable ESLint
```javascript
eslint: {
  ignoreDuringBuilds: false  // ✅
}
```

---

## Success Criteria

- [ ] `npm run build` passes without `--ignore-ts`
- [ ] Zero TypeScript errors
- [ ] ESLint checks enabled
- [ ] CI/CD blocks on type errors

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Build breaks | High | Medium | Fix incrementally |
| Missed errors | Low | High | Run full type check |

---

## Related Files

- `next.config.js`
- `prisma/schema.prisma`
- `src/app/api/**/*.ts`
- `tsconfig.json`
