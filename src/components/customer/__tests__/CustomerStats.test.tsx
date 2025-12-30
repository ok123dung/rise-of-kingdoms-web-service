/**
 * CustomerStats Component Tests
 * Tests customer dashboard statistics display
 */

import { render, screen } from '@testing-library/react'

import CustomerStats from '../CustomerStats'

const mockStats = {
  totalBookings: 15,
  totalSpent: 5000000,
  activeServices: 3,
  completedServices: 10,
  averageRating: 4.5,
  memberSince: '2024-01-15T00:00:00Z',
  nextTierThreshold: 10000000,
  currentTierProgress: 50,
  recentActivity: {
    lastBooking: '2024-12-20T10:00:00Z',
    lastPayment: '2024-12-20T10:30:00Z',
    upcomingService: '2024-12-25T14:00:00Z'
  }
}

describe('CustomerStats Component', () => {
  describe('Main Stats Cards', () => {
    it('should display total bookings', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Tổng đơn hàng')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('should display active services count', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('+3 đang hoạt động')).toBeInTheDocument()
    })

    it('should display total spent in VND', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Tổng chi tiêu')).toBeInTheDocument()
      // Currency format depends on locale - multiple elements may contain currency
      const currencyElements = screen.getAllByText(/₫/)
      expect(currencyElements.length).toBeGreaterThan(0)
    })

    it('should display average spent per order', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText(/Trung bình:/)).toBeInTheDocument()
    })

    it('should display completion rate', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Tỷ lệ hoàn thành')).toBeInTheDocument()
      // 10/15 = 66.67% rounded to 67%
      expect(screen.getByText('67%')).toBeInTheDocument()
    })

    it('should display completed/total services', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('10/15 dịch vụ')).toBeInTheDocument()
    })

    it('should display average rating', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Đánh giá trung bình')).toBeInTheDocument()
      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('should display rating stars', () => {
      render(<CustomerStats stats={mockStats} />)

      // Should have 5 stars (4 filled, 1 unfilled for 4.5 rating)
      const stars = screen.getAllByText('★')
      expect(stars.length).toBe(5)
    })
  })

  describe('Tier Progress', () => {
    it('should display tier progress section when threshold exists', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Tiến độ lên hạng')).toBeInTheDocument()
    })

    it('should display progress percentage', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('50.0%')).toBeInTheDocument()
    })

    it('should display tier upgrade message', () => {
      render(<CustomerStats stats={mockStats} />)

      // Multiple elements reference VIP Premium
      const vipElements = screen.getAllByText(/VIP Premium/)
      expect(vipElements.length).toBeGreaterThan(0)
    })

    it('should not display tier progress when no threshold', () => {
      const statsWithoutThreshold = { ...mockStats, nextTierThreshold: undefined }
      render(<CustomerStats stats={statsWithoutThreshold} />)

      expect(screen.queryByText('Tiến độ lên hạng')).not.toBeInTheDocument()
    })
  })

  describe('Recent Activity', () => {
    it('should display recent activity section', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Hoạt động gần đây')).toBeInTheDocument()
    })

    it('should display member since date', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Thành viên từ')).toBeInTheDocument()
    })

    it('should display last booking info', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Đơn hàng cuối')).toBeInTheDocument()
    })

    it('should display last payment info', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Thanh toán cuối')).toBeInTheDocument()
    })

    it('should display upcoming service when exists', () => {
      render(<CustomerStats stats={mockStats} />)

      expect(screen.getByText('Dịch vụ sắp tới')).toBeInTheDocument()
    })

    it('should not show upcoming service section when null', () => {
      const statsWithoutUpcoming = {
        ...mockStats,
        recentActivity: { ...mockStats.recentActivity, upcomingService: null }
      }
      render(<CustomerStats stats={statsWithoutUpcoming} />)

      expect(screen.queryByText('Dịch vụ sắp tới')).not.toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle zero bookings', () => {
      const emptyStats = { ...mockStats, totalBookings: 0, completedServices: 0 }
      render(<CustomerStats stats={emptyStats} />)

      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle null dates in activity', () => {
      const statsWithNullDates = {
        ...mockStats,
        recentActivity: { lastBooking: null, lastPayment: null }
      }
      render(<CustomerStats stats={statsWithNullDates} />)

      expect(screen.getByText('Chưa có đơn hàng')).toBeInTheDocument()
      expect(screen.getByText('Chưa có thanh toán')).toBeInTheDocument()
    })

    it('should handle 100% completion rate', () => {
      const fullStats = { ...mockStats, completedServices: 15 }
      render(<CustomerStats stats={fullStats} />)

      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should handle perfect 5.0 rating', () => {
      const perfectStats = { ...mockStats, averageRating: 5.0 }
      render(<CustomerStats stats={perfectStats} />)

      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })
})
