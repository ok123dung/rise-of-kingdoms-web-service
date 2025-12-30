/**
 * Timestamp Utils Tests
 * Tests for VNPay timestamp conversion and validation utilities
 */

import {
  parseVNPayTimestamp,
  toVNPayTimestamp,
  isTimestampValid
} from '../timestamp-utils'

describe('Timestamp Utils', () => {
  describe('parseVNPayTimestamp', () => {
    it('should parse valid VNPay timestamp format', () => {
      // December 30, 2024 15:30:45
      const result = parseVNPayTimestamp('20241230153045')

      const date = new Date(result)
      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(11) // December (0-indexed)
      expect(date.getDate()).toBe(30)
      expect(date.getHours()).toBe(15)
      expect(date.getMinutes()).toBe(30)
      expect(date.getSeconds()).toBe(45)
    })

    it('should return current time for undefined input', () => {
      const before = Date.now()
      const result = parseVNPayTimestamp(undefined)
      const after = Date.now()

      expect(result).toBeGreaterThanOrEqual(before)
      expect(result).toBeLessThanOrEqual(after)
    })

    it('should return current time for empty string', () => {
      const before = Date.now()
      const result = parseVNPayTimestamp('')
      const after = Date.now()

      expect(result).toBeGreaterThanOrEqual(before)
      expect(result).toBeLessThanOrEqual(after)
    })

    it('should return current time for short string', () => {
      const before = Date.now()
      const result = parseVNPayTimestamp('2024123015')
      const after = Date.now()

      expect(result).toBeGreaterThanOrEqual(before)
      expect(result).toBeLessThanOrEqual(after)
    })

    it('should return current time for long string', () => {
      const before = Date.now()
      const result = parseVNPayTimestamp('202412301530451234')
      const after = Date.now()

      expect(result).toBeGreaterThanOrEqual(before)
      expect(result).toBeLessThanOrEqual(after)
    })

    it('should handle midnight timestamp', () => {
      const result = parseVNPayTimestamp('20240101000000')
      const date = new Date(result)

      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(0) // January
      expect(date.getDate()).toBe(1)
      expect(date.getHours()).toBe(0)
      expect(date.getMinutes()).toBe(0)
      expect(date.getSeconds()).toBe(0)
    })

    it('should handle end of day timestamp', () => {
      const result = parseVNPayTimestamp('20241231235959')
      const date = new Date(result)

      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(11) // December
      expect(date.getDate()).toBe(31)
      expect(date.getHours()).toBe(23)
      expect(date.getMinutes()).toBe(59)
      expect(date.getSeconds()).toBe(59)
    })
  })

  describe('toVNPayTimestamp', () => {
    it('should convert timestamp to VNPay format', () => {
      // Create a specific date
      const date = new Date(2024, 11, 30, 15, 30, 45) // December 30, 2024 15:30:45
      const result = toVNPayTimestamp(date.getTime())

      expect(result).toBe('20241230153045')
    })

    it('should pad single digit values with zeros', () => {
      const date = new Date(2024, 0, 5, 8, 3, 9) // January 5, 2024 08:03:09
      const result = toVNPayTimestamp(date.getTime())

      expect(result).toBe('20240105080309')
    })

    it('should handle midnight', () => {
      const date = new Date(2024, 0, 1, 0, 0, 0)
      const result = toVNPayTimestamp(date.getTime())

      expect(result).toBe('20240101000000')
    })

    it('should handle end of day', () => {
      const date = new Date(2024, 11, 31, 23, 59, 59)
      const result = toVNPayTimestamp(date.getTime())

      expect(result).toBe('20241231235959')
    })

    it('should be reversible with parseVNPayTimestamp', () => {
      const original = Date.now()
      const vnpayFormat = toVNPayTimestamp(original)
      const parsed = parseVNPayTimestamp(vnpayFormat)

      // Allow 1 second difference due to millisecond truncation
      expect(Math.abs(original - parsed)).toBeLessThan(1000)
    })
  })

  describe('isTimestampValid', () => {
    it('should return true for current timestamp', () => {
      const result = isTimestampValid(Date.now())
      expect(result).toBe(true)
    })

    it('should return true for timestamp within default window', () => {
      // 2 minutes ago
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      expect(isTimestampValid(twoMinutesAgo)).toBe(true)
    })

    it('should return false for timestamp older than default 5 minutes', () => {
      // 6 minutes ago
      const sixMinutesAgo = Date.now() - 6 * 60 * 1000
      expect(isTimestampValid(sixMinutesAgo)).toBe(false)
    })

    it('should return false for timestamp in the future beyond clock skew', () => {
      // 2 minutes in the future
      const twoMinutesFromNow = Date.now() + 2 * 60 * 1000
      expect(isTimestampValid(twoMinutesFromNow)).toBe(false)
    })

    it('should allow timestamp within clock skew tolerance (1 minute)', () => {
      // 30 seconds in the future
      const thirtySecondsFromNow = Date.now() + 30 * 1000
      expect(isTimestampValid(thirtySecondsFromNow)).toBe(true)
    })

    it('should respect custom maxAgeMs', () => {
      // 2 minutes ago with 1 minute window
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      expect(isTimestampValid(twoMinutesAgo, 60 * 1000)).toBe(false)

      // 30 seconds ago with 1 minute window
      const thirtySecondsAgo = Date.now() - 30 * 1000
      expect(isTimestampValid(thirtySecondsAgo, 60 * 1000)).toBe(true)
    })

    it('should handle edge case at exactly max age', () => {
      // Exactly 5 minutes ago - should be valid because age <= maxAgeMs
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      expect(isTimestampValid(fiveMinutesAgo)).toBe(true)

      // Just over 5 minutes - should be invalid
      const justOverFive = Date.now() - (5 * 60 * 1000 + 1)
      expect(isTimestampValid(justOverFive)).toBe(false)
    })

    it('should handle edge case at exactly clock skew boundary', () => {
      // Exactly 1 minute in the future - should be valid because <= 60000
      const oneMinuteFromNow = Date.now() + 60 * 1000
      expect(isTimestampValid(oneMinuteFromNow)).toBe(true)

      // Just over 1 minute in future - should be invalid
      const justOverOne = Date.now() + 60 * 1001
      expect(isTimestampValid(justOverOne)).toBe(false)
    })
  })
})
