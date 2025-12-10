'use client'

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
import Link from 'next/link'

const footerSections = {
  about: {
    title: 'Về chúng tôi',
    links: [
      { name: 'Giới thiệu', href: '/about' },
      { name: 'Liên hệ', href: '/contact' },
      { name: 'Điều khoản dịch vụ', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' }
    ]
  },
  services: {
    title: 'Dịch vụ chính',
    links: [
      { name: 'Tư vấn chiến thuật', href: '/services/strategy-consulting' },
      { name: 'Quản lý liên minh', href: '/services/alliance-management' },
      { name: 'Training Commander', href: '/services/commander-training' },
      { name: 'Hỗ trợ KvK', href: '/services/kvk-support' }
    ]
  },
  premium: {
    title: 'Dịch vụ Premium',
    links: [
      { name: 'VIP Support 24/7', href: '/services/vip-support' },
      { name: 'Coaching 1-on-1', href: '/services/personal-coaching' },
      { name: 'Xem tất cả dịch vụ', href: '/services' },
      { name: 'Báo giá tùy chỉnh', href: '/contact?service=custom' }
    ]
  }
}

const socialLinks = [
  {
    name: 'Discord',
    href: 'https://discord.gg/UPuFYCw4JG',
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link className="mb-6 flex items-center space-x-2" href="/">
              <Crown className="h-8 w-8 text-primary-400" />
              <span className="font-heading text-xl font-bold">RoK Services</span>
            </Link>

            <p className="mb-6 text-sm leading-relaxed text-gray-300">
              Nền tảng dịch vụ Rise of Kingdoms hàng đầu Việt Nam với 500+ khách hàng thành công.
              Đội ngũ chuyên gia top 1% server đồng hành cùng bạn chinh phục mọi thử thách.
            </p>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <div className="text-lg font-bold text-amber-400">500+</div>
                <div className="text-xs text-gray-400">Khách hàng</div>
              </div>
              <div className="rounded-lg bg-gray-800 p-3 text-center">
                <div className="text-lg font-bold text-amber-400">98%</div>
                <div className="text-xs text-gray-400">Hài lòng</div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>support@rokdbot.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>0987.654.321</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="mb-6 text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map(link => (
                  <li key={link.name}>
                    <Link
                      className="text-sm text-gray-300 transition-colors duration-200 hover:text-primary-400"
                      href={link.href}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter & Features Section */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Newsletter */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-amber-400">📧 Nhận tips miễn phí</h3>
              <p className="mb-4 text-sm text-gray-300">
                Nhận chiến thuật độc quyền, event guide và ưu đãi VIP qua email hàng tuần
              </p>

              <form className="flex space-x-2">
                <input
                  aria-label="Địa chỉ email để đăng ký nhận tin"
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Email của bạn"
                  type="email"
                />
                <button
                  aria-label="Đăng ký nhận tin tức"
                  className="flex items-center space-x-2 rounded-lg bg-amber-500 px-4 py-3 text-white transition-colors duration-300 hover:bg-amber-600"
                  type="submit"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <p className="mt-2 text-xs text-gray-500">
                🔒 Không spam • Hủy đăng ký bất kỳ lúc nào
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-green-400">
                ⚡ Tại sao chọn chúng tôi?
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-gray-300">100% phương pháp an toàn</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-gray-300">Hỗ trợ 24/7 qua Discord</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="text-gray-300">Đội ngũ top 1% players</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-gray-300">Cam kết hoàn tiền 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container-max px-4 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2025 RoK Services. Tất cả quyền được bảo lưu. | rokdbot.com
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map(social => (
                <Link
                  key={social.name}
                  aria-label={`Theo dõi chúng tôi trên ${social.name}`}
                  className={`text-gray-400 ${social.color} transition-colors duration-200`}
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link
                className="text-gray-400 transition-colors duration-200 hover:text-primary-400"
                href="/privacy"
              >
                Chính sách bảo mật
              </Link>
              <Link
                className="text-gray-400 transition-colors duration-200 hover:text-primary-400"
                href="/terms"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
