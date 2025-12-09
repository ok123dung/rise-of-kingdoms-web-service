# Code Review: Authentication Implementation

## Code Review Summary

### Scope
- Files reviewed:
  - `src/app/auth/signin/page.tsx` (signin page)
  - `src/app/auth/signup/page.tsx` (signup page)
  - `src/app/api/auth/signup/route.ts` (signup API)
  - `src/app/api/auth/check-2fa/route.ts` (2FA check API)
  - `src/app/api/auth/[...nextauth]/route.ts` (NextAuth handler)
  - `src/lib/auth.ts` (main auth config)
  - `src/lib/auth-enhanced.ts` (enhanced auth config)
  - `src/lib/auth-security.ts` (security utilities)
  - `src/middleware/auth.ts` (auth middleware)
  - `src/lib/csrf-protection.ts` (CSRF protection)
  - `src/lib/validation.ts` (input validation)
  - `src/lib/password-validation.ts` (password validation)
- Lines of code analyzed: ~2,400
- Review focus: Authentication system, security practices, code quality
- Updated plans: None (no plan file found for auth implementation)

### Overall Assessment
**MIXED - Strong foundation with critical security gaps**

Auth implementation shows good security practices in many areas (password hashing, 2FA, rate limiting) but has **critical vulnerabilities** in CSRF protection, password verification timing attacks, and session security. Build succeeds but security posture needs immediate attention.

---

## Critical Issues

### 1. **CSRF Token Not Enforced on Signup** 🔴
**Location**: `src/app/auth/signup/page.tsx` (L109-128)

**Issue**: Signup form retrieves CSRF token from cookie but doesn't fail if missing - only adds if available.

```typescript
const csrfToken = getCsrfToken()
const headers: Record<string, string> = {
  'Content-Type': 'application/json'
}
if (csrfToken) {  // ⚠️ Should be REQUIRED
  headers['x-csrf-token'] = csrfToken
}
```

**Impact**: CSRF attacks possible on signup endpoint. Attackers can create accounts on behalf of victims.

**Fix**: Reject submission if CSRF token missing. Show error to user.

---

### 2. **Password Verification Timing Attack** 🔴
**Location**: `src/app/api/auth/check-2fa/route.ts` (L37-38)

**Issue**: `/api/auth/check-2fa` exposes whether password is valid before checking 2FA - creates timing attack oracle.

```typescript
const isValidPassword = await bcrypt.compare(password, user.password || '')
if (!isValidPassword) {
  return NextResponse.json({
    requires2FA: false,
    error: 'Invalid credentials'  // ⚠️ Reveals password is wrong
  })
}
```

**Impact**: Attackers can enumerate valid email/password combos by timing response, bypassing rate limits via separate endpoint.

**Fix**: Remove this endpoint. Handle 2FA check within main signin flow after authentication.

---

### 3. **User ID Leakage in 2FA Check** 🔴
**Location**: `src/app/api/auth/check-2fa/route.ts` (L49-52)

**Issue**: Returns `user_id` in response before authentication complete.

```typescript
return NextResponse.json({
  requires2FA: is2FAEnabled,
  user_id: user.id  // ⚠️ Leaks internal user IDs
})
```

**Impact**: Reveals internal user IDs to unauthenticated users. Aids account enumeration attacks.

**Fix**: Never return user IDs in pre-auth responses.

---

### 4. **Weak CSRF Protection on Signin** 🔴
**Location**: `src/app/auth/signin/page.tsx`

**Issue**: No CSRF token validation on signin form at all. Relies solely on NextAuth default CSRF.

**Impact**: If NextAuth CSRF bypassed, signin vulnerable to CSRF. Given custom check-2fa endpoint exists, attack surface expanded.

**Fix**: Implement explicit CSRF token validation for custom auth flows.

---

### 5. **No Rate Limiting on check-2fa Endpoint** 🔴
**Location**: `src/app/api/auth/check-2fa/route.ts`

**Issue**: Endpoint has NO rate limiting despite being authentication-related.

**Impact**: Can be used for credential stuffing/brute force attacks bypassing main signin rate limit.

**Fix**: Add rate limiting (same as signup: 5 req/min per IP).

---

## High Priority Findings

### 6. **Inconsistent Auth Config Usage**
**Location**: `src/app/api/auth/[...nextauth]/route.ts`

**Issue**: Uses `authOptionsEnhanced` from `auth-enhanced.ts`, but main app likely references `auth.ts`. Two configs exist with different security features.

```typescript
// route.ts uses:
import { authOptionsEnhanced as authOptions } from '@/lib/auth-enhanced'

// But auth.ts also exports authOptions with DIFFERENT callbacks
```

**Impact**: Confusion about which config active. `auth-enhanced.ts` has better security (account lockout, session rotation) but may not be used everywhere.

**Fix**: Consolidate to single auth config. Remove unused file.

---

### 7. **Password History Not Used**
**Location**: `src/lib/auth.ts` (L60-106)

**Issue**: Password history functions defined but NEVER called during password change/reset.

**Impact**: Users can reuse old passwords, violating OWASP password rotation best practices.

**Fix**: Call `checkPasswordHistory()` in password change API before accepting new password.

---

### 8. **Brute Force Protection Uses In-Memory Map**
**Location**: `src/lib/auth.ts` (L460-518)

**Issue**: Failed login attempts stored in `Map` (in-memory). Resets on server restart. Doesn't work across instances.

```typescript
const failedAttempts = new Map<string, { count: number; ... }>()
```

**Impact**: In production with multiple instances/restarts, brute force protection ineffective.

**Fix**: Use Redis or database for persistent failed attempt tracking.

---

### 9. **Account Lockout Also In-Memory**
**Location**: `src/lib/auth-security.ts` (L26-27)

**Issue**: Same problem - `failedAttempts` Map resets on restart.

```typescript
const failedAttempts = new Map<string, FailedAttempt>()
```

**Impact**: Account lockouts don't persist across deployments/restarts.

**Fix**: Persist to Redis/database.

---

### 10. **Missing HTTPS-Only Cookie Flags**
**Location**: Throughout (implicit)

**Issue**: No evidence of secure cookie configuration in NextAuth config. Default cookies may not be `Secure` in production.

**Impact**: Cookies transmitted over HTTP in some scenarios, enabling session hijacking.

**Fix**: Explicitly set:
```typescript
cookies: {
  sessionToken: {
    name: '__Secure-next-auth.session-token',
    options: { httpOnly: true, secure: true, sameSite: 'lax' }
  }
}
```

---

### 11. **Session Max Age Too Long**
**Location**: `src/lib/auth.ts` (L291), `src/lib/auth-enhanced.ts` (L167)

**Issue**: 30-day session max age without forced re-auth for sensitive operations.

```typescript
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60  // 30 days
}
```

**Impact**: Compromised session valid for 30 days. Excessive for sensitive financial service.

**Fix**: Reduce to 7 days max. Require re-auth for payments/sensitive actions.

---

## Medium Priority Improvements

### 12. **Missing Input Sanitization on Email**
**Location**: `src/app/api/auth/signup/route.ts` (L45)

**Issue**: Email lowercased but not fully sanitized before database query.

```typescript
email: sanitizeInput((body.email ?? '').toLowerCase())
```

**Impact**: `sanitizeInput` removes scripts but doesn't handle SQL injection (Prisma handles this) or whitespace normalization. Minor consistency issue.

**Fix**: Add `.trim()` to email normalization.

---

### 13. **Password Validation Mismatch Client/Server**
**Location**: `src/app/auth/signup/page.tsx` (L62-81) vs `src/lib/password-validation.ts`

**Issue**: Client validates 12+ chars, server schema also requires 12+, but error messages differ. Client doesn't check for common passwords.

**Impact**: User sees validation pass client-side, fails server-side with different error.

**Fix**: Import `validatePassword()` function on client for consistency (with async loading).

---

### 14. **Auto-Signin After Signup Security Concern**
**Location**: `src/app/auth/signup/page.tsx` (L165-178)

**Issue**: Auto-signs in user immediately after signup without email verification.

```typescript
setTimeout(() => {
  void (async () => {
    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,  // ⚠️ Password in memory
      redirect: false
    })
```

**Impact**:
1. Password kept in state longer than necessary
2. No email verification before access granted
3. Automated attacks can create + use accounts immediately

**Fix**: Clear password from state. Consider email verification before full access.

---

### 15. **Insufficient Error Context in Logs**
**Location**: Multiple auth files

**Issue**: Security events logged without sufficient context (IP, user-agent, etc).

Example: `src/lib/auth.ts` (L403-409)
```typescript
export const logSecurityEvent = (event: string, data: Record<string, unknown>) => {
  getLogger().warn(`Security event: ${event}`, data as LogContext)
  // ⚠️ Missing IP, user-agent, timestamp context
}
```

**Impact**: Difficult to investigate security incidents. Can't correlate events.

**Fix**: Include IP, user-agent, request ID in all security logs.

---

### 16. **Discord OAuth Creates Users Without Passwords**
**Location**: `src/lib/auth.ts` (L325-343)

**Issue**: Discord OAuth users created with empty password field.

```typescript
password: '',  // ⚠️ Empty password
```

**Impact**: If account linking fails or user wants password auth later, no migration path. Database constraint may fail.

**Fix**: Generate random secure password for OAuth users. Allow password setup later.

---

### 17. **Admin Role Check Hardcoded**
**Location**: `src/middleware/auth.ts` (L63)

**Issue**: Role check uses string comparison `token.role !== 'ADMIN'` but other places use `'admin'` (lowercase).

**Impact**: Inconsistent role checking may allow access when it shouldn't.

**Fix**: Normalize role checking. Use enum or constants.

---

### 18. **Rate Limiter Identifier Truncation**
**Location**: `src/middleware/auth.ts` (L112)

**Issue**: User-agent truncated to 50 chars for rate limit key.

```typescript
const identifier = `${ip}:${user_agent.substring(0, 50)}`
```

**Impact**: Different user-agents may collide after truncation, causing false positives.

**Fix**: Hash user-agent instead of truncating.

---

## Low Priority Suggestions

### 19. **Unused Discord Sign-In Handler**
**Location**: `src/app/auth/signup/page.tsx` (L187-189)

**Issue**: `_handleDiscordSignIn` function defined but commented out in UI.

**Impact**: Dead code. Confusion about whether Discord signup works.

**Fix**: Remove unused code or implement feature fully.

---

### 20. **Remember Me Checkbox Non-Functional**
**Location**: `src/app/auth/signin/page.tsx` (L216-224)

**Issue**: "Remember me" checkbox has no onChange handler, no effect on session duration.

**Impact**: User expectation mismatch. Checkbox does nothing.

**Fix**: Either implement (extend session max age) or remove checkbox.

---

### 21. **Magic Numbers in Config**
**Location**: Throughout

**Issue**: Many hardcoded numbers: `14` (bcrypt rounds), `5` (max attempts), `15 * 60 * 1000` (lockout duration).

**Impact**: Difficult to tune security settings. No central config.

**Fix**: Extract to config constants with comments explaining security rationale.

---

### 22. **Missing JSDoc Comments**
**Location**: Most functions

**Issue**: Security-critical functions lack documentation of assumptions, security considerations.

**Impact**: Future developers may misuse functions or introduce vulnerabilities.

**Fix**: Add JSDoc to all security functions explaining:
- Security purpose
- Threat model
- Assumptions/limitations

---

## Positive Observations

✅ **Strong Password Policy**: 12+ chars, complexity requirements, common password check, sequential/repeating char detection

✅ **bcrypt with 14 Rounds**: Follows OWASP 2024 recommendation for password hashing

✅ **2FA Implementation**: TOTP support with backup codes (not reviewed in detail but present)

✅ **Rate Limiting**: Present on signup/auth endpoints (though check-2fa missing)

✅ **CSRF Protection Framework**: Good CSRF validation logic, just not fully enforced

✅ **Input Sanitization**: XSS protection via `sanitizeInput()` function

✅ **Session Token Rotation**: `auth-enhanced.ts` implements token rotation (if used)

✅ **Account Lockout Logic**: Good implementation pattern (just needs persistence)

✅ **Password Strength Calculation**: Sophisticated scoring algorithm

✅ **Zod Validation**: Strong type-safe validation schemas

✅ **Proper HTTP Status Codes**: Correct use of 401/403/429 status codes

---

## Recommended Actions

### Immediate (Before Production)
1. **Remove `/api/auth/check-2fa` endpoint** - integrate into signin flow
2. **Enforce CSRF tokens** on signup form - reject if missing
3. **Add rate limiting** to all auth endpoints
4. **Migrate failed attempts to Redis/DB** - implement persistent tracking
5. **Set secure cookie flags** in NextAuth config
6. **Remove user_id from responses** before authentication

### High Priority (This Week)
7. **Consolidate auth configs** - remove duplicate auth.ts/auth-enhanced.ts
8. **Implement password history** in change password flow
9. **Reduce session max age** to 7 days
10. **Add email verification** before account activation
11. **Fix role checking consistency** - use enums

### Medium Priority (This Month)
12. **Normalize email handling** - trim whitespace
13. **Sync client/server validation** - share validation logic
14. **Clear passwords from memory** after use
15. **Enhance security logging** - add IP/user-agent context
16. **Hash user-agent** in rate limiter instead of truncating

### Low Priority (Backlog)
17. **Remove dead code** - unused Discord handlers
18. **Implement or remove** "remember me" feature
19. **Extract magic numbers** to config constants
20. **Add JSDoc** to security functions

---

## Metrics
- **Type Coverage**: ✅ Good (TypeScript strict mode, proper types)
- **Test Coverage**: ⚠️ Not evaluated (no test files reviewed)
- **Linting Issues**: ✅ Build succeeds, no blocking errors
- **Security Score**: 🟡 **6/10** (good foundation, critical gaps)
  - Password Security: 9/10
  - Session Security: 6/10
  - CSRF Protection: 4/10
  - Rate Limiting: 7/10
  - Input Validation: 8/10
  - Logging/Monitoring: 5/10

---

## Unresolved Questions
1. Which auth config is actually used in production - `auth.ts` or `auth-enhanced.ts`?
2. Is email verification implemented elsewhere (not reviewed)?
3. What's the production deployment architecture (single instance vs multi-instance)?
4. Is Redis available in production for rate limit/lockout persistence?
5. Are there integration tests covering auth flows?
6. Is the Discord OAuth fully configured and tested?
7. What's the password reset flow security posture (not reviewed)?
8. Are there monitoring alerts for failed login attempts?

---

**Review Date**: 2025-12-09
**Reviewer**: Code Review Expert
**Project**: rok-services
**Focus**: Authentication Implementation
