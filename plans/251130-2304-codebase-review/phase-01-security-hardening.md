# Phase 01: Security Hardening

**Date:** 2025-11-30
**Priority:** 🔴 CRITICAL
**Status:** Not Started
**Effort:** 1-2 days

---

## Context Links
- Main Plan: [plan.md](./plan.md)
- Related: `src/lib/security/`, `src/middleware.ts`

---

## Key Insights

1. **Credentials Exposed:** `.env.local` contains Supabase credentials in git status
2. **CSP Migration Needed:** Currently using `unsafe-inline`/`unsafe-eval`
3. **Strong Foundations:** Rate limiting, HSTS, security headers already implemented

---

## Requirements

### Critical (Do First)
- [ ] Rotate database credentials (Supabase)
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Generate new `API_SECRET_KEY`, `JWT_SECRET`, `ENCRYPTION_KEY`
- [ ] Ensure `.env.local` is in `.gitignore`

### High Priority
- [ ] Configure Resend API key for production emails
- [ ] Set up Discord bot token for notifications
- [ ] Review admin user creation process

---

## Architecture

```
Current Security Stack:
├── Authentication: NextAuth.js + 2FA (TOTP)
├── Password: bcrypt 14 rounds + history check
├── Headers: CSP, X-Frame-Options, HSTS
├── Rate Limiting: LRU cache-based per endpoint
└── Validation: Zod schemas on all API endpoints
```

---

## Related Files

- `src/lib/auth.ts` - Auth configuration
- `src/lib/security/csp-config.ts` - CSP directives
- `src/middleware.ts` - Security middleware
- `src/lib/rate-limit.ts` - Rate limiting
- `src/lib/password-validation.ts` - Password policies

---

## Implementation Steps

### 1. Credential Rotation (30 min)
```bash
# Generate new secrets
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -base64 32  # API_SECRET_KEY
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # ENCRYPTION_KEY
```

### 2. Supabase Password Reset
- Login to Supabase dashboard
- Navigate to Settings > Database
- Reset database password
- Update `DATABASE_URL` and `DIRECT_URL` in Vercel/env

### 3. Environment Audit
```bash
# Verify .gitignore
grep -q ".env.local" .gitignore && echo "OK" || echo "ADD IT"

# Check no secrets in git
git log --all --full-history -- "*.env*"
```

### 4. CSP Migration (Optional - Post-Launch)
Follow checklist in `src/lib/security/csp-config.ts`:
- Enable report-only mode first
- Implement nonce generation
- Remove unsafe directives

---

## Todo List

- [ ] Rotate Supabase credentials
- [ ] Generate new auth secrets
- [ ] Update Vercel environment variables
- [ ] Verify .gitignore covers all env files
- [ ] Test auth flows after credential update
- [ ] Document new credentials securely

---

## Success Criteria

- [ ] All credentials rotated
- [ ] No secrets in git history
- [ ] Auth flows working with new secrets
- [ ] Production environment variables updated

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Service downtime during rotation | Medium | High | Rotate during low traffic |
| Lost access to DB | Low | Critical | Keep backup of old credentials |

---

## Security Considerations

- Store new credentials in password manager
- Use Vercel environment variables for production
- Never commit secrets to git
- Enable Vercel's secret encryption

---

## Next Steps

After completion → [Phase 02: Payment Integration](./phase-02-payment-integration.md)
