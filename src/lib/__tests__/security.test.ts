/**
 * Unit tests for security functions
 * Tests XSS prevention, SQL injection prevention, input validation, and cryptographic functions
 */

import type { NextRequest } from 'next/server'

import {
  sanitizeInput,
  stripDangerousPatterns,
  escapeSqlString,
  sanitizePath,
  validatePassword,
  validateEmail,
  validatePhoneNumber,
  validateJWT,
  isValidIP,
  generateSecureToken,
  hashData,
  verifyHash,
  isValidContentType,
  CSRFProtection
} from '../security'

describe('Security Functions', () => {
  // ============================================
  // XSS Prevention Tests
  // ============================================
  describe('sanitizeInput', () => {
    it('should encode HTML special characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      )
    })

    it('should encode ampersands', () => {
      expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry')
    })

    it('should encode single quotes', () => {
      expect(sanitizeInput("it's a test")).toBe('it&#x27;s a test')
    })

    it('should encode forward slashes', () => {
      expect(sanitizeInput('path/to/file')).toBe('path&#x2F;to&#x2F;file')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world')
    })

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(sanitizeInput('   ')).toBe('')
    })

    it('should encode all dangerous characters together', () => {
      const input = '<div onclick="alert(\'xss\')">&test</div>'
      const result = sanitizeInput(input)
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).not.toContain('"')
      expect(result).not.toContain("'")
    })
  })

  describe('stripDangerousPatterns', () => {
    // Note: Uses sanitize-html library which has specific behavior

    it('should remove script tags', () => {
      const result = stripDangerousPatterns('<script>alert("xss")</script>')
      expect(result).not.toContain('<script')
      expect(result).not.toContain('</script>')
    })

    it('should remove script tags with attributes', () => {
      const result = stripDangerousPatterns('<script src="evil.js"></script>')
      expect(result).not.toContain('<script')
    })

    it('should remove unclosed script tags', () => {
      const result = stripDangerousPatterns('<script>alert("xss")')
      expect(result).not.toContain('<script')
    })

    it('should handle javascript: protocol in links', () => {
      // sanitize-html removes javascript: from href attributes
      const result = stripDangerousPatterns('<a href="javascript:alert(1)">click</a>')
      expect(result).not.toContain('javascript:')
    })

    it('should remove onclick handlers', () => {
      const result = stripDangerousPatterns('<div onclick="alert(1)">test</div>')
      expect(result).not.toContain('onclick')
      expect(result).toContain('test')
    })

    it('should remove onerror handlers', () => {
      const result = stripDangerousPatterns('<img onerror="alert(1)" src="x">')
      expect(result).not.toContain('onerror')
    })

    it('should remove event handlers without quotes', () => {
      const result = stripDangerousPatterns('<div onclick=>test</div>')
      expect(result).not.toContain('onclick')
    })

    it('should handle nested dangerous patterns', () => {
      const nested = '<scr<script>ipt>alert("xss")</script>'
      const result = stripDangerousPatterns(nested)
      expect(result).not.toContain('<script')
      expect(result).not.toContain('</script>')
    })

    it('should handle case insensitive script tags', () => {
      const result = stripDangerousPatterns('<SCRIPT>alert("xss")</SCRIPT>')
      expect(result).not.toContain('<SCRIPT')
      expect(result).not.toContain('</SCRIPT>')
    })

    it('should preserve safe content', () => {
      expect(stripDangerousPatterns('<p>Hello World</p>')).toBe('<p>Hello World</p>')
    })

    it('should trim whitespace', () => {
      expect(stripDangerousPatterns('  hello  ')).toBe('hello')
    })
  })

  // ============================================
  // SQL Injection Prevention Tests
  // ============================================
  describe('escapeSqlString', () => {
    it('should escape single quotes', () => {
      expect(escapeSqlString("it's")).toBe("it\\'s")
    })

    it('should escape double quotes', () => {
      expect(escapeSqlString('say "hello"')).toBe('say \\"hello\\"')
    })

    it('should escape backslashes', () => {
      expect(escapeSqlString('path\\to\\file')).toBe('path\\\\to\\\\file')
    })

    it('should escape null bytes', () => {
      expect(escapeSqlString('hello\0world')).toBe('hello\\0world')
    })

    it('should escape newlines', () => {
      expect(escapeSqlString('line1\nline2')).toBe('line1\\nline2')
    })

    it('should escape carriage returns', () => {
      expect(escapeSqlString('line1\rline2')).toBe('line1\\rline2')
    })

    it('should escape tabs', () => {
      expect(escapeSqlString('col1\tcol2')).toBe('col1\\tcol2')
    })

    it('should escape percent signs', () => {
      expect(escapeSqlString('100%')).toBe('100\\%')
    })

    it('should handle SQL injection attempts', () => {
      const injection = "'; DROP TABLE users; --"
      const escaped = escapeSqlString(injection)
      expect(escaped).toBe("\\'; DROP TABLE users; --")
    })

    it('should handle empty string', () => {
      expect(escapeSqlString('')).toBe('')
    })
  })

  // ============================================
  // Path Traversal Prevention Tests
  // ============================================
  describe('sanitizePath', () => {
    it('should remove parent directory traversal dots', () => {
      // Removes .. sequences, leaving slashes that get normalized
      const result = sanitizePath('../../../etc/passwd')
      expect(result).not.toContain('..')
      // After removing .., we get ///etc/passwd, then normalize slashes
      expect(result).toContain('etc/passwd')
    })

    it('should normalize double slashes', () => {
      expect(sanitizePath('path//to//file')).toBe('path/to/file')
    })

    it('should convert backslashes to forward slashes', () => {
      expect(sanitizePath('path\\to\\file')).toBe('path/to/file')
    })

    it('should remove leading slashes', () => {
      expect(sanitizePath('/absolute/path')).toBe('absolute/path')
    })

    it('should handle complex traversal attempts', () => {
      const result = sanitizePath('..\\..\\..\\windows\\system32')
      expect(result).not.toContain('..')
      expect(result).toContain('windows/system32')
    })

    it('should handle empty string', () => {
      expect(sanitizePath('')).toBe('')
    })

    it('should preserve normal paths', () => {
      expect(sanitizePath('uploads/images/photo.jpg')).toBe('uploads/images/photo.jpg')
    })
  })

  // ============================================
  // Password Validation Tests
  // ============================================
  describe('validatePassword', () => {
    it('should accept valid strong password', () => {
      const result = validatePassword('SecurePass123!')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Short1!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase', () => {
      const result = validatePassword('UPPERCASE123!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('NoNumbers!@#')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special characters', () => {
      const result = validatePassword('NoSpecial123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character')
    })

    it('should return multiple errors for very weak password', () => {
      const result = validatePassword('weak')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  // ============================================
  // Email Validation Tests
  // ============================================
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true)
    })

    it('should accept email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true)
    })

    it('should accept email with plus sign', () => {
      expect(validateEmail('user+tag@example.com')).toBe(true)
    })

    it('should reject email without @', () => {
      expect(validateEmail('userexample.com')).toBe(false)
    })

    it('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false)
    })

    it('should reject email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(validateEmail('')).toBe(false)
    })

    it('should reject email without TLD', () => {
      expect(validateEmail('user@example')).toBe(false)
    })
  })

  // ============================================
  // Vietnamese Phone Validation Tests
  // ============================================
  describe('validatePhoneNumber', () => {
    it('should accept valid Viettel number (03x)', () => {
      expect(validatePhoneNumber('0321234567')).toBe(true)
    })

    it('should accept valid Vinaphone number (09x)', () => {
      expect(validatePhoneNumber('0912345678')).toBe(true)
    })

    it('should accept valid Mobifone number (07x)', () => {
      expect(validatePhoneNumber('0701234567')).toBe(true)
    })

    it('should accept phone with spaces', () => {
      expect(validatePhoneNumber('032 123 4567')).toBe(true)
    })

    it('should accept phone with dashes', () => {
      expect(validatePhoneNumber('032-123-4567')).toBe(true)
    })

    it('should reject invalid prefix', () => {
      expect(validatePhoneNumber('0221234567')).toBe(false)
    })

    it('should reject short phone number', () => {
      expect(validatePhoneNumber('032123456')).toBe(false)
    })

    it('should reject long phone number', () => {
      expect(validatePhoneNumber('03212345678')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(validatePhoneNumber('')).toBe(false)
    })
  })

  // ============================================
  // JWT Validation Tests
  // ============================================
  describe('validateJWT', () => {
    // Note: validateJWT uses jwt.verify() for cryptographic signature verification
    // Tests with fake signatures will fail (correctly) - this is secure behavior

    it('should reject tokens with invalid signatures', () => {
      // Create a JWT with fake signature - should be rejected
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
      const payload = Buffer.from(
        JSON.stringify({ sub: '123', exp: Math.floor(Date.now() / 1000) + 3600 })
      ).toString('base64')
      const token = `${header}.${payload}.fake-signature`

      const result = validateJWT(token)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid signature')
    })

    it('should reject tokens with wrong algorithm in header', () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64')
      const payload = Buffer.from(JSON.stringify({ sub: '123' })).toString('base64')
      const token = `${header}.${payload}.`

      const result = validateJWT(token)
      expect(result.valid).toBe(false)
    })

    it('should reject malformed JWT with wrong parts count', () => {
      const result = validateJWT('invalid.token')
      expect(result.valid).toBe(false)
      // jwt.verify throws JsonWebTokenError for malformed tokens
      expect(result.error).toBe('Invalid signature')
    })

    it('should reject JWT with invalid base64', () => {
      const result = validateJWT('!!!.!!!.!!!')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid signature')
    })

    it('should reject empty token', () => {
      const result = validateJWT('')
      expect(result.valid).toBe(false)
    })

    it('should return error when secret is not configured', () => {
      // Store original env
      const originalSecret = process.env.NEXTAUTH_SECRET
      delete process.env.NEXTAUTH_SECRET

      const result = validateJWT('any.token.here')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('JWT secret not configured')

      // Restore env
      process.env.NEXTAUTH_SECRET = originalSecret
    })
  })

  // ============================================
  // IP Validation Tests
  // ============================================
  describe('isValidIP', () => {
    it('should accept valid IPv4', () => {
      expect(isValidIP('192.168.1.1')).toBe(true)
    })

    it('should accept localhost IPv4', () => {
      expect(isValidIP('127.0.0.1')).toBe(true)
    })

    it('should accept edge case IPv4 (0.0.0.0)', () => {
      expect(isValidIP('0.0.0.0')).toBe(true)
    })

    it('should accept edge case IPv4 (255.255.255.255)', () => {
      expect(isValidIP('255.255.255.255')).toBe(true)
    })

    it('should reject IPv4 with values > 255', () => {
      expect(isValidIP('256.1.1.1')).toBe(false)
    })

    it('should reject IPv4 with too few octets', () => {
      expect(isValidIP('192.168.1')).toBe(false)
    })

    it('should accept valid IPv6', () => {
      expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
    })

    it('should accept shortened IPv6', () => {
      expect(isValidIP('2001:db8::1')).toBe(true)
    })

    it('should reject empty string', () => {
      expect(isValidIP('')).toBe(false)
    })

    it('should reject random string', () => {
      expect(isValidIP('not-an-ip')).toBe(false)
    })
  })

  // ============================================
  // Secure Token Generation Tests
  // ============================================
  describe('generateSecureToken', () => {
    it('should generate token of correct length', () => {
      const token = generateSecureToken(16)
      // 16 bytes = 32 hex characters
      expect(token).toHaveLength(32)
    })

    it('should use default length of 32 bytes', () => {
      const token = generateSecureToken()
      // 32 bytes = 64 hex characters
      expect(token).toHaveLength(64)
    })

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken()
      const token2 = generateSecureToken()
      expect(token1).not.toBe(token2)
    })

    it('should only contain hex characters', () => {
      const token = generateSecureToken()
      expect(token).toMatch(/^[0-9a-f]+$/)
    })
  })

  // ============================================
  // Hashing Tests
  // ============================================
  describe('hashData and verifyHash', () => {
    it('should hash data and verify correctly', () => {
      const data = 'sensitive-password'
      const hashed = hashData(data)
      expect(verifyHash(data, hashed)).toBe(true)
    })

    it('should reject wrong data', () => {
      const hashed = hashData('correct-password')
      expect(verifyHash('wrong-password', hashed)).toBe(false)
    })

    it('should generate different hashes for same data (random salt)', () => {
      const data = 'password'
      const hash1 = hashData(data)
      const hash2 = hashData(data)
      expect(hash1).not.toBe(hash2)
    })

    it('should generate same hash with same salt', () => {
      const data = 'password'
      const salt = 'fixed-salt-for-test'
      const hash1 = hashData(data, salt)
      const hash2 = hashData(data, salt)
      expect(hash1).toBe(hash2)
    })

    it('should include salt separator in hash without explicit salt', () => {
      const hashed = hashData('data')
      expect(hashed).toContain(':')
    })
  })

  // ============================================
  // Content Type Validation Tests
  // ============================================
  describe('isValidContentType', () => {
    it('should accept allowed content type', () => {
      expect(isValidContentType('application/json', ['application/json', 'text/html'])).toBe(true)
    })

    it('should accept content type with charset', () => {
      expect(
        isValidContentType('application/json; charset=utf-8', ['application/json'])
      ).toBe(true)
    })

    it('should be case insensitive', () => {
      expect(isValidContentType('APPLICATION/JSON', ['application/json'])).toBe(true)
    })

    it('should reject non-allowed content type', () => {
      expect(isValidContentType('text/plain', ['application/json'])).toBe(false)
    })

    it('should reject null content type', () => {
      expect(isValidContentType(null, ['application/json'])).toBe(false)
    })

    it('should reject empty string content type', () => {
      expect(isValidContentType('', ['application/json'])).toBe(false)
    })
  })

  // ============================================
  // CSRF Protection Tests
  // ============================================
  describe('CSRFProtection', () => {
    describe('generateToken', () => {
      it('should generate token of correct length', () => {
        const token = CSRFProtection.generateToken()
        // 32 bytes = 64 hex characters
        expect(token).toHaveLength(64)
      })

      it('should generate unique tokens', () => {
        const token1 = CSRFProtection.generateToken()
        const token2 = CSRFProtection.generateToken()
        expect(token1).not.toBe(token2)
      })

      it('should only contain hex characters', () => {
        const token = CSRFProtection.generateToken()
        expect(token).toMatch(/^[0-9a-f]+$/)
      })
    })

    describe('validateToken', () => {
      it('should skip validation for GET requests', () => {
        const mockRequest = {
          method: 'GET',
          headers: { get: jest.fn() },
          cookies: { get: jest.fn() }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(true)
      })

      it('should skip validation for HEAD requests', () => {
        const mockRequest = {
          method: 'HEAD',
          headers: { get: jest.fn() },
          cookies: { get: jest.fn() }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(true)
      })

      it('should skip validation for OPTIONS requests', () => {
        const mockRequest = {
          method: 'OPTIONS',
          headers: { get: jest.fn() },
          cookies: { get: jest.fn() }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(true)
      })

      it('should validate matching tokens for POST', () => {
        const token = 'valid-token-123'
        const mockRequest = {
          method: 'POST',
          headers: { get: jest.fn().mockReturnValue(token) },
          cookies: { get: jest.fn().mockReturnValue({ value: token }) }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(true)
      })

      it('should reject mismatched tokens', () => {
        const mockRequest = {
          method: 'POST',
          headers: { get: jest.fn().mockReturnValue('token-a') },
          cookies: { get: jest.fn().mockReturnValue({ value: 'token-b' }) }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(false)
      })

      it('should reject missing header token', () => {
        const mockRequest = {
          method: 'POST',
          headers: { get: jest.fn().mockReturnValue(null) },
          cookies: { get: jest.fn().mockReturnValue({ value: 'token' }) }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(false)
      })

      it('should reject missing cookie token', () => {
        const mockRequest = {
          method: 'POST',
          headers: { get: jest.fn().mockReturnValue('token') },
          cookies: { get: jest.fn().mockReturnValue(undefined) }
        } as unknown as NextRequest

        expect(CSRFProtection.validateToken(mockRequest)).toBe(false)
      })
    })
  })
})
