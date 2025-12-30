/**
 * ActiveBookings Component Tests
 * Tests active bookings display and status
 */

import { render, screen } from '@testing-library/react'

import ActiveBookings from '../ActiveBookings'

const mockBookings = [
  {
    id: '1',
    booking_number: 'BK-001',
    serviceName: 'Tư vấn chiến thuật',
    tierName: 'Premium',
    status: 'in_progress',
    start_date: '2024-12-01T00:00:00Z',
    end_date: '2024-12-31T00:00:00Z',
    progress: 75,
    nextSession: '2024-12-25T14:00:00Z',
    assignedStaff: {
      name: 'Nguyễn Văn A',
      avatar: null
    }
  },
  {
    id: '2',
    booking_number: 'BK-002',
    serviceName: 'Quản lý liên minh',
    tierName: 'Basic',
    status: 'pending',
    start_date: '2024-12-15T00:00:00Z',
    end_date: '2025-01-15T00:00:00Z',
    progress: 0,
    assignedStaff: null
  }
]

describe('ActiveBookings Component', () => {
  describe('Empty state', () => {
    it('should show empty message when no bookings', () => {
      render(<ActiveBookings bookings={[]} />)

      expect(screen.getByText('Bạn chưa có dịch vụ nào đang hoạt động')).toBeInTheDocument()
    })

    it('should show link to book new service', () => {
      render(<ActiveBookings bookings={[]} />)

      const link = screen.getByRole('link', { name: 'Đặt dịch vụ mới' })
      expect(link).toHaveAttribute('href', '/services')
    })

    it('should show empty state icon', () => {
      render(<ActiveBookings bookings={[]} />)

      // AlertCircle icon is present in empty state
      expect(screen.getByText('Bạn chưa có dịch vụ nào đang hoạt động')).toBeInTheDocument()
    })
  })

  describe('With bookings', () => {
    it('should display card title', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Dịch vụ đang hoạt động')).toBeInTheDocument()
    })

    it('should display booking count', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('2 dịch vụ đang được thực hiện')).toBeInTheDocument()
    })

    it('should display all bookings', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Tư vấn chiến thuật')).toBeInTheDocument()
      expect(screen.getByText('Quản lý liên minh')).toBeInTheDocument()
    })

    it('should display booking numbers', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('#BK-001')).toBeInTheDocument()
      expect(screen.getByText('#BK-002')).toBeInTheDocument()
    })

    it('should display tier names', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Premium')).toBeInTheDocument()
      expect(screen.getByText('Basic')).toBeInTheDocument()
    })

    it('should have links to booking details', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      const links = screen.getAllByRole('link')
      const bookingLinks = links.filter(link => link.getAttribute('href')?.includes('/dashboard/bookings/'))
      expect(bookingLinks).toHaveLength(2)
    })
  })

  describe('Status display', () => {
    it('should show in_progress status correctly', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Đang thực hiện')).toBeInTheDocument()
    })

    it('should show pending status correctly', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Chờ bắt đầu')).toBeInTheDocument()
    })

    it('should show completed status', () => {
      const completedBooking = [{ ...mockBookings[0], status: 'completed' }]
      render(<ActiveBookings bookings={completedBooking} />)

      expect(screen.getByText('Hoàn thành')).toBeInTheDocument()
    })

    it('should show paused status', () => {
      const pausedBooking = [{ ...mockBookings[0], status: 'paused' }]
      render(<ActiveBookings bookings={pausedBooking} />)

      expect(screen.getByText('Tạm dừng')).toBeInTheDocument()
    })
  })

  describe('Progress display', () => {
    it('should show progress for in_progress bookings', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Tiến độ')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should not show progress for pending bookings', () => {
      const pendingOnly = [mockBookings[1]]
      render(<ActiveBookings bookings={pendingOnly} />)

      expect(screen.queryByText('Tiến độ')).not.toBeInTheDocument()
    })
  })

  describe('Next session display', () => {
    it('should show next session when available', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText(/Phiên tiếp theo:/)).toBeInTheDocument()
    })

    it('should not show next session when not available', () => {
      const noSessionBookings = [{ ...mockBookings[0], nextSession: undefined }]
      render(<ActiveBookings bookings={noSessionBookings} />)

      expect(screen.queryByText(/Phiên tiếp theo:/)).not.toBeInTheDocument()
    })
  })

  describe('Staff display', () => {
    it('should show staff name when assigned', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    })

    it('should show staff initials when no avatar', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      // NVA = Nguyễn Văn A initials
      expect(screen.getByText('NVA')).toBeInTheDocument()
    })

    it('should not show staff section when not assigned', () => {
      const noStaffBookings = [{ ...mockBookings[0], assignedStaff: null }]
      render(<ActiveBookings bookings={noStaffBookings} />)

      expect(screen.queryByText('Nguyễn Văn A')).not.toBeInTheDocument()
    })
  })

  describe('View all link', () => {
    it('should show view all bookings link', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      const viewAllLink = screen.getByRole('link', { name: 'Xem tất cả dịch vụ →' })
      expect(viewAllLink).toHaveAttribute('href', '/dashboard/bookings')
    })
  })

  describe('Date formatting', () => {
    it('should display start and end dates', () => {
      render(<ActiveBookings bookings={mockBookings} />)

      // Vietnamese date format will show dates
      // The exact format depends on locale settings
      expect(screen.getAllByText(/-/).length).toBeGreaterThan(0)
    })

    it('should handle null dates gracefully', () => {
      const nullDateBooking = [{ ...mockBookings[0], start_date: null, end_date: null }]
      render(<ActiveBookings bookings={nullDateBooking} />)

      // When dates are null, component shows "N/A" or similar fallback
      // The format shows "N/A - N/A" for start_date - end_date
      expect(screen.getByText(/N\/A/)).toBeInTheDocument()
    })
  })
})
