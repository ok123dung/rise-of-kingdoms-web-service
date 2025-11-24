import { render, screen } from '@testing-library/react'
import Services from '@/components/sections/Services'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Services Component', () => {
  it('renders services section with title', () => {
    render(<Services />)

    // Check if the main title is rendered
    expect(screen.getByText('Dịch vụ chuyên nghiệp')).toBeInTheDocument()
    expect(screen.getByText('Nâng cao trải nghiệm Rise of Kingdoms của bạn')).toBeInTheDocument()
  })

  it('renders all 8 services', () => {
    render(<Services />)

    // Check for specific service titles
    const serviceNames = [
      'Tư vấn chiến thuật',
      'Farm Gem tự động',
      'KvK Support',
      'Quản lý liên minh',
      'Tối ưu tài nguyên',
      'Coaching PvP',
      'Chiến lược sự kiện',
      'Phát triển tài khoản'
    ]

    serviceNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument()
    })
  })

  it('displays pricing for all services', () => {
    render(<Services />)

    // Check that pricing is displayed
    expect(screen.getAllByText(/VNĐ/)).toHaveLength(8)
  })

  it('shows featured badge for featured services', () => {
    render(<Services />)

    // Check for "Phổ biến" badge (popular services)
    const featuredBadges = screen.getAllByText('Phổ biến')
    expect(featuredBadges.length).toBeGreaterThan(0)
  })

  it('renders service action buttons', () => {
    render(<Services />)

    // Check for "Tìm hiểu thêm" buttons
    const buttons = screen.getAllByText('Tìm hiểu thêm')
    expect(buttons).toHaveLength(8)
  })

  it('renders customer testimonials', () => {
    render(<Services />)

    // Check for testimonials section
    expect(screen.getByText('Phản hồi từ khách hàng')).toBeInTheDocument()
    expect(screen.getByText('Những gì khách hàng nói về dịch vụ của chúng tôi')).toBeInTheDocument()
  })

  it('displays stats counters', () => {
    render(<Services />)

    // Check for stats section
    expect(screen.getByText('200+')).toBeInTheDocument() // Khách hàng hài lòng
    expect(screen.getByText('50+')).toBeInTheDocument() // Chuyên gia
    expect(screen.getByText('98%')).toBeInTheDocument() // Tỷ lệ thành công
  })

  it('has proper responsive classes', () => {
    const { container } = render(<Services />)

    // Check for responsive grid classes
    const gridElement = container.querySelector('.grid')
    expect(gridElement).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
  })

  it('renders service links correctly', () => {
    render(<Services />)

    // Check that links point to correct service pages
    const strategyLink = screen.getByRole('link', { name: /Tư vấn chiến thuật/ })
    expect(strategyLink).toHaveAttribute('href', '/services/strategy')
  })

  it('displays service descriptions', () => {
    render(<Services />)

    // Check for service descriptions
    expect(screen.getByText(/Phân tích và tối ưu chiến thuật/)).toBeInTheDocument()
    expect(screen.getByText(/Tự động hóa quá trình farming/)).toBeInTheDocument()
  })
})
