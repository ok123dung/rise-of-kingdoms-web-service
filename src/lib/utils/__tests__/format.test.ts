/**
 * Format Utilities Tests
 * Tests for Vietnamese locale formatting functions
 */

import {
  formatCurrency,
  formatPhoneNumber,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  truncateText,
  formatBookingStatus,
  formatPaymentStatus,
} from '../format'

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency with default options', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1.000.000')
      expect(result).toContain('VNĐ')
    })

    it('should format currency without symbol', () => {
      const result = formatCurrency(500000, { showSymbol: false })
      expect(result).toBe('500.000')
    })

    it('should format compact millions', () => {
      const result = formatCurrency(2500000, { compact: true })
      expect(result).toBe('2.5M VNĐ')
    })

    it('should format compact thousands', () => {
      const result = formatCurrency(50000, { compact: true })
      expect(result).toBe('50.0K VNĐ')
    })

    it('should format compact without symbol', () => {
      const result = formatCurrency(1500000, { compact: true, showSymbol: false })
      expect(result).toBe('1.5M')
    })

    it('should handle zero', () => {
      const result = formatCurrency(0)
      expect(result).toBe('0 VNĐ')
    })

    it('should handle small amounts in compact mode', () => {
      const result = formatCurrency(500, { compact: true })
      expect(result).toContain('500')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format 10-digit Vietnamese number', () => {
      const result = formatPhoneNumber('0912345678')
      expect(result).toBe('0912 345 678')
    })

    it('should format 11-digit number with country code', () => {
      const result = formatPhoneNumber('84912345678')
      expect(result).toBe('+84 912 345 678')
    })

    it('should handle phone with non-digit characters', () => {
      const result = formatPhoneNumber('091-234-5678')
      expect(result).toBe('0912 345 678')
    })

    it('should return original for invalid format', () => {
      const result = formatPhoneNumber('12345')
      expect(result).toBe('12345')
    })

    it('should handle already formatted number', () => {
      const result = formatPhoneNumber('0912 345 678')
      expect(result).toBe('0912 345 678')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00')

    it('should format date with medium style (default)', () => {
      const result = formatDate(testDate)
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format date with short style', () => {
      const result = formatDate(testDate, { style: 'short' })
      expect(result).toContain('15')
      expect(result).toContain('1') // January
    })

    it('should format date with long style', () => {
      const result = formatDate(testDate, { style: 'long' })
      // Long style includes month name
      expect(result).toContain('2024')
    })

    it('should include time when requested', () => {
      const result = formatDate(testDate, { includeTime: true })
      expect(result).toContain('10')
      expect(result).toContain('30')
    })

    it('should handle string date input', () => {
      const result = formatDate('2024-01-15')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format relative time', () => {
      const result = formatDate(new Date(), { style: 'relative' })
      expect(result).toBe('Vừa xong')
    })
  })

  describe('formatRelativeTime', () => {
    it('should return "Vừa xong" for recent time', () => {
      const result = formatRelativeTime(new Date())
      expect(result).toBe('Vừa xong')
    })

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatRelativeTime(fiveMinutesAgo)
      expect(result).toBe('5 phút trước')
    })

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoHoursAgo)
      expect(result).toBe('2 giờ trước')
    })

    it('should format days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(threeDaysAgo)
      expect(result).toBe('3 ngày trước')
    })

    it('should format weeks ago', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoWeeksAgo)
      expect(result).toBe('2 tuần trước')
    })

    it('should format months ago', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoMonthsAgo)
      expect(result).toBe('2 tháng trước')
    })

    it('should format years ago', () => {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(oneYearAgo)
      expect(result).toBe('1 năm trước')
    })

    it('should handle string date input', () => {
      const result = formatRelativeTime(new Date().toISOString())
      expect(result).toBe('Vừa xong')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.00 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.00 GB')
    })

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('should format partial values', () => {
      const result = formatFileSize(1536) // 1.5 KB
      expect(result).toBe('1.50 KB')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const result = truncateText('This is a long text that should be truncated', 20)
      expect(result).toBe('This is a long text...')
    })

    it('should not truncate short text', () => {
      const result = truncateText('Short text', 20)
      expect(result).toBe('Short text')
    })

    it('should handle exact length', () => {
      const result = truncateText('Exact', 5)
      expect(result).toBe('Exact')
    })

    it('should trim before adding ellipsis', () => {
      const result = truncateText('Hello World   ', 8)
      expect(result).toBe('Hello Wo...')
    })
  })

  describe('formatBookingStatus', () => {
    it('should format pending status', () => {
      expect(formatBookingStatus('pending')).toBe('Đang chờ')
    })

    it('should format confirmed status', () => {
      expect(formatBookingStatus('confirmed')).toBe('Đã xác nhận')
    })

    it('should format in_progress status', () => {
      expect(formatBookingStatus('in_progress')).toBe('Đang thực hiện')
    })

    it('should format completed status', () => {
      expect(formatBookingStatus('completed')).toBe('Hoàn thành')
    })

    it('should format cancelled status', () => {
      expect(formatBookingStatus('cancelled')).toBe('Đã hủy')
    })

    it('should format refunded status', () => {
      expect(formatBookingStatus('refunded')).toBe('Đã hoàn tiền')
    })

    it('should return original for unknown status', () => {
      expect(formatBookingStatus('unknown')).toBe('unknown')
    })
  })

  describe('formatPaymentStatus', () => {
    it('should format pending status', () => {
      expect(formatPaymentStatus('pending')).toBe('Đang chờ thanh toán')
    })

    it('should format processing status', () => {
      expect(formatPaymentStatus('processing')).toBe('Đang xử lý')
    })

    it('should format paid status', () => {
      expect(formatPaymentStatus('paid')).toBe('Đã thanh toán')
    })

    it('should format failed status', () => {
      expect(formatPaymentStatus('failed')).toBe('Thanh toán thất bại')
    })

    it('should format refunded status', () => {
      expect(formatPaymentStatus('refunded')).toBe('Đã hoàn tiền')
    })

    it('should format cancelled status', () => {
      expect(formatPaymentStatus('cancelled')).toBe('Đã hủy')
    })

    it('should return original for unknown status', () => {
      expect(formatPaymentStatus('unknown')).toBe('unknown')
    })
  })
})
