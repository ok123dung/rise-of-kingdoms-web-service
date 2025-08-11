import crypto from 'crypto'

// Generate a nonce for CSP
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

// Build CSP header with nonce
export function buildCSPHeader(nonce: string): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      // Remove unsafe-inline and unsafe-eval in production
      process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : '',
    ].filter(Boolean),
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://fonts.googleapis.com',
      // Allow inline styles with nonce
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://api.resend.com',
      'https://www.google-analytics.com',
      'https://sandbox.vnpayment.vn',
      'wss:',
      'https:',
    ],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// Middleware to add CSP headers
export function addCSPHeaders(headers: Headers, nonce: string): void {
  headers.set('Content-Security-Policy', buildCSPHeader(nonce))
  headers.set('X-Nonce', nonce)
}