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
    expect(screen.getByText(/Dịch vụ premium cho/)).toBeInTheDocument()
  })

  it('renders services from SERVICES_CONFIG', () => {
    render(<Services />)

    // Check for actual service titles from config
    expect(screen.getByText('Auto Gem & Farm RoK')).toBeInTheDocument()
    expect(screen.getByText('Spam & Kéo Man Rợ')).toBeInTheDocument()
  })

  it('displays pricing for services', () => {
    render(<Services />)

    // Check that pricing is displayed
    expect(screen.getByText(/Từ 150.000 VNĐ/)).toBeInTheDocument()
    expect(screen.getByText(/900.000 VNĐ\/tháng/)).toBeInTheDocument()
  })

  it('shows Premium badge for featured services', () => {
    render(<Services />)

    // Check for "Premium" badge on featured services
    const featuredBadges = screen.getAllByText('Premium')
    expect(featuredBadges.length).toBeGreaterThan(0)
  })

  it('renders service action buttons', () => {
    render(<Services />)

    // Check for "Xem chi tiết" buttons (actual button text in component)
    const buttons = screen.getAllByText(/Xem chi tiết/)
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('has proper responsive classes', () => {
    const { container } = render(<Services />)

    // Check for responsive grid classes (actual: md:grid-cols-2)
    const gridElement = container.querySelector('.grid')
    expect(gridElement).toHaveClass('grid-cols-1', 'md:grid-cols-2')
  })

  it('renders service links correctly', () => {
    render(<Services />)

    // Check that links point to services page
    const serviceLinks = screen.getAllByRole('link', { name: /Xem chi tiết/ })
    serviceLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/services')
    })
  })

  it('displays service descriptions', () => {
    render(<Services />)

    // Check for actual service descriptions
    expect(screen.getByText(/Bot tự động farm tài nguyên/)).toBeInTheDocument()
    expect(screen.getByText(/Dịch vụ spam man rợ chuyên nghiệp/)).toBeInTheDocument()
  })

  it('renders service cards with data-testid', () => {
    render(<Services />)

    const serviceCards = screen.getAllByTestId('service-card')
    expect(serviceCards.length).toBe(2)
  })

  it('displays CTA section', () => {
    render(<Services />)

    // Check for CTA section
    expect(screen.getByText('Cần tư vấn cá nhân hóa?')).toBeInTheDocument()
    expect(screen.getByText('Tư vấn miễn phí')).toBeInTheDocument()
  })

  it('shows tier information for services with tiers', () => {
    render(<Services />)

    // Check that tier count is shown
    expect(screen.getByText(/4 gói dịch vụ/)).toBeInTheDocument()
    expect(screen.getByText(/1 gói dịch vụ/)).toBeInTheDocument()
  })

  it('displays requirement notice when applicable', () => {
    render(<Services />)

    // Check for requirement notice
    expect(screen.getByText('Account trước Pre-KvK 1')).toBeInTheDocument()
  })
})
