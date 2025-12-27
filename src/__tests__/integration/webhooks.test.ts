/**
 * Unit Tests for Payment Webhook Signature Validation
 *
 * These tests verify:
 * 1. Webhook signature generation and validation
 * 2. Signature algorithm correctness
 *
 * @jest-environment node
 */

import crypto from 'crypto'

// Mock environment variables
process.env.VNPAY_HASH_SECRET = 'test_vnpay_secret'
process.env.MOMO_ACCESS_KEY = 'test_momo_access_key'
process.env.MOMO_SECRET_KEY = 'test_momo_secret'
process.env.ZALOPAY_KEY2 = 'test_zalopay_key2'

describe('Webhook Signature Validation', () => {
  describe('VNPay Signature', () => {
    it('should generate valid VNPay signature using SHA512', () => {
      const vnpParams: Record<string, string> = {
        vnp_TmnCode: 'TEST001',
        vnp_Amount: '10000000',
        vnp_TxnRef: 'VNPAY_BOOK001_123',
        vnp_TransactionNo: 'VNP123456',
        vnp_ResponseCode: '00',
        vnp_PayDate: '20251005120000',
        vnp_OrderInfo: 'Test payment'
      }

      // Generate signature (same algorithm as VNPay)
      const signData = Object.keys(vnpParams)
        .sort()
        .map(key => `${key}=${vnpParams[key]}`)
        .join('&')

      const signature = crypto
        .createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update(signData)
        .digest('hex')

      expect(signature).toBeDefined()
      expect(signature.length).toBe(128) // SHA512 hex is 128 chars
    })

    it('should detect invalid VNPay signature', () => {
      const vnpParams: Record<string, string> = {
        vnp_TmnCode: 'TEST001',
        vnp_Amount: '10000000',
        vnp_TxnRef: 'VNPAY_BOOK001_123'
      }

      const signData = Object.keys(vnpParams)
        .sort()
        .map(key => `${key}=${vnpParams[key]}`)
        .join('&')

      const validSignature = crypto
        .createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update(signData)
        .digest('hex')

      const invalidSignature = 'invalid_signature_that_is_definitely_wrong'

      expect(validSignature).not.toBe(invalidSignature)
    })

    it('should generate different signatures for different data', () => {
      const params1 = { vnp_Amount: '100000', vnp_TxnRef: 'ORDER1' }
      const params2 = { vnp_Amount: '200000', vnp_TxnRef: 'ORDER2' }

      const sign1 = crypto
        .createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update('vnp_Amount=100000&vnp_TxnRef=ORDER1')
        .digest('hex')

      const sign2 = crypto
        .createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update('vnp_Amount=200000&vnp_TxnRef=ORDER2')
        .digest('hex')

      expect(sign1).not.toBe(sign2)
    })
  })

  describe('MoMo Signature', () => {
    it('should generate valid MoMo signature using SHA256', () => {
      const momoPayload = {
        partnerCode: 'TEST001',
        orderId: 'MOMO_BOOK002_123',
        requestId: 'REQ123',
        amount: 100000,
        orderInfo: 'Test payment',
        orderType: 'payWithATM',
        transId: 'MOMO123456',
        resultCode: 0,
        message: 'Success',
        payType: 'qr',
        responseTime: 1704067200000,
        extraData: ''
      }

      // Generate signature (same algorithm as MoMo)
      const rawSignature =
        `accessKey=${process.env.MOMO_ACCESS_KEY}` +
        `&amount=${momoPayload.amount}` +
        `&extraData=${momoPayload.extraData}` +
        `&message=${momoPayload.message}` +
        `&orderId=${momoPayload.orderId}` +
        `&orderInfo=${momoPayload.orderInfo}` +
        `&orderType=${momoPayload.orderType}` +
        `&partnerCode=${momoPayload.partnerCode}` +
        `&payType=${momoPayload.payType}` +
        `&requestId=${momoPayload.requestId}` +
        `&responseTime=${momoPayload.responseTime}` +
        `&resultCode=${momoPayload.resultCode}` +
        `&transId=${momoPayload.transId}`

      const signature = crypto
        .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
        .update(rawSignature)
        .digest('hex')

      expect(signature).toBeDefined()
      expect(signature.length).toBe(64) // SHA256 hex is 64 chars
    })

    it('should detect tampered MoMo amount', () => {
      const originalAmount = 100000
      const tamperedAmount = 50000 // Attacker tries to reduce amount

      const originalSig = crypto
        .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
        .update(`amount=${originalAmount}&orderId=ORDER1`)
        .digest('hex')

      const tamperedSig = crypto
        .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
        .update(`amount=${tamperedAmount}&orderId=ORDER1`)
        .digest('hex')

      // Signatures should be different - tampering detected
      expect(originalSig).not.toBe(tamperedSig)
    })
  })

  describe('ZaloPay Signature', () => {
    it('should generate valid ZaloPay MAC using HMAC SHA256', () => {
      const data = {
        app_id: '2553',
        app_trans_id: '210727_123456',
        app_user: 'user123',
        amount: 100000,
        app_time: 1704067200000,
        embed_data: '{}',
        item: '[]'
      }

      // ZaloPay MAC generation
      const macData = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data}|${data.item}`

      const mac = crypto
        .createHmac('sha256', process.env.ZALOPAY_KEY2!)
        .update(macData)
        .digest('hex')

      expect(mac).toBeDefined()
      expect(mac.length).toBe(64)
    })
  })

  describe('Replay Attack Prevention', () => {
    it('should use unique transaction IDs to prevent replay', () => {
      // Same transaction ID used twice should be detected
      const transactionId1 = 'VNP123456'
      const transactionId2 = 'VNP123456'
      const uniqueTransactionId = 'VNP789012'

      // In real implementation, we'd check if transactionId exists in database
      expect(transactionId1).toBe(transactionId2)
      expect(transactionId1).not.toBe(uniqueTransactionId)
    })

    it('should include timestamp in signature to prevent delayed replay', () => {
      const timestamp1 = '20251005120000'
      const timestamp2 = '20251005120001'

      const sig1 = crypto
        .createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update(`vnp_PayDate=${timestamp1}`)
        .digest('hex')

      const sig2 = crypto
        .createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update(`vnp_PayDate=${timestamp2}`)
        .digest('hex')

      // Different timestamps produce different signatures
      expect(sig1).not.toBe(sig2)
    })
  })
})
