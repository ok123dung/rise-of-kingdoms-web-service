import crypto from 'crypto'

// Generate a cryptographically secure nonce for CSP
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

// Generate hash for inline scripts/styles that can't use nonces
export function generateHash(
  content: string,
  algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'
): string {
  const hash = crypto.createHash(algorithm)
  hash.update(content)
  return `'${algorithm}-${hash.digest('base64')}'`
}

// Build secure CSP header with nonce
export function buildCSPHeader(nonce: string, isDevelopment = false): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      // Only allow specific GA scripts with SRI hashes
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      // Strict CSP in production - no unsafe-inline or unsafe-eval
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      // Add hashes for any required inline scripts
      "'sha256-vvt4KWwuNr51XfE5m+hBFRValF6RoUhdzaAVLX3dXAQ='" // Google Analytics inline
    ].filter(Boolean),
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://fonts.googleapis.com',
      // Hash for critical inline styles if needed
      "'sha256-47DEzpj8HBSa+/TImkZS7JliusDFhmy259GFG3nrpMQ='"
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://api.resend.com',
      'https://www.google-analytics.com',
      'https://sandbox.vnpayment.vn',
      'https://*.sentry.io', // Sentry monitoring
      ...(isDevelopment
        ? ['ws://localhost:*', 'wss://localhost:*']
        : ['wss://rokdbot.com', 'wss://www.rokdbot.com'])
    ],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'media-src': ["'none'"],
    'frame-src': ["'none'"],
    'child-src': ["'self'", 'blob:'],
    'upgrade-insecure-requests': isDevelopment ? [] : [''],
    'block-all-mixed-content': isDevelopment ? [] : ['']
  }

  return Object.entries(directives)
    .filter(([_, values]) => values.length > 0)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// Middleware to add CSP headers
export function addCSPHeaders(headers: Headers, nonce: string): void {
  const isDevelopment = process.env.NODE_ENV === 'development'
  headers.set('Content-Security-Policy', buildCSPHeader(nonce, isDevelopment))
  headers.set('X-Nonce', nonce)
}

// Report-only CSP for testing
export function buildReportOnlyCSP(nonce: string, reportUri: string): string {
  const csp = buildCSPHeader(nonce, false)
  return `${csp}; report-uri ${reportUri}; report-to csp-endpoint`
}

// Trusted types policy for DOM XSS prevention
export const TRUSTED_TYPES_POLICY = `
  require-trusted-types-for 'script';
  trusted-types default dompurify;
`
