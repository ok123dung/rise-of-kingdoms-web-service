import {
  validateEmail,
  validatePhone,
  validateRoKData,
  sanitizeInput,
  sanitizePhoneNumber,
  signupSchema,
  leadSchema,
  paymentSchema
} from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org']

      validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = ['invalid-email', '@domain.com', 'user@', 'user space@domain.com']

      invalidEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })
  })

  describe('validatePhone', () => {
    it('should validate correct Vietnamese phone numbers', () => {
      const validPhones = ['0987654321', '+84987654321', '84987654321', '0356789012', '0768123456']

      validPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['123456789', '0123456789', '987654321', '+1234567890']

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      })
    })
  })

  describe('validateRoKData', () => {
    it('should validate correct RoK player data', () => {
      const validData = {
        playerId: '123456789',
        kingdom: '1234',
        power: '50000000'
      }

      const result = validateRoKData(validData)
      expect(result.valid).toBe(true)
      expect(result.errors).toBeUndefined()
    })

    it('should reject invalid RoK data', () => {
      const invalidData = {
        playerId: '12345', // too short
        kingdom: '12345', // too long
        power: 'not-a-number'
      }

      const result = validateRoKData(invalidData)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(3)
    })
  })

  describe('sanitizeInput', () => {
    it('should HTML-encode dangerous content to prevent XSS', () => {
      // sanitizeInput uses HTML encoding (safer than stripping)
      const testCases = [
        { input: '<script>alert("xss")</script>', expected: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;' },
        { input: '<div onclick="alert()">Click</div>', expected: '&lt;div onclick=&quot;alert()&quot;&gt;Click&lt;/div&gt;' },
        { input: '  Hello World  ', expected: 'Hello World' }, // trims whitespace
        { input: 'Normal text', expected: 'Normal text' },
        { input: "It's a test", expected: 'It&#x27;s a test' }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = sanitizeInput(input)
        expect(result).toBe(expected)
      })
    })
  })

  describe('sanitizePhoneNumber', () => {
    it('should normalize Vietnamese phone numbers', () => {
      const testCases = [
        { input: '0987-654-321', expected: '+84987654321' },
        { input: '84987654321', expected: '+84987654321' },
        { input: '+84987654321', expected: '+84987654321' },
        { input: '(098) 765-4321', expected: '+84987654321' }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = sanitizePhoneNumber(input)
        expect(result).toBe(expected)
      })
    })
  })
})

describe('Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        full_name: 'Nguyễn Văn A',
        email: 'test@example.com',
        password: 'SecureP@ss1234', // 12+ chars, upper, lower, number, special
        phone: '0987654321'
      }

      const result = signupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid signup data', () => {
      const invalidData = {
        full_name: 'A', // too short
        email: 'invalid-email',
        password: '123', // too short
        phone: '123' // invalid format
      }

      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        // Password validation has multiple requirements (12+ chars, uppercase, lowercase, special char)
        expect(result.error.errors.length).toBeGreaterThanOrEqual(4)
      }
    })
  })

  describe('leadSchema', () => {
    it('should validate correct lead data', () => {
      const validData = {
        full_name: 'Nguyễn Văn B',
        email: 'lead@example.com',
        phone: '0987654321',
        service_interest: 'strategy',
        source: 'website',
        notes: 'Interested in professional coaching'
      }

      const result = leadSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('paymentSchema', () => {
    it('should validate correct payment data', () => {
      const validData = {
        booking_id: 'clk1234567890abcdef',
        amount: 750000,
        currency: 'VND',
        payment_method: 'momo'
      }

      const result = paymentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid payment amounts', () => {
      const invalidData = {
        booking_id: 'clk1234567890abcdef',
        amount: -1000, // negative amount
        currency: 'VND',
        payment_method: 'momo'
      }

      const result = paymentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
