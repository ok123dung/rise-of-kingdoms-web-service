# Phase 02: Payment Integration

**Date:** 2025-11-30
**Priority:** 🟡 HIGH
**Status:** Partially Complete
**Effort:** 3-5 days

---

## Context Links
- Main Plan: [plan.md](./plan.md)
- Related: `src/lib/payments/`

---

## Key Insights

1. **MoMo:** Complete implementation w/ HMAC-SHA256 signature
2. **VNPay:** Implementation ready, needs credentials
3. **ZaloPay:** Implementation ready, needs credentials
4. **Webhook:** Full retry system w/ exponential backoff

---

## Requirements

### MoMo Configuration
- [ ] Obtain `MOMO_PARTNER_CODE`
- [ ] Obtain `MOMO_ACCESS_KEY`
- [ ] Obtain `MOMO_SECRET_KEY`
- [ ] Test sandbox transactions

### VNPay Configuration
- [ ] Obtain `VNPAY_TMN_CODE`
- [ ] Obtain `VNPAY_HASH_SECRET`
- [ ] Configure IPN URL
- [ ] Test sandbox transactions

### ZaloPay Configuration
- [ ] Obtain `ZALOPAY_APP_ID`
- [ ] Obtain `ZALOPAY_KEY1`, `ZALOPAY_KEY2`
- [ ] Configure callback URL
- [ ] Test sandbox transactions

---

## Architecture

```
Payment Flow:
User → /api/payments/create → Gateway (MoMo/VNPay/ZaloPay)
                                    ↓
                              Gateway Redirect
                                    ↓
                              /api/webhooks/{gateway}
                                    ↓
                              Update Payment Status
                                    ↓
                              Discord Notification
```

---

## Related Files

- `src/lib/payments/momo.ts` - 19KB, complete
- `src/lib/payments/vnpay.ts` - 22KB, complete
- `src/lib/payments/zalopay.ts` - 16KB, complete
- `src/lib/payments/banking.ts` - 18KB, bank transfer support
- `src/app/api/webhooks/` - Webhook handlers

---

## Implementation Steps

### 1. MoMo Setup
```env
# Production credentials (from MoMo merchant portal)
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_API_ENDPOINT=https://payment.momo.vn/v2/gateway/api
```

### 2. VNPay Setup
```env
# Production credentials (from VNPay merchant portal)
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_API_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_RETURN_URL=https://rokdbot.com/booking/success
```

### 3. ZaloPay Setup
```env
# Production credentials (from ZaloPay merchant portal)
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2
```

### 4. Webhook Configuration
- Configure webhook URLs in each gateway's merchant portal
- MoMo: `https://rokdbot.com/api/webhooks/momo`
- VNPay: `https://rokdbot.com/api/webhooks/vnpay`
- ZaloPay: `https://rokdbot.com/api/webhooks/zalopay`

### 5. Test Transactions
1. Create test booking
2. Initiate payment for each gateway
3. Complete sandbox payment
4. Verify webhook processing
5. Check payment status update

---

## Todo List

- [ ] Register MoMo merchant account
- [ ] Register VNPay merchant account
- [ ] Register ZaloPay merchant account
- [ ] Configure sandbox credentials
- [ ] Test each payment flow E2E
- [ ] Configure production credentials
- [ ] Setup Discord payment notifications
- [ ] Document payment troubleshooting guide

---

## Success Criteria

- [ ] All 3 payment gateways functional
- [ ] Webhook processing verified
- [ ] Refund flow tested
- [ ] Error handling covers edge cases

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gateway rejection | Low | High | Apply early, provide all docs |
| Webhook timing issues | Medium | Medium | Retry system already implemented |
| Currency conversion errors | Low | Medium | All amounts in VND |

---

## Next Steps

After completion → [Phase 03: Performance Optimization](./phase-03-performance-optimization.md)
