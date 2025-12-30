/**
 * Validation Tests
 * Tests Zod schemas, validation helpers, and sanitization functions
 */

import {
  emailSchema,
  phoneSchema,
  rok_player_idSchema,
  rok_kingdomSchema,
  signupSchema,
  loginSchema,
  paginationSchema,
  uuidSchema,
  validateEmail,
  validatePhone,
  validateRoKData,
  sanitizeInput,
  stripDangerousHtml,
  sanitizeUserInput,
  sanitizePhoneNumber,
  bookingValidationSchema,
  paymentValidationSchema,
  serviceValidationSchema,
  leadValidationSchema
} from '../validation'

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid email', () => {
      expect(() => emailSchema.parse('user@example.com')).not.toThrow()
      expect(() => emailSchema.parse('test.user+tag@domain.co.uk')).not.toThrow()
    })

    it('should reject invalid email format', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow()
      expect(() => emailSchema.parse('missing@')).toThrow()
      expect(() => emailSchema.parse('@nodomain.com')).toThrow()
    })

    it('should reject email shorter than 5 characters', () => {
      expect(() => emailSchema.parse('a@b')).toThrow()
    })

    it('should reject email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com'
      expect(() => emailSchema.parse(longEmail)).toThrow()
    })
  })

  describe('phoneSchema', () => {
    it('should accept valid Vietnamese phone numbers', () => {
      expect(() => phoneSchema.parse('0912345678')).not.toThrow()
      expect(() => phoneSchema.parse('84912345678')).not.toThrow()
      expect(() => phoneSchema.parse('+84912345678')).not.toThrow()
    })

    it('should accept various Vietnamese prefixes', () => {
      // Viettel
      expect(() => phoneSchema.parse('0321234567')).not.toThrow()
      // Vinaphone
      expect(() => phoneSchema.parse('0561234567')).not.toThrow()
      // Mobifone
      expect(() => phoneSchema.parse('0701234567')).not.toThrow()
    })

    it('should reject invalid phone formats', () => {
      expect(() => phoneSchema.parse('12345')).toThrow()
      expect(() => phoneSchema.parse('001234567890')).toThrow()
    })

    it('should be optional', () => {
      expect(() => phoneSchema.parse(undefined)).not.toThrow()
    })
  })

  describe('rok_player_idSchema', () => {
    it('should accept 9-digit player ID', () => {
      expect(() => rok_player_idSchema.parse('123456789')).not.toThrow()
    })

    it('should accept 10-digit player ID', () => {
      expect(() => rok_player_idSchema.parse('1234567890')).not.toThrow()
    })

    it('should reject player ID with wrong length', () => {
      expect(() => rok_player_idSchema.parse('12345678')).toThrow() // 8 digits
      expect(() => rok_player_idSchema.parse('12345678901')).toThrow() // 11 digits
    })

    it('should reject non-numeric player ID', () => {
      expect(() => rok_player_idSchema.parse('12345abcd')).toThrow()
    })

    it('should be optional', () => {
      expect(() => rok_player_idSchema.parse(undefined)).not.toThrow()
    })
  })

  describe('rok_kingdomSchema', () => {
    it('should accept 4-digit kingdom', () => {
      expect(() => rok_kingdomSchema.parse('1234')).not.toThrow()
      expect(() => rok_kingdomSchema.parse('2800')).not.toThrow()
    })

    it('should reject kingdom with wrong length', () => {
      expect(() => rok_kingdomSchema.parse('123')).toThrow()
      expect(() => rok_kingdomSchema.parse('12345')).toThrow()
    })

    it('should be optional', () => {
      expect(() => rok_kingdomSchema.parse(undefined)).not.toThrow()
    })
  })

  describe('signupSchema', () => {
    const validSignup = {
      full_name: 'Nguyễn Văn An',
      email: 'test@example.com',
      password: 'MyStr0ng@Pass!'
    }

    it('should accept valid signup data', () => {
      expect(() => signupSchema.parse(validSignup)).not.toThrow()
    })

    it('should accept signup with optional phone', () => {
      const withPhone = { ...validSignup, phone: '0912345678' }
      expect(() => signupSchema.parse(withPhone)).not.toThrow()
    })

    it('should reject invalid full_name', () => {
      expect(() =>
        signupSchema.parse({ ...validSignup, full_name: 'A' })
      ).toThrow() // Too short

      expect(() =>
        signupSchema.parse({ ...validSignup, full_name: 'Test123' })
      ).toThrow() // Contains numbers
    })

    it('should accept Vietnamese names with diacritics', () => {
      const vietnameseName = { ...validSignup, full_name: 'Trần Thị Hương' }
      expect(() => signupSchema.parse(vietnameseName)).not.toThrow()
    })

    it('should reject weak password', () => {
      expect(() =>
        signupSchema.parse({ ...validSignup, password: 'weak' })
      ).toThrow()
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const validLogin = {
        email: 'user@example.com',
        password: 'anypassword'
      }
      expect(() => loginSchema.parse(validLogin)).not.toThrow()
    })

    it('should reject missing email', () => {
      expect(() => loginSchema.parse({ password: 'test' })).toThrow()
    })

    it('should reject empty password', () => {
      expect(() =>
        loginSchema.parse({ email: 'user@example.com', password: '' })
      ).toThrow()
    })
  })

  describe('paginationSchema', () => {
    it('should use default values', () => {
      const result = paginationSchema.parse({})

      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.order).toBe('desc')
    })

    it('should accept custom values', () => {
      const result = paginationSchema.parse({
        page: 5,
        limit: 50,
        order: 'asc'
      })

      expect(result.page).toBe(5)
      expect(result.limit).toBe(50)
      expect(result.order).toBe('asc')
    })

    it('should coerce string numbers', () => {
      const result = paginationSchema.parse({
        page: '3',
        limit: '25'
      })

      expect(result.page).toBe(3)
      expect(result.limit).toBe(25)
    })

    it('should reject limit over 100', () => {
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow()
    })

    it('should reject non-positive page', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow()
      expect(() => paginationSchema.parse({ page: -1 })).toThrow()
    })
  })

  describe('uuidSchema', () => {
    it('should accept valid UUID', () => {
      expect(() =>
        uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')
      ).not.toThrow()
    })

    it('should reject invalid UUID', () => {
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow()
      expect(() => uuidSchema.parse('550e8400-e29b-41d4')).toThrow()
    })
  })

  describe('bookingValidationSchema', () => {
    it('should accept valid booking data', () => {
      const validBooking = {
        service_tier_id: 'clh2ov5o40000qf01h0p0p0p0',
        customer_requirements: 'I need help with KvK strategy and resource management'
      }
      expect(() => bookingValidationSchema.parse(validBooking)).not.toThrow()
    })

    it('should reject invalid CUID', () => {
      expect(() =>
        bookingValidationSchema.parse({ service_tier_id: 'invalid-id' })
      ).toThrow()
    })
  })

  describe('paymentValidationSchema', () => {
    it('should accept valid payment data', () => {
      const validPayment = {
        booking_id: 'clh2ov5o40000qf01h0p0p0p0',
        amount: 500000,
        payment_method: 'momo'
      }
      expect(() => paymentValidationSchema.parse(validPayment)).not.toThrow()
    })

    it('should reject amount over 10M VND', () => {
      expect(() =>
        paymentValidationSchema.parse({
          booking_id: 'clh2ov5o40000qf01h0p0p0p0',
          amount: 20000000,
          payment_method: 'vnpay'
        })
      ).toThrow()
    })

    it('should default currency to VND', () => {
      const result = paymentValidationSchema.parse({
        booking_id: 'clh2ov5o40000qf01h0p0p0p0',
        amount: 100000,
        payment_method: 'zalopay'
      })
      expect(result.currency).toBe('VND')
    })
  })

  describe('leadValidationSchema', () => {
    it('should accept valid lead data', () => {
      const validLead = {
        email: 'lead@example.com',
        phone: '0912345678',
        full_name: 'New Lead',
        service_interest: 'strategy',
        source: 'facebook'
      }
      expect(() => leadValidationSchema.parse(validLead)).not.toThrow()
    })

    it('should default source to website', () => {
      const result = leadValidationSchema.parse({})
      expect(result.source).toBe('website')
    })
  })

  describe('serviceValidationSchema', () => {
    it('should accept valid service data', () => {
      const validService = {
        name: 'KvK Strategy Consulting',
        slug: 'kvk-strategy-consulting',
        base_price: 500000
      }
      expect(() => serviceValidationSchema.parse(validService)).not.toThrow()
    })

    it('should reject invalid slug format', () => {
      expect(() =>
        serviceValidationSchema.parse({
          name: 'Test Service',
          slug: 'Invalid Slug!',
          base_price: 100000
        })
      ).toThrow()
    })
  })
})

describe('Validation Helper Functions', () => {
  describe('validateEmail', () => {
    it('should return valid for correct email', () => {
      const result = validateEmail('user@example.com')

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid email', () => {
      const result = validateEmail('invalid-email')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should return specific error message', () => {
      const result = validateEmail('short')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('email')
    })
  })

  describe('validatePhone', () => {
    it('should return valid for correct phone', () => {
      const result = validatePhone('0912345678')

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid phone', () => {
      const result = validatePhone('12345')

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateRoKData', () => {
    it('should validate correct RoK data', () => {
      const result = validateRoKData({
        playerId: '123456789',
        kingdom: '2800',
        power: '100000000'
      })

      expect(result.valid).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should return errors for invalid player ID', () => {
      const result = validateRoKData({ playerId: '12345' })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid Player ID format')
    })

    it('should return errors for invalid kingdom', () => {
      const result = validateRoKData({ kingdom: '12' })

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid Kingdom format')
    })

    it('should return multiple errors', () => {
      const result = validateRoKData({
        playerId: '123',
        kingdom: '1'
      })

      expect(result.valid).toBe(false)
      expect(result.errors?.length).toBeGreaterThan(1)
    })

    it('should handle empty data', () => {
      const result = validateRoKData({})

      expect(result.valid).toBe(true)
    })
  })
})

describe('Sanitization Functions', () => {
  describe('sanitizeInput', () => {
    it('should HTML-encode special characters', () => {
      expect(sanitizeInput('<script>')).toBe('&lt;script&gt;')
      expect(sanitizeInput('a & b')).toBe('a &amp; b')
      expect(sanitizeInput('test "quoted"')).toBe('test &quot;quoted&quot;')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
    })

    it('should encode apostrophes', () => {
      expect(sanitizeInput("it's")).toBe('it&#x27;s')
    })

    it('should handle normal text unchanged', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World')
    })
  })

  describe('stripDangerousHtml', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = stripDangerousHtml(input)

      expect(result).not.toContain('script')
      expect(result).toContain('Hello')
    })

    it('should remove javascript: protocols', () => {
      const input = '<a href="javascript:alert(1)">Click</a>'
      const result = stripDangerousHtml(input)

      expect(result).not.toContain('javascript:')
    })

    it('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert(1)">'
      const result = stripDangerousHtml(input)

      expect(result).not.toContain('onerror')
    })

    it('should remove data: protocols', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Click</a>'
      const result = stripDangerousHtml(input)

      expect(result).not.toContain('data:')
    })

    it('should remove vbscript: protocols', () => {
      const input = '<a href="vbscript:msgbox(1)">Click</a>'
      const result = stripDangerousHtml(input)

      expect(result).not.toContain('vbscript:')
    })

    it('should handle nested dangerous patterns', () => {
      const input = '<scr<script>ipt>alert(1)</script>'
      const result = stripDangerousHtml(input)

      expect(result.toLowerCase()).not.toContain('script')
    })

    it('should trim whitespace', () => {
      expect(stripDangerousHtml('  text  ')).toBe('text')
    })
  })

  describe('sanitizeUserInput', () => {
    it('should be alias for sanitizeInput', () => {
      const input = '<test>'
      expect(sanitizeUserInput(input)).toBe(sanitizeInput(input))
    })
  })

  describe('sanitizePhoneNumber', () => {
    it('should remove non-digit characters except +', () => {
      expect(sanitizePhoneNumber('(091) 234-5678')).toBe('+84912345678')
    })

    it('should convert 0 prefix to +84', () => {
      expect(sanitizePhoneNumber('0912345678')).toBe('+84912345678')
    })

    it('should convert 84 prefix to +84', () => {
      expect(sanitizePhoneNumber('84912345678')).toBe('+84912345678')
    })

    it('should keep +84 prefix unchanged', () => {
      expect(sanitizePhoneNumber('+84912345678')).toBe('+84912345678')
    })

    it('should handle other formats', () => {
      const result = sanitizePhoneNumber('123456789')
      expect(result).toBe('123456789') // No Vietnamese prefix detected
    })
  })
})
