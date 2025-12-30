/**
 * Payment Config Validator Tests
 * Tests for payment gateway configuration validation
 */

import { validatePaymentConfig, getPaymentConfigReport } from '../config-validator'

describe('Payment Config Validator', () => {
  // Store original env
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    // Reset to clean env
    process.env = { ...originalEnv }
    // Clear all payment env vars
    delete process.env.MOMO_PARTNER_CODE
    delete process.env.MOMO_ACCESS_KEY
    delete process.env.MOMO_SECRET_KEY
    delete process.env.MOMO_ENDPOINT
    delete process.env.VNPAY_TMN_CODE
    delete process.env.VNPAY_HASH_SECRET
    delete process.env.VNPAY_URL
    delete process.env.ZALOPAY_APP_ID
    delete process.env.ZALOPAY_KEY1
    delete process.env.ZALOPAY_KEY2
    delete process.env.ZALOPAY_ENDPOINT
    delete process.env.BANK_ACCOUNT_NUMBER
    delete process.env.SEPAY_API_KEY
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validatePaymentConfig', () => {
    describe('with no configuration', () => {
      it('should return not production ready when nothing configured', () => {
        const result = validatePaymentConfig()

        expect(result.isProductionReady).toBe(false)
        expect(result.summary.configured).toBe(0)
        expect(result.summary.productionReady).toBe(0)
        expect(result.summary.total).toBe(4)
      })

      it('should have issues for all gateways', () => {
        const result = validatePaymentConfig()

        const momo = result.gateways.find(g => g.gateway === 'MoMo')
        expect(momo?.isConfigured).toBe(false)
        expect(momo?.issues).toContain('MOMO_PARTNER_CODE not set')
        expect(momo?.issues).toContain('MOMO_ACCESS_KEY not set')
        expect(momo?.issues).toContain('MOMO_SECRET_KEY not set')

        const vnpay = result.gateways.find(g => g.gateway === 'VNPay')
        expect(vnpay?.isConfigured).toBe(false)
        expect(vnpay?.issues).toContain('VNPAY_TMN_CODE not set')
        expect(vnpay?.issues).toContain('VNPAY_HASH_SECRET not set')

        const zalopay = result.gateways.find(g => g.gateway === 'ZaloPay')
        expect(zalopay?.isConfigured).toBe(false)
        expect(zalopay?.issues).toContain('ZALOPAY_APP_ID not set')
        expect(zalopay?.issues).toContain('ZALOPAY_KEY1 not set')
        expect(zalopay?.issues).toContain('ZALOPAY_KEY2 not set')
      })
    })

    describe('MoMo validation', () => {
      it('should be configured with all required env vars', () => {
        process.env.MOMO_PARTNER_CODE = 'PROD_PARTNER'
        process.env.MOMO_ACCESS_KEY = 'real_access_key'
        process.env.MOMO_SECRET_KEY = 'real_secret_key'
        process.env.MOMO_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create'

        const result = validatePaymentConfig()
        const momo = result.gateways.find(g => g.gateway === 'MoMo')

        expect(momo?.isConfigured).toBe(true)
        expect(momo?.isProduction).toBe(true)
        expect(momo?.issues).toHaveLength(0)
      })

      it('should detect sandbox endpoint', () => {
        process.env.MOMO_PARTNER_CODE = 'PROD_PARTNER'
        process.env.MOMO_ACCESS_KEY = 'real_access_key'
        process.env.MOMO_SECRET_KEY = 'real_secret_key'
        process.env.MOMO_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create'

        const result = validatePaymentConfig()
        const momo = result.gateways.find(g => g.gateway === 'MoMo')

        expect(momo?.isConfigured).toBe(true)
        expect(momo?.isProduction).toBe(false)
        expect(momo?.warnings).toContain('Using MoMo sandbox endpoint')
      })

      it('should warn on placeholder partner code', () => {
        process.env.MOMO_PARTNER_CODE = 'your-partner-code'
        process.env.MOMO_ACCESS_KEY = 'key'
        process.env.MOMO_SECRET_KEY = 'secret'

        const result = validatePaymentConfig()
        const momo = result.gateways.find(g => g.gateway === 'MoMo')

        expect(momo?.warnings).toContain('MOMO_PARTNER_CODE appears to be a placeholder')
      })

      it('should detect sandbox indicators in partner code', () => {
        const sandboxIndicators = ['sandbox_code', 'TEST123', 'demo_partner', 'dev_code']

        for (const code of sandboxIndicators) {
          process.env.MOMO_PARTNER_CODE = code
          process.env.MOMO_ACCESS_KEY = 'key'
          process.env.MOMO_SECRET_KEY = 'secret'

          const result = validatePaymentConfig()
          const momo = result.gateways.find(g => g.gateway === 'MoMo')

          expect(momo?.warnings).toContain('MOMO_PARTNER_CODE appears to be a placeholder')
        }
      })
    })

    describe('VNPay validation', () => {
      it('should be configured with all required env vars', () => {
        process.env.VNPAY_TMN_CODE = 'PROD_TMN'
        process.env.VNPAY_HASH_SECRET = 'real_secret'
        process.env.VNPAY_URL = 'https://pay.vnpay.vn/vpcpay.html'

        const result = validatePaymentConfig()
        const vnpay = result.gateways.find(g => g.gateway === 'VNPay')

        expect(vnpay?.isConfigured).toBe(true)
        expect(vnpay?.isProduction).toBe(true)
        expect(vnpay?.issues).toHaveLength(0)
      })

      it('should detect sandbox endpoint', () => {
        process.env.VNPAY_TMN_CODE = 'PROD_TMN'
        process.env.VNPAY_HASH_SECRET = 'real_secret'
        process.env.VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'

        const result = validatePaymentConfig()
        const vnpay = result.gateways.find(g => g.gateway === 'VNPay')

        expect(vnpay?.isConfigured).toBe(true)
        expect(vnpay?.isProduction).toBe(false)
        expect(vnpay?.warnings).toContain('Using VNPay sandbox endpoint')
      })

      it('should warn on placeholder TMN code', () => {
        process.env.VNPAY_TMN_CODE = 'your_tmn_code'
        process.env.VNPAY_HASH_SECRET = 'secret'

        const result = validatePaymentConfig()
        const vnpay = result.gateways.find(g => g.gateway === 'VNPay')

        expect(vnpay?.warnings).toContain('VNPAY_TMN_CODE appears to be a placeholder')
      })
    })

    describe('ZaloPay validation', () => {
      it('should be configured with all required env vars', () => {
        process.env.ZALOPAY_APP_ID = '12345'
        process.env.ZALOPAY_KEY1 = 'real_key1'
        process.env.ZALOPAY_KEY2 = 'real_key2'
        process.env.ZALOPAY_ENDPOINT = 'https://openapi.zalopay.vn/v2/create'

        const result = validatePaymentConfig()
        const zalopay = result.gateways.find(g => g.gateway === 'ZaloPay')

        expect(zalopay?.isConfigured).toBe(true)
        expect(zalopay?.isProduction).toBe(true)
        expect(zalopay?.issues).toHaveLength(0)
      })

      it('should detect sandbox endpoint', () => {
        process.env.ZALOPAY_APP_ID = '12345'
        process.env.ZALOPAY_KEY1 = 'real_key1'
        process.env.ZALOPAY_KEY2 = 'real_key2'
        process.env.ZALOPAY_ENDPOINT = 'https://sb-openapi.zalopay.vn/v2/create'

        const result = validatePaymentConfig()
        const zalopay = result.gateways.find(g => g.gateway === 'ZaloPay')

        expect(zalopay?.isConfigured).toBe(true)
        expect(zalopay?.isProduction).toBe(false)
        expect(zalopay?.warnings).toContain('Using ZaloPay sandbox endpoint')
      })

      it('should warn on placeholder app ID', () => {
        process.env.ZALOPAY_APP_ID = 'test_app_id'
        process.env.ZALOPAY_KEY1 = 'key1'
        process.env.ZALOPAY_KEY2 = 'key2'

        const result = validatePaymentConfig()
        const zalopay = result.gateways.find(g => g.gateway === 'ZaloPay')

        expect(zalopay?.warnings).toContain('ZALOPAY_APP_ID appears to be a placeholder')
      })
    })

    describe('Banking validation', () => {
      it('should be configured with bank account number', () => {
        process.env.BANK_ACCOUNT_NUMBER = '1234567890'

        const result = validatePaymentConfig()
        const banking = result.gateways.find(g => g.gateway === 'Banking')

        expect(banking?.isConfigured).toBe(true)
        expect(banking?.isProduction).toBe(true) // Banking is always "production"
      })

      it('should be configured with SePay API key', () => {
        process.env.SEPAY_API_KEY = 'sepay_key_123'

        const result = validatePaymentConfig()
        const banking = result.gateways.find(g => g.gateway === 'Banking')

        expect(banking?.isConfigured).toBe(true)
      })

      it('should warn when neither bank account nor SePay configured', () => {
        const result = validatePaymentConfig()
        const banking = result.gateways.find(g => g.gateway === 'Banking')

        expect(banking?.isConfigured).toBe(false)
        expect(banking?.warnings).toContain(
          'No bank account or SePay configured - bank transfer may not work'
        )
      })
    })

    describe('production readiness', () => {
      it('should be production ready with at least one gateway configured', () => {
        process.env.MOMO_PARTNER_CODE = 'PROD'
        process.env.MOMO_ACCESS_KEY = 'key'
        process.env.MOMO_SECRET_KEY = 'secret'
        process.env.MOMO_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create'

        const result = validatePaymentConfig()

        expect(result.isProductionReady).toBe(true)
        expect(result.summary.productionReady).toBeGreaterThanOrEqual(1)
      })

      it('should not be production ready if only sandbox endpoints', () => {
        process.env.MOMO_PARTNER_CODE = 'PROD'
        process.env.MOMO_ACCESS_KEY = 'key'
        process.env.MOMO_SECRET_KEY = 'secret'
        process.env.MOMO_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create'

        const result = validatePaymentConfig()

        // Configured but not production-ready (sandbox)
        expect(result.summary.configured).toBe(1)
        expect(result.summary.productionReady).toBe(0)
      })

      it('should count multiple configured gateways', () => {
        // MoMo
        process.env.MOMO_PARTNER_CODE = 'PROD'
        process.env.MOMO_ACCESS_KEY = 'key'
        process.env.MOMO_SECRET_KEY = 'secret'
        // VNPay
        process.env.VNPAY_TMN_CODE = 'TMN'
        process.env.VNPAY_HASH_SECRET = 'secret'
        // Banking
        process.env.BANK_ACCOUNT_NUMBER = '123456'

        const result = validatePaymentConfig()

        expect(result.summary.configured).toBe(3)
      })
    })
  })

  describe('getPaymentConfigReport', () => {
    it('should generate report with correct format', () => {
      process.env.MOMO_PARTNER_CODE = 'PROD'
      process.env.MOMO_ACCESS_KEY = 'key'
      process.env.MOMO_SECRET_KEY = 'secret'
      process.env.MOMO_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create'

      const report = getPaymentConfigReport()

      expect(report).toContain('=== Payment Configuration Report ===')
      expect(report).toContain('Production Ready:')
      expect(report).toContain('--- MoMo ---')
      expect(report).toContain('--- VNPay ---')
      expect(report).toContain('--- ZaloPay ---')
      expect(report).toContain('--- Banking ---')
    })

    it('should show configured status with checkmarks', () => {
      process.env.MOMO_PARTNER_CODE = 'PROD'
      process.env.MOMO_ACCESS_KEY = 'key'
      process.env.MOMO_SECRET_KEY = 'secret'
      process.env.MOMO_ENDPOINT = 'https://payment.momo.vn/v2/gateway/api/create'

      const report = getPaymentConfigReport()

      expect(report).toContain('Configured: ✅')
      expect(report).toContain('Production: ✅')
    })

    it('should show issues in report', () => {
      const report = getPaymentConfigReport()

      expect(report).toContain('❌')
      expect(report).toContain('Issues:')
    })

    it('should show warnings in report', () => {
      process.env.MOMO_PARTNER_CODE = 'sandbox_code'
      process.env.MOMO_ACCESS_KEY = 'key'
      process.env.MOMO_SECRET_KEY = 'secret'
      process.env.MOMO_ENDPOINT = 'https://test-payment.momo.vn'

      const report = getPaymentConfigReport()

      expect(report).toContain('⚠️')
      expect(report).toContain('Warnings:')
    })

    it('should show sandbox status', () => {
      process.env.MOMO_PARTNER_CODE = 'PROD'
      process.env.MOMO_ACCESS_KEY = 'key'
      process.env.MOMO_SECRET_KEY = 'secret'
      process.env.MOMO_ENDPOINT = 'https://test-payment.momo.vn/v2/gateway/api/create'

      const report = getPaymentConfigReport()

      expect(report).toContain('Production: ⚠️ Sandbox')
    })
  })
})
