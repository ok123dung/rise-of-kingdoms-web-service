# Phase 03: Performance Optimization

**Date:** 2025-11-30
**Priority:** 🟢 MEDIUM
**Status:** Ready to Start
**Effort:** 2-3 days

---

## Context Links
- Main Plan: [plan.md](./plan.md)
- Related: `src/lib/cache.ts`, `next.config.js`

---

## Key Insights

1. **Database:** Enhanced Prisma w/ circuit breaker already implemented
2. **Caching:** API cache system exists but underutilized
3. **Images:** OptimizedImage component present
4. **Build:** Sentry + Bundle analyzer configured

---

## Requirements

### Database Performance
- [ ] Review slow query logs (>1000ms threshold)
- [ ] Add missing indexes for common queries
- [ ] Implement query result caching

### Frontend Performance
- [ ] Run Lighthouse audit (target: 90+ mobile)
- [ ] Optimize LCP (target: <2.5s)
- [ ] Implement image lazy loading
- [ ] Add service worker for caching

### API Performance
- [ ] Enable response caching for read endpoints
- [ ] Implement stale-while-revalidate patterns
- [ ] Add ETags for conditional requests

---

## Architecture

```
Current Optimizations:
├── Database: Circuit breaker, connection pooling
├── API: Rate limiting, response streaming
├── Frontend: OptimizedImage, dynamic imports
└── Build: Tree shaking, code splitting
```

---

## Related Files

- `src/lib/db.ts` - Database w/ circuit breaker
- `src/lib/cache.ts` - API caching utilities
- `src/lib/api-cache.ts` - Response caching
- `src/components/ui/OptimizedImage.tsx` - Image component
- `next.config.js` - Build optimization

---

## Implementation Steps

### 1. Database Optimization
```typescript
// Add indexes for common queries (prisma/schema.prisma)
@@index([userId, status, createdAt])  // Booking queries
@@index([email, status])               // User lookups
@@index([serviceTierId, createdAt])   // Service analytics
```

### 2. Enable API Caching
```typescript
// In API routes
import { withCache } from '@/lib/api-cache'

export const GET = withCache(
  async (req) => { /* handler */ },
  { ttl: 60, tags: ['services'] }
)
```

### 3. Image Optimization
```typescript
// Update next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  deviceSizes: [640, 750, 828, 1080, 1200],
}
```

### 4. Lighthouse Audit
```bash
npm run build
npm run start
# Run Lighthouse in Chrome DevTools
# Or use: npx lighthouse https://rokdbot.com --view
```

---

## Todo List

- [ ] Run initial Lighthouse audit
- [ ] Add database indexes
- [ ] Enable API response caching
- [ ] Optimize image formats
- [ ] Test Core Web Vitals
- [ ] Document performance baselines

---

## Success Criteria

| Metric | Target | Current |
|--------|--------|---------|
| LCP | <2.5s | TBD |
| FID | <100ms | TBD |
| CLS | <0.1 | TBD |
| Lighthouse Mobile | 90+ | TBD |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cache invalidation bugs | Medium | Medium | Implement cache tags |
| Image CDN costs | Low | Low | Use Cloudflare R2 |

---

## Next Steps

After completion → [Phase 04: Testing & Quality](./phase-04-testing-quality.md)
