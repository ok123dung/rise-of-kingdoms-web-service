# Payment Webhook Retry System

## Overview

A robust webhook retry mechanism for payment providers (MoMo, ZaloPay, VNPay) with:

- Automatic retry with exponential backoff
- Webhook event persistence
- Manual retry capability
- Monitoring dashboard
- Automatic cleanup

## Architecture

### Components

1. **WebhookRetryService** (`/src/lib/webhooks/retry-service.ts`)
   - Core retry logic
   - Event processing
   - Provider-specific handlers

2. **Webhook Processor** (`/src/lib/webhooks/processor.ts`)
   - Background job management
   - Scheduled processing
   - Cleanup tasks

3. **Webhook Endpoints** (`/src/app/api/webhooks/[provider]/route.ts`)
   - Receive webhooks
   - Verify signatures
   - Store events for processing

4. **Monitoring API** (`/src/app/api/admin/webhooks/route.ts`)
   - List webhook events
   - Manual retry
   - Statistics

## Database Schema

```prisma
model WebhookEvent {
  id              String   @id @default(cuid())
  provider        String   // 'momo', 'zalopay', 'vnpay'
  eventType       String
  eventId         String   @unique
  payload         Json
  status          String   @default("pending")
  attempts        Int      @default(0)
  lastAttemptAt   DateTime?
  nextRetryAt     DateTime?
  errorMessage    String?
  processedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Configuration

### Retry Settings

```typescript
{
  maxAttempts: 5,
  initialDelay: 60000,     // 1 minute
  maxDelay: 3600000,       // 1 hour
  backoffMultiplier: 2
}
```

### Environment Variables

```env
# Cron job security
CRON_SECRET=your-cron-secret

# Payment provider keys (for signature verification)
MOMO_ACCESS_KEY=xxx
MOMO_SECRET_KEY=xxx
ZALOPAY_KEY2=xxx
VNPAY_HASH_SECRET=xxx
```

## Webhook Flow

1. **Receive Webhook**
   - Provider sends webhook to `/api/webhooks/[provider]`
   - Verify signature
   - Store event in database
   - Return success immediately

2. **Process Event**
   - Attempt immediate processing
   - If fails, schedule retry
   - Update payment/booking status
   - Send real-time notifications

3. **Retry Logic**
   - Exponential backoff: 1min, 2min, 4min, 8min, 16min
   - Max 5 attempts
   - Automatic failure after max attempts

4. **Cleanup**
   - Delete completed/failed events after 30 days
   - Run daily cleanup job

## Usage

### Webhook Endpoints

#### MoMo Webhook

```
POST /api/webhooks/momo
Content-Type: application/json

{
  "partnerCode": "xxx",
  "orderId": "xxx",
  "requestId": "xxx",
  "amount": 100000,
  "transId": "xxx",
  "resultCode": 0,
  "message": "Success",
  "signature": "xxx"
}
```

#### ZaloPay Webhook

```
POST /api/webhooks/zalopay
Content-Type: application/x-www-form-urlencoded

data={...}&mac=xxx
```

#### VNPay Webhook (IPN)

```
GET /api/webhooks/vnpay?vnp_TxnRef=xxx&vnp_SecureHash=xxx...
```

### Manual Processing

#### Process Pending Webhooks

```typescript
import { webhookService } from '@/lib/webhooks/processor'

// Process all pending webhooks
await webhookService.processPendingWebhooks()

// Process specific webhook
await webhookService.processWebhookEvent(eventId)
```

#### Retry Failed Webhook

```bash
curl -X POST https://your-domain.com/api/admin/webhooks \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "momo_123_456"}'
```

## Monitoring

### Admin Dashboard Component

```tsx
import { WebhookMonitor } from '@/components/admin/WebhookMonitor'

// In your admin page
;<WebhookMonitor />
```

### API Endpoints

#### List Webhooks

```
GET /api/admin/webhooks?status=failed&provider=momo
```

#### Get Statistics

Response includes:

- Total events
- Pending count
- Processing count
- Completed count
- Failed count

## Cron Jobs

### Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/webhooks",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Manual Cron Trigger

```bash
curl https://your-domain.com/api/cron/webhooks \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Error Handling

### Common Errors

1. **Payment Not Found**
   - Webhook received before payment record created
   - Solution: Retry later

2. **Invalid Signature**
   - Security check failed
   - Solution: Check provider keys

3. **Database Connection**
   - Temporary connection issue
   - Solution: Automatic retry

### Error Recovery

- Failed webhooks can be manually retried
- Events persist until processed or max attempts reached
- Error messages stored for debugging

## Security

1. **Signature Verification**
   - All webhooks verify provider signatures
   - Invalid signatures rejected immediately

2. **Idempotency**
   - Event IDs prevent duplicate processing
   - Safe to receive same webhook multiple times

3. **Access Control**
   - Admin endpoints require authentication
   - Cron endpoint protected by secret

## Best Practices

1. **Always Return Success**
   - Return 200 OK to provider immediately
   - Process asynchronously

2. **Log Everything**
   - Log webhook receipt
   - Log processing attempts
   - Log failures with details

3. **Monitor Actively**
   - Check failed webhooks daily
   - Set alerts for high failure rates
   - Review processing times

4. **Test Thoroughly**
   - Test each provider's webhook
   - Test retry mechanism
   - Test failure scenarios

## Testing

### Simulate Webhook

```typescript
// Store test webhook
await webhookService.storeWebhookEvent('momo', 'payment_notification', 'test_123', {
  orderId: 'TEST123',
  amount: 100000,
  resultCode: 0
})

// Process it
await webhookService.processWebhookEvent('test_123')
```

### Test Retry Logic

```typescript
// Force failure by using non-existent payment
// Watch retry attempts in logs
```

## Troubleshooting

### Webhooks Not Processing

1. Check cron job is running
2. Verify database connection
3. Check for errors in webhook table

### High Failure Rate

1. Check payment creation timing
2. Verify provider configuration
3. Review error messages in database

### Memory Issues

1. Reduce batch size in processor
2. Increase cleanup frequency
3. Check for infinite loops
