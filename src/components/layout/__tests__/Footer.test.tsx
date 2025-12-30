/**
 * Footer Component Tests
 * Tests footer content, links, and accessibility
 */

import { render, screen } from '@testing-library/react'

import Footer from '../Footer'

describe('Footer Component', () => {
  describe('Brand Section', () => {
    it('should render brand name', () => {
      render(<Footer />)

      expect(screen.getByText('RoK Services')).toBeInTheDocument()
    })

    it('should have link to homepage', () => {
      render(<Footer />)

      const homeLink = screen.getByRole('link', { name: /RoK Services/i })
      expect(homeLink).toHaveAttribute('href', '/')
    })

    it('should display brand description', () => {
      render(<Footer />)

      expect(screen.getByText(/Rise of Kingdoms/)).toBeInTheDocument()
      expect(screen.getByText(/500\+ khách hàng thành công/)).toBeInTheDocument()
    })
  })

  describe('Contact Information', () => {
    it('should display email address', () => {
      render(<Footer />)

      expect(screen.getByText('support@rokdbot.com')).toBeInTheDocument()
    })

    it('should display phone number', () => {
      render(<Footer />)

      expect(screen.getByText('0987.654.321')).toBeInTheDocument()
    })

    it('should display location', () => {
      render(<Footer />)

      expect(screen.getByText('Hà Nội, Việt Nam')).toBeInTheDocument()
    })
  })

  describe('Statistics', () => {
    it('should display customer count', () => {
      render(<Footer />)

      expect(screen.getByText('500+')).toBeInTheDocument()
      expect(screen.getByText('Khách hàng')).toBeInTheDocument()
    })

    it('should display satisfaction rate', () => {
      render(<Footer />)

      expect(screen.getByText('98%')).toBeInTheDocument()
      expect(screen.getByText('Hài lòng')).toBeInTheDocument()
    })
  })

  describe('Footer Sections', () => {
    it('should render About section', () => {
      render(<Footer />)

      expect(screen.getByText('Về chúng tôi')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Giới thiệu' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Liên hệ' })).toBeInTheDocument()
    })

    it('should render Services section', () => {
      render(<Footer />)

      expect(screen.getByText('Dịch vụ chính')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Tư vấn chiến thuật' })).toBeInTheDocument()
    })

    it('should render Premium section', () => {
      render(<Footer />)

      expect(screen.getByText('Dịch vụ Premium')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'VIP Support 24/7' })).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should have correct href for about link', () => {
      render(<Footer />)

      expect(screen.getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute('href', '/about')
    })

    it('should have correct href for contact link', () => {
      render(<Footer />)

      expect(screen.getByRole('link', { name: 'Liên hệ' })).toHaveAttribute('href', '/contact')
    })

    it('should have correct href for terms link', () => {
      render(<Footer />)

      expect(screen.getByRole('link', { name: 'Điều khoản dịch vụ' })).toHaveAttribute(
        'href',
        '/terms'
      )
    })

    it('should have correct href for privacy link', () => {
      render(<Footer />)

      // Multiple privacy links exist, get the first one
      const privacyLinks = screen.getAllByRole('link', { name: 'Chính sách bảo mật' })
      expect(privacyLinks[0]).toHaveAttribute('href', '/privacy')
    })
  })

  describe('Social Links', () => {
    it('should have Discord link', () => {
      render(<Footer />)

      const discordLink = screen.getByRole('link', { name: /Discord/i })
      expect(discordLink).toHaveAttribute('href', 'https://discord.gg/UPuFYCw4JG')
      expect(discordLink).toHaveAttribute('target', '_blank')
      expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should have Facebook link', () => {
      render(<Footer />)

      const facebookLink = screen.getByRole('link', { name: /Facebook/i })
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/rokservices')
    })

    it('should have YouTube link', () => {
      render(<Footer />)

      const youtubeLink = screen.getByRole('link', { name: /YouTube/i })
      expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com/rokservices')
    })

    it('should have Telegram link', () => {
      render(<Footer />)

      const telegramLink = screen.getByRole('link', { name: /Telegram/i })
      expect(telegramLink).toHaveAttribute('href', 'https://t.me/rokservices')
    })

    it('should have aria-labels for social links', () => {
      render(<Footer />)

      expect(screen.getByLabelText(/Theo dõi chúng tôi trên Discord/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Theo dõi chúng tôi trên Facebook/)).toBeInTheDocument()
    })
  })

  describe('Newsletter Section', () => {
    it('should render newsletter heading', () => {
      render(<Footer />)

      expect(screen.getByText('📧 Nhận tips miễn phí')).toBeInTheDocument()
    })

    it('should have email input with proper accessibility', () => {
      render(<Footer />)

      const emailInput = screen.getByPlaceholderText('Email của bạn')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('aria-label', 'Địa chỉ email để đăng ký nhận tin')
    })

    it('should have submit button with aria-label', () => {
      render(<Footer />)

      expect(screen.getByLabelText('Đăng ký nhận tin tức')).toBeInTheDocument()
    })

    it('should display no-spam message', () => {
      render(<Footer />)

      expect(screen.getByText(/Không spam/)).toBeInTheDocument()
    })
  })

  describe('Features Section', () => {
    it('should display why choose us heading', () => {
      render(<Footer />)

      expect(screen.getByText('⚡ Tại sao chọn chúng tôi?')).toBeInTheDocument()
    })

    it('should list key features', () => {
      render(<Footer />)

      expect(screen.getByText('100% phương pháp an toàn')).toBeInTheDocument()
      expect(screen.getByText('Hỗ trợ 24/7 qua Discord')).toBeInTheDocument()
      expect(screen.getByText('Đội ngũ top 1% players')).toBeInTheDocument()
      expect(screen.getByText('Cam kết hoàn tiền 100%')).toBeInTheDocument()
    })
  })

  describe('Copyright Section', () => {
    it('should display copyright notice', () => {
      render(<Footer />)

      expect(screen.getByText(/© 2025 RoK Services/)).toBeInTheDocument()
    })

    it('should have legal links in bottom bar', () => {
      render(<Footer />)

      const privacyLinks = screen.getAllByRole('link', { name: /Chính sách bảo mật/i })
      expect(privacyLinks.length).toBeGreaterThanOrEqual(1)

      const termsLinks = screen.getAllByRole('link', { name: /Điều khoản/i })
      expect(termsLinks.length).toBeGreaterThanOrEqual(1)
    })
  })
})
