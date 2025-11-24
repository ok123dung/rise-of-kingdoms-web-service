'use client'

import { Crown, Mail, Phone, MapPin, Facebook, Youtube, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
    <footer className="bg-background-dark border-t border-white/10 text-white">
      <div className="container-max px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="RoK Services"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-heading text-xl font-bold">RoK Services</span>
            </Link>
            <p className="mb-6 max-w-sm text-sm text-gray-400">
              Nền tảng dịch vụ Rise of Kingdoms hàng đầu Việt Nam. Chúng tôi cung cấp các giải pháp tối ưu hóa trải nghiệm chơi game của bạn.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 transition-colors ${social.color}`}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Dịch vụ
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/services" className="hover:text-primary">Tư vấn chiến thuật</Link></li>
              <li><Link href="/services" className="hover:text-primary">Quản lý liên minh</Link></li>
              <li><Link href="/services" className="hover:text-primary">Huấn luyện Commander</Link></li>
              <li><Link href="/services" className="hover:text-primary">Hỗ trợ KVK</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Liên hệ
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@rokservices.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0987.654.321</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>© 2025 RoK Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
