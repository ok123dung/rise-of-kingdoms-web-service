/**
 * useFormatters Hook Tests
 * Tests memoized formatting functions for VND, dates, numbers, percentages, file sizes
 */

import { renderHook } from '@testing-library/react'

import { useFormatters } from '../useFormatters'

describe('useFormatters Hook', () => {
  describe('formatVND', () => {
    it('should format positive amounts in VND currency', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatVND(1000000)
      expect(formatted).toContain('1.000.000')
      expect(formatted).toContain('₫')
    })

    it('should format zero amount', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatVND(0)
      expect(formatted).toContain('0')
      expect(formatted).toContain('₫')
    })

    it('should format large amounts', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatVND(999999999)
      expect(formatted).toContain('999.999.999')
    })

    it('should handle decimal amounts (VND rounds)', () => {
      const { result } = renderHook(() => useFormatters())

      // VND doesn't have decimals, should round
      const formatted = result.current.formatVND(1000.5)
      expect(formatted).toMatch(/1\.00[01]/)
    })
  })

  describe('formatDate', () => {
    it('should format ISO date string to Vietnamese format', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatDate('2024-12-25T00:00:00Z')
      // Vietnamese format: day/month/year
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('should handle different date strings', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatDate('2024-01-15T10:30:00Z')
      expect(formatted).toContain('2024')
    })
  })

  describe('formatDateTime', () => {
    it('should format date with time in Vietnamese format', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatDateTime('2024-12-25T14:30:00Z')
      // Should include month name, day, year, and time
      expect(formatted).toContain('2024')
      expect(formatted).toMatch(/\d{2}:\d{2}/)
    })

    it('should include Vietnamese month names', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatDateTime('2024-01-15T10:00:00Z')
      // Vietnamese month format uses "tháng X"
      expect(formatted).toMatch(/tháng|thg/i)
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return "Vừa xong" for times less than 60 seconds ago', () => {
      const now = new Date('2024-12-25T12:00:00Z')
      jest.setSystemTime(now)

      const { result } = renderHook(() => useFormatters())

      const thirtySecondsAgo = new Date('2024-12-25T11:59:30Z').toISOString()
      expect(result.current.formatRelativeTime(thirtySecondsAgo)).toBe('Vừa xong')
    })

    it('should return minutes for times less than 1 hour ago', () => {
      const now = new Date('2024-12-25T12:00:00Z')
      jest.setSystemTime(now)

      const { result } = renderHook(() => useFormatters())

      const fiveMinutesAgo = new Date('2024-12-25T11:55:00Z').toISOString()
      expect(result.current.formatRelativeTime(fiveMinutesAgo)).toBe('5 phút trước')
    })

    it('should return hours for times less than 24 hours ago', () => {
      const now = new Date('2024-12-25T12:00:00Z')
      jest.setSystemTime(now)

      const { result } = renderHook(() => useFormatters())

      const threeHoursAgo = new Date('2024-12-25T09:00:00Z').toISOString()
      expect(result.current.formatRelativeTime(threeHoursAgo)).toBe('3 giờ trước')
    })

    it('should return days for times less than 7 days ago', () => {
      const now = new Date('2024-12-25T12:00:00Z')
      jest.setSystemTime(now)

      const { result } = renderHook(() => useFormatters())

      const twoDaysAgo = new Date('2024-12-23T12:00:00Z').toISOString()
      expect(result.current.formatRelativeTime(twoDaysAgo)).toBe('2 ngày trước')
    })

    it('should return formatted date for times more than 7 days ago', () => {
      const now = new Date('2024-12-25T12:00:00Z')
      jest.setSystemTime(now)

      const { result } = renderHook(() => useFormatters())

      const twoWeeksAgo = new Date('2024-12-10T12:00:00Z').toISOString()
      const formatted = result.current.formatRelativeTime(twoWeeksAgo)
      // Should fall back to formatDate which returns dd/mm/yyyy
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('formatNumber', () => {
    it('should format integers with Vietnamese thousands separator', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatNumber(1234567)
      expect(formatted).toBe('1.234.567')
    })

    it('should format zero', () => {
      const { result } = renderHook(() => useFormatters())

      expect(result.current.formatNumber(0)).toBe('0')
    })

    it('should format decimal numbers', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatNumber(1234.56)
      expect(formatted).toContain('1.234')
    })

    it('should handle negative numbers', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatNumber(-1000)
      expect(formatted).toContain('-')
      expect(formatted).toContain('1.000')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage from number (divides by 100)', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatPercentage(50)
      expect(formatted).toContain('50')
      expect(formatted).toContain('%')
    })

    it('should format zero percentage', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatPercentage(0)
      expect(formatted).toContain('0')
      expect(formatted).toContain('%')
    })

    it('should format 100%', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatPercentage(100)
      expect(formatted).toContain('100')
      expect(formatted).toContain('%')
    })

    it('should handle decimal percentages with max 1 decimal place', () => {
      const { result } = renderHook(() => useFormatters())

      const formatted = result.current.formatPercentage(33.333)
      // Should round to max 1 decimal place
      expect(formatted).toMatch(/33[,.]?3?%/)
    })
  })

  describe('formatFileSize', () => {
    it('should return "0 Bytes" for zero bytes', () => {
      const { result } = renderHook(() => useFormatters())

      expect(result.current.formatFileSize(0)).toBe('0 Bytes')
    })

    it('should format bytes', () => {
      const { result } = renderHook(() => useFormatters())

      expect(result.current.formatFileSize(500)).toBe('500 Bytes')
    })

    it('should format kilobytes', () => {
      const { result } = renderHook(() => useFormatters())

      expect(result.current.formatFileSize(1024)).toBe('1 KB')
      expect(result.current.formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes', () => {
      const { result } = renderHook(() => useFormatters())

      expect(result.current.formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(result.current.formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB')
    })

    it('should format gigabytes', () => {
      const { result } = renderHook(() => useFormatters())

      expect(result.current.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('should handle precise decimal formatting', () => {
      const { result } = renderHook(() => useFormatters())

      // 1.234 KB = 1263.616 bytes
      const formatted = result.current.formatFileSize(1264)
      expect(formatted).toBe('1.23 KB')
    })
  })

  describe('Memoization', () => {
    it('should return same function references on re-render', () => {
      const { result, rerender } = renderHook(() => useFormatters())

      const firstFormatVND = result.current.formatVND
      const firstFormatDate = result.current.formatDate
      const firstFormatNumber = result.current.formatNumber

      rerender()

      expect(result.current.formatVND).toBe(firstFormatVND)
      expect(result.current.formatDate).toBe(firstFormatDate)
      expect(result.current.formatNumber).toBe(firstFormatNumber)
    })

    it('should return all expected formatter functions', () => {
      const { result } = renderHook(() => useFormatters())

      expect(typeof result.current.formatVND).toBe('function')
      expect(typeof result.current.formatDate).toBe('function')
      expect(typeof result.current.formatDateTime).toBe('function')
      expect(typeof result.current.formatRelativeTime).toBe('function')
      expect(typeof result.current.formatNumber).toBe('function')
      expect(typeof result.current.formatPercentage).toBe('function')
      expect(typeof result.current.formatFileSize).toBe('function')
    })
  })
})
