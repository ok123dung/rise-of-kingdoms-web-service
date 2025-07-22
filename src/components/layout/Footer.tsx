'use client'

import Link from 'next/link'
import { 
  Crown, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Youtube, 
  MessageCircle,
  Send,
  ArrowRight 
} from 'lucide-react'

const footerSections = {
  about: {
    title: 'Về chúng tôi',
    links: [
      { name: 'Giới thiệu', href: '/about' },
      { name: 'Đội ngũ chuyên gia', href: '/team' },
      { name: 'Thành tích', href: '/achievements' },
      { name: 'Tuyển dụng', href: '/careers' },
    ]
  },
  services: {
    title: 'Dịch vụ',
    links: [
      { name: 'Tư vấn chiến thuật', href: '/services/strategy' },
      { name: 'Quản lý liên minh', href: '/services/alliance' },
      { name: 'Training Commander', href: '/services/commander' },
      { name: 'Hỗ trợ KvK', href: '/services/kvk' },
    ]
  },
  resources: {
    title: 'Tài nguyên',
    links: [
      { name: 'Hướng dẫn miễn phí', href: '/guides' },
      { name: 'Blog chiến thuật', href: '/blog' },
      { name: 'Video tutorials', href: '/videos' },
      { name: 'FAQ', href: '/faq' },
    ]
  }
}

const socialLinks = [
  {
    name: 'Discord',
    href: 'https://discord.gg/rokservices',
    icon: MessageCircle,
    color: 'hover:text-indigo-500'
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/rokservices',
    icon: Facebook,
    color: 'hover:text-blue-500'
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/rokservices',
    icon: Youtube,
    color: 'hover:text-red-500'
  },
  {
    name: 'Telegram',
    href: 'https://t.me/rokservices',
    icon: Send,
    color: 'hover:text-blue-400'
  }
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-max px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Crown className="h-8 w-8 text-primary-400" />
              <span className="font-heading font-bold text-xl">
                RoK Services
              </span>
            </Link>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Đơn vị cung cấp dịch vụ Rise of Kingdoms chuyên nghiệp hàng đầu Việt Nam. 
              Nâng tầm trải nghiệm chơi game của bạn cùng đội ngũ chuyên gia.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>contact@rokservices.vn</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-lg mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="font-semibold text-lg mb-4">Đăng ký nhận tin tức</h3>
            <p className="text-gray-300 text-sm mb-4">
              Nhận thông tin về chiến thuật mới, event và ưu đãi đặc biệt
            </p>
            
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                aria-label="Địa chỉ email để đăng ký nhận tin"
              />
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2 px-4 py-2"
                aria-label="Đăng ký nhận tin tức"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-max px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2024 RoK Services. Tất cả quyền được bảo lưu.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`text-gray-400 ${social.color} transition-colors duration-200`}
                  aria-label={`Theo dõi chúng tôi trên ${social.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
