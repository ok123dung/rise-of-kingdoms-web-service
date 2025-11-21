# Sentry Error Tracking Setup Guide

## Overview

This guide explains how to set up and use Sentry error tracking in the RoK Services application.

## Environment Variables

Add these to your `.env.local` file:

```bash
# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org_name
SENTRY_PROJECT=your_sentry_project_name
SENTRY_AUTH_TOKEN=your_sentry_auth_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

## Features Implemented

### 1. Automatic Error Capture

- All unhandled errors are automatically captured
- Client-side and server-side errors tracked separately
- Edge Runtime compatible

### 2. Performance Monitoring

- API response time tracking
- Database query performance monitoring
- Custom transaction tracking

### 3. User Context

- Automatic user identification on login
- User context included in error reports
- Session tracking

### 4. Custom Error Classes

```typescript
import { AppError, ValidationError, AuthenticationError } from '@/lib/error-handler'

// Throw custom errors
throw new ValidationError('Invalid input', { field: 'email' })
throw new AuthenticationError('Invalid credentials')
```

### 5. Manual Error Capture

```typescript
import { captureException, captureMessage } from '@/lib/monitoring/sentry'

// Capture exceptions with context
captureException(error, {
  tags: { module: 'payment' },
  extra: { orderId: '123' },
  level: 'error'
})

// Capture messages
captureMessage('Payment failed', 'warning', {
  payment: { amount: 1000, provider: 'momo' }
})
```

### 6. Performance Tracking

```typescript
import { measurePerformance, monitorApiCall } from '@/lib/monitoring/sentry'

// Measure function performance
const result = await measurePerformance('processPayment', async () => {
  return await processPayment(data)
})

// Monitor API calls
monitorApiCall('/api/bookings', 'POST', responseTime, statusCode)
```

### 7. Breadcrumbs & Events

```typescript
import { addBreadcrumb, trackEvent } from '@/lib/monitoring/sentry'

// Add breadcrumb
addBreadcrumb('User clicked checkout', { cartTotal: 5000 })

// Track custom events
trackEvent('payment_initiated', { method: 'momo', amount: 5000 })
```

## Error Boundaries

### Application Error Boundary

- Location: `/src/components/ErrorBoundary.tsx`
- Catches React component errors
- Shows user-friendly error UI
- Automatically reports to Sentry

### Page-Level Error Handling

- `/src/app/error.tsx` - Handles page-level errors
- `/src/app/global-error.tsx` - Handles critical app errors

## Session Replay

Session replay is enabled for better debugging:

- Records user interactions before errors
- Automatically masks sensitive data
- 30-day retention

## Alerts & Notifications

Configure alerts in Sentry dashboard:

1. Error rate alerts
2. Performance degradation alerts
3. Crash-free session rate monitoring

## Best Practices

1. **Add Context**: Always include relevant context when capturing errors

```typescript
captureException(error, {
  tags: { feature: 'booking', action: 'create' },
  extra: { bookingData: sanitizedData }
})
```

2. **Use Custom Error Classes**: Throw appropriate error types

```typescript
if (!user) throw new AuthenticationError('User not found')
if (!valid) throw new ValidationError('Invalid input')
```

3. **Track Key Events**: Monitor important user actions

```typescript
trackEvent('booking_completed', { serviceId, amount })
trackEvent('payment_failed', { reason, provider })
```

4. **Monitor Performance**: Track slow operations

```typescript
const result = await measurePerformance('heavy_operation', async () => {
  return await heavyOperation()
})
```

## Debugging

### View Errors in Sentry

1. Go to your Sentry dashboard
2. Filter by environment (development/production)
3. View error details, stack traces, and user context

### Local Development

- Errors are logged to console in development
- Full error details shown in dev mode
- Sentry reporting can be disabled with `SENTRY_DISABLED=true`

## Security

- No sensitive data in error messages
- PII automatically scrubbed
- Session replay masks all inputs
- Secure tunneling through `/monitoring` route

## Monitoring Dashboard

Access your monitoring dashboard at:

- Development: https://sentry.io/organizations/[your-org]/projects/[your-project]
- Alerts: Configure at Settings > Alerts
- Performance: View at Performance tab
