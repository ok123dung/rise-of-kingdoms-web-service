/**
 * Content Security Policy Configuration
 *
 * This file defines the CSP policy for the application.
 *
 * CURRENT STATUS:
 * - Uses 'unsafe-inline' and 'unsafe-eval' for Next.js compatibility
 * - This is a known security trade-off for development convenience
 *
 * MIGRATION PLAN (for production hardening):
 * 1. Implement nonce-based CSP using Next.js middleware
 * 2. Add nonces to all inline scripts via custom _document
 * 3. Remove 'unsafe-inline' and 'unsafe-eval' directives
 * 4. Test thoroughly with all payment gateways and third-party integrations
 *
 * Resources:
 * - https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 * - https://web.dev/strict-csp/
 */

export interface CSPDirectives {
  'default-src': string[]
  'script-src': string[]
  'style-src': string[]
  'img-src': string[]
  'font-src': string[]
  'connect-src': string[]
  'frame-ancestors': string[]
  'base-uri': string[]
  'form-action': string[]
  'object-src': string[]
  'upgrade-insecure-requests'?: boolean
}

/**
 * Current CSP Configuration (Development & Production)
 * Uses unsafe directives for Next.js compatibility
 */
export const currentCSPDirectives: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Will be removed in strict CSP migration
    "'unsafe-eval'", // Will be removed in strict CSP migration
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://static.cloudflareinsights.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // TODO: Remove after implementing nonce-based CSP
    'https://fonts.googleapis.com'
  ],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://vitals.vercel-insights.com',
    'ws://localhost:*', // WebSocket for development
    'wss://localhost:*' // WebSocket for development
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': true
}

/**
 * Strict CSP Configuration (Target for production)
 * Uses nonce-based approach without unsafe directives
 */
export const strictCSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'nonce-{{NONCE}}'", // Will be replaced with actual nonce
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
  ],
  'style-src': [
    "'self'",
    "'nonce-{{NONCE}}'", // Will be replaced with actual nonce
    'https://fonts.googleapis.com'
  ],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://www.google-analytics.com',
    'https://vitals.vercel-insights.com',
    process.env.NODE_ENV === 'production' ? 'wss://*.yourdomain.com' : 'ws://localhost:*'
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': true
}

/**
 * Build CSP header string from directives
 */
export function buildCSPHeader(directives: CSPDirectives, nonce?: string): string {
  const cspString = Object.entries(directives)
    .map(([key, value]) => {
      if (key === 'upgrade-insecure-requests') {
        return value ? 'upgrade-insecure-requests' : ''
      }

      if (Array.isArray(value)) {
        const values = nonce ? value.map(v => v.replace('{{NONCE}}', nonce)) : value

        return `${key} ${values.join(' ')}`
      }

      return ''
    })
    .filter(Boolean)
    .join('; ')

  return cspString
}

/**
 * Generate a cryptographic nonce for CSP
 * Use this in middleware to create unique nonces per request
 */
export function generateCSPNonce(): string {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return Buffer.from(randomBytes, 'hex').toString('base64')
}

/**
 * CSP Violation Reporting
 * Configure this endpoint to receive CSP violation reports
 */
export const cspReportUri = '/api/csp-report'

/**
 * Report-Only Mode
 * Set to true to enable report-only mode for testing strict CSP
 */
export const cspReportOnly = false

/**
 * Migration checklist for strict CSP:
 *
 * □ Step 1: Enable CSP report-only mode
 *   - Set cspReportOnly = true
 *   - Deploy and monitor violations for 1 week
 *
 * □ Step 2: Create CSP violation report endpoint
 *   - Implement /api/csp-report route
 *   - Log violations to monitoring system
 *
 * □ Step 3: Implement nonce generation in middleware
 *   - Generate unique nonce per request
 *   - Store nonce in request context
 *
 * □ Step 4: Update root layout to use nonces
 *   - Pass nonce to Script components
 *   - Pass nonce to inline styles
 *
 * □ Step 5: Update all inline scripts
 *   - Add nonce attribute to <script> tags
 *   - Move inline event handlers to external scripts
 *
 * □ Step 6: Update all inline styles
 *   - Add nonce attribute to <style> tags
 *   - Move inline styles to external stylesheets
 *
 * □ Step 7: Test payment gateway integrations
 *   - Verify VNPay payment flow
 *   - Verify MoMo payment flow
 *   - Verify ZaloPay payment flow
 *
 * □ Step 8: Switch to enforce mode
 *   - Set cspReportOnly = false
 *   - Use strictCSPDirectives instead of currentCSPDirectives
 *   - Monitor for any issues
 *
 * □ Step 9: Remove development WebSocket CSP
 *   - Remove ws://localhost:* from connect-src
 *   - Keep only production wss:// URLs
 *
 * □ Step 10: Continuous monitoring
 *   - Set up alerts for CSP violations
 *   - Review and update CSP policy quarterly
 */
