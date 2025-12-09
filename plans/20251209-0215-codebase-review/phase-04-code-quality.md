# Phase 04: Code Quality & Testing

**Priority:** LOW
**Status:** Pending
**Estimated Effort:** 4-6 hours

---

## Context

Improve overall code quality, test coverage, and maintainability.

---

## Issues

### 4.1 Test Coverage
**Current:** Basic tests exist
**Goal:** 80%+ coverage on critical paths

### 4.2 Error Message Localization
**Files:** `src/lib/errors.ts`, various API routes
**Issue:** Mixed Vietnamese/English error messages

### 4.3 Unused Code
**Files:** Various
**Issue:** Deprecated files still in codebase

### 4.4 Documentation
**Status:** Good but needs updates

---

## Implementation Steps

### Step 1: Add Critical Path Tests
```typescript
// src/__tests__/api/auth/signup.test.ts
describe('POST /api/auth/signup', () => {
  it('validates email format', async () => { ... })
  it('enforces password requirements', async () => { ... })
  it('prevents duplicate emails', async () => { ... })
  it('validates CSRF token', async () => { ... })
})
```

### Step 2: Implement i18n
```typescript
// src/lib/i18n/messages.ts
export const messages = {
  vi: {
    'error.invalid_email': 'Email không hợp lệ',
    'error.weak_password': 'Mật khẩu quá yếu',
    // ...
  },
  en: {
    'error.invalid_email': 'Invalid email format',
    'error.weak_password': 'Password too weak',
    // ...
  }
}
```

### Step 3: Clean Up Unused Code
1. Audit files in tsconfig exclusion list
2. Remove deprecated components
3. Update imports

### Step 4: Update Documentation
1. Refresh deployment guide
2. Document recent changes
3. Update architecture diagrams

---

## Success Criteria

- [ ] 80%+ test coverage on auth/payment
- [ ] Consistent error messages (i18n)
- [ ] No unused code in src/
- [ ] Documentation up to date

---

## Related Files

- `src/__tests__/**`
- `src/lib/errors.ts`
- `docs/**`
- `tsconfig.json`
