/**
 * Password Validation Tests
 * Tests password strength checking, common password detection, pattern detection
 */

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  passwordSchema,
  isCommonPassword,
  hasRepeatingCharacters,
  hasSequentialCharacters,
  calculatePasswordStrength,
  validatePassword,
  generateSecurePassword
} from '../password-validation'

describe('Password Validation', () => {
  describe('Constants', () => {
    it('should have minimum length of 12', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(12)
    })

    it('should have maximum length of 128', () => {
      expect(PASSWORD_MAX_LENGTH).toBe(128)
    })
  })

  describe('passwordSchema', () => {
    it('should accept valid password with all requirements', () => {
      const validPassword = 'MyStr0ng@Pass!'

      expect(() => passwordSchema.parse(validPassword)).not.toThrow()
    })

    it('should reject password shorter than minimum length', () => {
      const shortPassword = 'Ab1@short'

      expect(() => passwordSchema.parse(shortPassword)).toThrow()
    })

    it('should reject password without uppercase', () => {
      const noUppercase = 'lowercase123@!'

      expect(() => passwordSchema.parse(noUppercase)).toThrow()
    })

    it('should reject password without lowercase', () => {
      const noLowercase = 'UPPERCASE123@!'

      expect(() => passwordSchema.parse(noLowercase)).toThrow()
    })

    it('should reject password without number', () => {
      const noNumber = 'NoNumbersHere@!'

      expect(() => passwordSchema.parse(noNumber)).toThrow()
    })

    it('should reject password without special character', () => {
      const noSpecial = 'NoSpecialChar123'

      expect(() => passwordSchema.parse(noSpecial)).toThrow()
    })
  })

  describe('isCommonPassword', () => {
    it('should detect common passwords', () => {
      expect(isCommonPassword('password123')).toBe(true)
      expect(isCommonPassword('admin123')).toBe(true)
      expect(isCommonPassword('qwerty123')).toBe(true)
      expect(isCommonPassword('Welcome@123')).toBe(true)
    })

    it('should be case-insensitive', () => {
      expect(isCommonPassword('PASSWORD123')).toBe(true)
      expect(isCommonPassword('Password123')).toBe(true)
    })

    it('should detect passwords containing common patterns', () => {
      expect(isCommonPassword('mypassword123account')).toBe(true)
    })

    it('should allow unique passwords', () => {
      expect(isCommonPassword('xK9#mP2$vL5@nQ')).toBe(false)
    })

    it('should detect Vietnamese common passwords', () => {
      expect(isCommonPassword('matkhau12345')).toBe(true)
      expect(isCommonPassword('vietnam12345')).toBe(true)
    })

    it('should detect RoK-related common passwords', () => {
      expect(isCommonPassword('kingdom12345')).toBe(true)
      expect(isCommonPassword('rokplayer123')).toBe(true)
    })
  })

  describe('hasRepeatingCharacters', () => {
    it('should detect repeating characters (default 3)', () => {
      expect(hasRepeatingCharacters('passssword')).toBe(true)
      expect(hasRepeatingCharacters('aaabbb')).toBe(true)
    })

    it('should allow up to 2 repeating chars by default', () => {
      expect(hasRepeatingCharacters('password')).toBe(false)
      expect(hasRepeatingCharacters('aabbcc')).toBe(false)
    })

    it('should respect custom maxRepeats parameter', () => {
      expect(hasRepeatingCharacters('aaa', 4)).toBe(false)
      expect(hasRepeatingCharacters('aaaa', 4)).toBe(true)
    })
  })

  describe('hasSequentialCharacters', () => {
    it('should detect sequential characters (default 3)', () => {
      expect(hasSequentialCharacters('abc123')).toBe(true)
      expect(hasSequentialCharacters('xyz789')).toBe(true)
    })

    it('should detect numeric sequences', () => {
      expect(hasSequentialCharacters('password123')).toBe(true)
      expect(hasSequentialCharacters('test456test')).toBe(true)
    })

    it('should allow non-sequential characters', () => {
      expect(hasSequentialCharacters('xk9mp2vl')).toBe(false)
      expect(hasSequentialCharacters('aceg1357')).toBe(false)
    })

    it('should respect custom maxSequence parameter', () => {
      expect(hasSequentialCharacters('abc', 4)).toBe(false)
      expect(hasSequentialCharacters('abcd', 4)).toBe(true)
    })
  })

  describe('calculatePasswordStrength', () => {
    it('should return weak for short simple passwords', () => {
      const result = calculatePasswordStrength('password')

      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(40)
    })

    it('should return fair for moderate passwords', () => {
      const result = calculatePasswordStrength('MyPassword12')

      expect(result.strength).toBe('fair')
      expect(result.score).toBeGreaterThanOrEqual(40)
      expect(result.score).toBeLessThan(60)
    })

    it('should return good for decent passwords', () => {
      const result = calculatePasswordStrength('MyP@ssword123!')

      expect(result.strength).toBe('good')
      expect(result.score).toBeGreaterThanOrEqual(60)
    })

    it('should return strong for excellent passwords', () => {
      const result = calculatePasswordStrength('xK9#mP2$vL5@nQ8!rT')

      expect(result.strength).toBe('strong')
      expect(result.score).toBeGreaterThanOrEqual(80)
    })

    it('should penalize common passwords', () => {
      const result = calculatePasswordStrength('password123456')

      expect(result.feedback).toContain('Avoid common passwords')
      expect(result.score).toBeLessThan(50)
    })

    it('should penalize repeating characters', () => {
      const result = calculatePasswordStrength('Passssword123!')

      expect(result.feedback).toContain('Avoid repeating characters')
    })

    it('should penalize sequential characters', () => {
      const result = calculatePasswordStrength('MyPass123abc!')

      expect(result.feedback).toContain('Avoid sequential characters')
    })

    it('should give bonus for longer passwords', () => {
      const short = calculatePasswordStrength('MyP@ss123!')
      const long = calculatePasswordStrength('MyP@ss123!ExtraLong')

      expect(long.score).toBeGreaterThan(short.score)
    })

    it('should give bonus for multiple special characters', () => {
      const oneSpecial = calculatePasswordStrength('MyPassword123!')
      const twoSpecial = calculatePasswordStrength('MyPassword123!@')

      expect(twoSpecial.score).toBeGreaterThan(oneSpecial.score)
    })
  })

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = validatePassword('MyStr0ng@Pass!')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for short password', () => {
      const result = validatePassword('Short1!')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return error for common password', () => {
      const result = validatePassword('Password@123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is too common')
    })

    it('should return error for repeating characters (4+)', () => {
      const result = validatePassword('Passsssword123!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains too many repeating characters')
    })

    it('should return error for sequential characters (4+)', () => {
      const result = validatePassword('MyPass1234abcd!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains sequential characters')
    })

    it('should collect multiple errors', () => {
      const result = validatePassword('short')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('generateSecurePassword', () => {
    it('should generate password of specified length', () => {
      const password = generateSecurePassword(20)

      expect(password.length).toBe(20)
    })

    it('should use default length of 16', () => {
      const password = generateSecurePassword()

      expect(password.length).toBe(16)
    })

    it('should contain uppercase letter', () => {
      const password = generateSecurePassword()

      expect(/[A-Z]/.test(password)).toBe(true)
    })

    it('should contain lowercase letter', () => {
      const password = generateSecurePassword()

      expect(/[a-z]/.test(password)).toBe(true)
    })

    it('should contain number', () => {
      const password = generateSecurePassword()

      expect(/[0-9]/.test(password)).toBe(true)
    })

    it('should contain special character', () => {
      const password = generateSecurePassword()

      expect(/[^A-Za-z0-9]/.test(password)).toBe(true)
    })

    it('should generate unique passwords', () => {
      const passwords = new Set<string>()
      for (let i = 0; i < 50; i++) {
        passwords.add(generateSecurePassword())
      }

      expect(passwords.size).toBe(50)
    })

    it('should pass validation', () => {
      const password = generateSecurePassword()
      const result = validatePassword(password)

      expect(result.valid).toBe(true)
    })
  })
})
