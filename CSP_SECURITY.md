# Content Security Policy (CSP) Implementation

## Overview

This document outlines the improved Content Security Policy (CSP) implementation for Rise of Kingdoms Services, removing unsafe inline scripts and eval usage.

## Changes Made

### 1. Removed Unsafe Directives
- ❌ Removed `'unsafe-inline'` from production CSP
- ❌ Removed `'unsafe-eval'` from production CSP
- ✅ Kept them only in development for hot reload support

### 2. Implemented Nonce-Based CSP
- Created CSP utilities in `/src/lib/csp.ts`
- Added CSP middleware in `/src/middleware/csp.ts`
- Implemented NonceProvider for React components

### 3. Security Improvements

#### Before:
```
script-src 'self' 'unsafe-eval' 'unsafe-inline' ...
style-src 'self' 'unsafe-inline' ...
```

#### After (Production):
```
script-src 'self' 'nonce-{random}' https://www.googletagmanager.com ...
style-src 'self' 'nonce-{random}' https://fonts.googleapis.com ...
```

## Implementation Guide

### 1. For Inline Scripts

Instead of:
```jsx
<script>
  console.log('Hello')
</script>
```

Use:
```jsx
import { InlineScript } from '@/components/NonceProvider'

<InlineScript>
  {`console.log('Hello')`}
</InlineScript>
```

### 2. For Inline Styles

Instead of:
```jsx
<style>
  .custom { color: red; }
</style>
```

Use:
```jsx
import { InlineStyle } from '@/components/NonceProvider'

<InlineStyle>
  {`.custom { color: red; }`}
</InlineStyle>
```

### 3. For Third-Party Scripts

Google Analytics and other trusted scripts are explicitly allowed in CSP:
- `https://www.googletagmanager.com`
- `https://www.google-analytics.com`

### 4. For Dynamic Scripts

Use Next.js Script component with proper strategy:
```jsx
import Script from 'next/script'

<Script 
  src="https://example.com/script.js"
  strategy="lazyOnload"
/>
```

## CSP Directives Explained

| Directive | Value | Purpose |
|-----------|-------|---------|
| default-src | 'self' | Default policy for all resources |
| script-src | 'self' 'nonce-{x}' + trusted domains | JavaScript execution |
| style-src | 'self' 'nonce-{x}' + fonts | CSS and inline styles |
| img-src | 'self' data: https: | Images from various sources |
| connect-src | 'self' + APIs | XHR, WebSocket, fetch |
| frame-ancestors | 'none' | Prevent clickjacking |
| object-src | 'none' | Disable plugins |

## Migration Checklist

- [ ] Replace all inline `<script>` tags with NonceProvider components
- [ ] Replace all inline `<style>` tags with NonceProvider components
- [ ] Move inline event handlers to React event handlers
- [ ] Use CSS modules or styled-components instead of style attributes
- [ ] Test all third-party integrations
- [ ] Verify Google Analytics still works
- [ ] Check payment gateway integrations

## Testing

1. **Check CSP Headers**
```bash
curl -I https://rokdbot.com | grep -i content-security
```

2. **Browser Console**
- Look for CSP violation errors
- Verify no inline script/style warnings

3. **Security Headers Check**
- Use https://securityheaders.com
- Target score: A or A+

## Benefits

1. **XSS Protection**: Prevents execution of injected scripts
2. **Data Exfiltration Prevention**: Controls where data can be sent
3. **Compliance**: Meets security best practices
4. **Performance**: No impact on load time

## Troubleshooting

### Common Issues

1. **Inline styles not working**
   - Solution: Use CSS modules or NonceProvider

2. **Third-party scripts blocked**
   - Solution: Add domain to CSP whitelist

3. **Dynamic content issues**
   - Solution: Use nonce-based approach

### Development vs Production

- Development keeps unsafe directives for DX
- Production enforces strict CSP
- Use environment checks when needed