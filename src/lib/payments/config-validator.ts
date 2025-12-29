/**
 * Payment Configuration Validator
 * Validates all payment gateway configurations for production readiness
 */

interface ValidationResult {
  gateway: string
  isConfigured: boolean
  isProduction: boolean
  issues: string[]
  warnings: string[]
}

interface PaymentConfigStatus {
  isProductionReady: boolean
  gateways: ValidationResult[]
  summary: {
    configured: number
    productionReady: number
    total: number
  }
}

// Sandbox/test indicators
const SANDBOX_INDICATORS = [
  'sandbox',
  'test',
  'demo',
  'dev',
  'staging',
  'your-',
  'your_',
  'placeholder',
  'example'
]

function isSandboxValue(value: string): boolean {
  const lower = value.toLowerCase()
  return SANDBOX_INDICATORS.some(indicator => lower.includes(indicator))
}

function validateMoMo(): ValidationResult {
  const issues: string[] = []
  const warnings: string[] = []

  const partnerCode = process.env.MOMO_PARTNER_CODE
  const accessKey = process.env.MOMO_ACCESS_KEY
  const secretKey = process.env.MOMO_SECRET_KEY
  const endpoint = process.env.MOMO_ENDPOINT ?? ''

  // Check if configured
  const isConfigured = !!(partnerCode && accessKey && secretKey)

  if (!partnerCode) issues.push('MOMO_PARTNER_CODE not set')
  if (!accessKey) issues.push('MOMO_ACCESS_KEY not set')
  if (!secretKey) issues.push('MOMO_SECRET_KEY not set')

  // Check for sandbox values
  if (partnerCode && isSandboxValue(partnerCode)) {
    warnings.push('MOMO_PARTNER_CODE appears to be a placeholder')
  }

  // Check endpoint
  const isProduction = endpoint.includes('payment.momo.vn') && !endpoint.includes('test')
  if (endpoint.includes('test-payment.momo.vn')) {
    warnings.push('Using MoMo sandbox endpoint')
  }

  return {
    gateway: 'MoMo',
    isConfigured,
    isProduction,
    issues,
    warnings
  }
}

function validateVNPay(): ValidationResult {
  const issues: string[] = []
  const warnings: string[] = []

  const tmnCode = process.env.VNPAY_TMN_CODE
  const hashSecret = process.env.VNPAY_HASH_SECRET
  const url = process.env.VNPAY_URL ?? ''

  const isConfigured = !!(tmnCode && hashSecret)

  if (!tmnCode) issues.push('VNPAY_TMN_CODE not set')
  if (!hashSecret) issues.push('VNPAY_HASH_SECRET not set')

  if (tmnCode && isSandboxValue(tmnCode)) {
    warnings.push('VNPAY_TMN_CODE appears to be a placeholder')
  }

  // Check endpoint
  const isProduction = url.includes('pay.vnpay.vn') && !url.includes('sandbox')
  if (url.includes('sandbox')) {
    warnings.push('Using VNPay sandbox endpoint')
  }

  return {
    gateway: 'VNPay',
    isConfigured,
    isProduction,
    issues,
    warnings
  }
}

function validateZaloPay(): ValidationResult {
  const issues: string[] = []
  const warnings: string[] = []

  const appId = process.env.ZALOPAY_APP_ID
  const key1 = process.env.ZALOPAY_KEY1
  const key2 = process.env.ZALOPAY_KEY2
  const endpoint = process.env.ZALOPAY_ENDPOINT ?? ''

  const isConfigured = !!(appId && key1 && key2)

  if (!appId) issues.push('ZALOPAY_APP_ID not set')
  if (!key1) issues.push('ZALOPAY_KEY1 not set')
  if (!key2) issues.push('ZALOPAY_KEY2 not set')

  if (appId && isSandboxValue(appId)) {
    warnings.push('ZALOPAY_APP_ID appears to be a placeholder')
  }

  // Check endpoint
  const isProduction = endpoint.includes('openapi.zalopay.vn') && !endpoint.includes('sb-')
  if (endpoint.includes('sb-openapi')) {
    warnings.push('Using ZaloPay sandbox endpoint')
  }

  return {
    gateway: 'ZaloPay',
    isConfigured,
    isProduction,
    issues,
    warnings
  }
}

function validateBanking(): ValidationResult {
  const issues: string[] = []
  const warnings: string[] = []

  // Bank transfer is always "configured" as it uses static bank info
  // Check for optional SePay integration
  const sepayKey = process.env.SEPAY_API_KEY
  const bankAccountNumber = process.env.BANK_ACCOUNT_NUMBER

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Intentional truthy check, empty string should be falsy
  const isConfigured = !!(bankAccountNumber || sepayKey)

  if (!bankAccountNumber && !sepayKey) {
    warnings.push('No bank account or SePay configured - bank transfer may not work')
  }

  // Bank transfer doesn't have sandbox/production distinction
  const isProduction = true

  return {
    gateway: 'Banking',
    isConfigured,
    isProduction,
    issues,
    warnings
  }
}

export function validatePaymentConfig(): PaymentConfigStatus {
  const gateways = [
    validateMoMo(),
    validateVNPay(),
    validateZaloPay(),
    validateBanking()
  ]

  const configured = gateways.filter(g => g.isConfigured).length
  const productionReady = gateways.filter(g => g.isConfigured && g.isProduction && g.issues.length === 0).length

  return {
    isProductionReady: productionReady >= 1, // At least one gateway ready
    gateways,
    summary: {
      configured,
      productionReady,
      total: gateways.length
    }
  }
}

export function getPaymentConfigReport(): string {
  const status = validatePaymentConfig()

  let report = '=== Payment Configuration Report ===\n\n'

  report += `Production Ready: ${status.isProductionReady ? '✅ YES' : '❌ NO'}\n`
  report += `Configured: ${status.summary.configured}/${status.summary.total}\n`
  report += `Production Ready: ${status.summary.productionReady}/${status.summary.total}\n\n`

  for (const gateway of status.gateways) {
    report += `--- ${gateway.gateway} ---\n`
    report += `  Configured: ${gateway.isConfigured ? '✅' : '❌'}\n`
    report += `  Production: ${gateway.isProduction ? '✅' : '⚠️ Sandbox'}\n`

    if (gateway.issues.length > 0) {
      report += `  Issues:\n`
      gateway.issues.forEach(issue => {
        report += `    ❌ ${issue}\n`
      })
    }

    if (gateway.warnings.length > 0) {
      report += `  Warnings:\n`
      gateway.warnings.forEach(warning => {
        report += `    ⚠️ ${warning}\n`
      })
    }

    report += '\n'
  }

  return report
}
