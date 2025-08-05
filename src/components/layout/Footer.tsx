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
      { name: 'Liên hệ', href: '/contact' },
      { name: 'Điều khoản dịch vụ', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
    ]
  },
  services: {
    title: 'Dịch vụ chính',
    links: [
      { name: 'Tư vấn chiến thuật', href: '/services/strategy-consulting' },
      { name: 'Quản lý liên minh', href: '/services/alliance-management' },
      { name: 'Training Commander', href: '/services/commander-training' },
      { name: 'Hỗ trợ KvK', href: '/services/kvk-support' },
    ]
  },
  premium: {
    title: 'Dịch vụ Premium',
    links: [
      { name: 'VIP Support 24/7', href: '/services/vip-support' },
      { name: 'Coaching 1-on-1', href: '/services/personal-coaching' },
      { name: 'Xem tất cả dịch vụ', href: '/services' },
      { name: 'Báo giá tùy chỉnh', href: '/contact?service=custom' },
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
            
            <p className="text-gray-300 mb-6 leading-relaxed text-sm">
              Nền tảng dịch vụ Rise of Kingdoms hàng đầu Việt Nam với 500+ khách hàng thành công. 
              Đội ngũ chuyên gia top 1% server đồng hành cùng bạn chinh phục mọi thử thách.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-amber-400 font-bold text-lg">500+</div>
                <div className="text-gray-400 text-xs">Khách hàng</div>
              </div>
              <div className="text-center bg-gray-800 rounded-lg p-3">
                <div className="text-amber-400 font-bold text-lg">98%</div>
                <div className="text-gray-400 text-xs">Hài lòng</div>
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

        {/* Newsletter & Features Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Newsletter */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-amber-400">📧 Nhận tips miễn phí</h3>
              <p className="text-gray-300 text-sm mb-4">
                Nhận chiến thuật độc quyền, event guide và ưu đãi VIP qua email hàng tuần
              </p>
              
              <form className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                  aria-label="Địa chỉ email để đăng ký nhận tin"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-lg transition-colors duration-300 flex items-center space-x-2"
                  aria-label="Đăng ký nhận tin tức"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              
              <p className="text-gray-500 text-xs mt-2">
                🔒 Không spam • Hủy đăng ký bất kỳ lúc nào
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-green-400">⚡ Tại sao chọn chúng tôi?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">100% phương pháp an toàn</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Hỗ trợ 24/7 qua Discord</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300">Đội ngũ top 1% players</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
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
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © 2025 RoK Services. Tất cả quyền được bảo lưu. | rokdbot.com
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
