/**
 * useStatusBadges Hook Tests
 * Tests status badge configuration for bookings and payments
 */

import { renderHook } from '@testing-library/react'
import { render, screen } from '@testing-library/react'

import { useStatusBadges } from '../useStatusBadges'

describe('useStatusBadges Hook', () => {
  describe('getBookingStatusBadge', () => {
    it('should return pending badge config', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getBookingStatusBadge('pending')

      expect(badge.label).toBe('Chờ xử lý')
      expect(badge.className).toContain('yellow')
      expect(badge.icon).toBeTruthy()
    })

    it('should return confirmed badge config', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getBookingStatusBadge('confirmed')

      expect(badge.label).toBe('Đã xác nhận')
      expect(badge.className).toContain('blue')
    })

    it('should return in_progress badge config', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getBookingStatusBadge('in_progress')

      expect(badge.label).toBe('Đang thực hiện')
      expect(badge.className).toContain('purple')
    })

    it('should return completed badge config', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getBookingStatusBadge('completed')

      expect(badge.label).toBe('Hoàn thành')
      expect(badge.className).toContain('green')
    })

    it('should return cancelled badge config', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getBookingStatusBadge('cancelled')

      expect(badge.label).toBe('Đã hủy')
      expect(badge.className).toContain('red')
    })

    it('should return default badge for unknown status', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getBookingStatusBadge('unknown_status')

      expect(badge.label).toBe('Không xác định')
      expect(badge.className).toContain('gray')
    })
  })

  describe('getPaymentStatusBadge', () => {
    it('should return pending payment badge', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getPaymentStatusBadge('pending')

      expect(badge.label).toBe('Chờ thanh toán')
      expect(badge.className).toContain('yellow')
    })

    it('should return processing payment badge', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getPaymentStatusBadge('processing')

      expect(badge.label).toBe('Đang xử lý')
      expect(badge.className).toContain('blue')
    })

    it('should return completed payment badge', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getPaymentStatusBadge('completed')

      expect(badge.label).toBe('Đã thanh toán')
      expect(badge.className).toContain('green')
    })

    it('should return failed payment badge', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getPaymentStatusBadge('failed')

      expect(badge.label).toBe('Thất bại')
      expect(badge.className).toContain('red')
    })

    it('should return refunded payment badge', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getPaymentStatusBadge('refunded')

      expect(badge.label).toBe('Đã hoàn tiền')
      expect(badge.className).toContain('purple')
    })

    it('should return default badge for unknown payment status', () => {
      const { result } = renderHook(() => useStatusBadges())

      const badge = result.current.getPaymentStatusBadge('invalid')

      expect(badge.label).toBe('Không xác định')
      expect(badge.className).toContain('gray')
    })
  })

  describe('renderBadge', () => {
    it('should render badge with label text', () => {
      const { result } = renderHook(() => useStatusBadges())
      const badge = result.current.getBookingStatusBadge('completed')

      render(result.current.renderBadge(badge))

      expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    })

    it('should render badge with correct styling classes', () => {
      const { result } = renderHook(() => useStatusBadges())
      const badge = result.current.getBookingStatusBadge('pending')

      render(result.current.renderBadge(badge))

      const badgeElement = screen.getByText('Chờ xử lý').closest('span')
      expect(badgeElement).toHaveClass('rounded-full')
      expect(badgeElement).toHaveClass('border')
      expect(badgeElement).toHaveClass('bg-yellow-100')
    })

    it('should render badge with icon', () => {
      const { result } = renderHook(() => useStatusBadges())
      const badge = result.current.getBookingStatusBadge('completed')

      const { container } = render(result.current.renderBadge(badge))

      // Icon should be rendered as SVG
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should render different payment badges', () => {
      const { result } = renderHook(() => useStatusBadges())
      const badge = result.current.getPaymentStatusBadge('failed')

      render(result.current.renderBadge(badge))

      expect(screen.getByText('Thất bại')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should return same function references on re-render', () => {
      const { result, rerender } = renderHook(() => useStatusBadges())

      const firstGetBooking = result.current.getBookingStatusBadge
      const firstGetPayment = result.current.getPaymentStatusBadge
      const firstRender = result.current.renderBadge

      rerender()

      expect(result.current.getBookingStatusBadge).toBe(firstGetBooking)
      expect(result.current.getPaymentStatusBadge).toBe(firstGetPayment)
      expect(result.current.renderBadge).toBe(firstRender)
    })

    it('should return all expected functions', () => {
      const { result } = renderHook(() => useStatusBadges())

      expect(typeof result.current.getBookingStatusBadge).toBe('function')
      expect(typeof result.current.getPaymentStatusBadge).toBe('function')
      expect(typeof result.current.renderBadge).toBe('function')
    })
  })

  describe('Badge Config Structure', () => {
    it('should have icon, className, and label in all booking statuses', () => {
      const { result } = renderHook(() => useStatusBadges())
      const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

      statuses.forEach(status => {
        const badge = result.current.getBookingStatusBadge(status)
        expect(badge).toHaveProperty('icon')
        expect(badge).toHaveProperty('className')
        expect(badge).toHaveProperty('label')
        expect(typeof badge.className).toBe('string')
        expect(typeof badge.label).toBe('string')
      })
    })

    it('should have icon, className, and label in all payment statuses', () => {
      const { result } = renderHook(() => useStatusBadges())
      const statuses = ['pending', 'processing', 'completed', 'failed', 'refunded']

      statuses.forEach(status => {
        const badge = result.current.getPaymentStatusBadge(status)
        expect(badge).toHaveProperty('icon')
        expect(badge).toHaveProperty('className')
        expect(badge).toHaveProperty('label')
        expect(typeof badge.className).toBe('string')
        expect(typeof badge.label).toBe('string')
      })
    })
  })
})
