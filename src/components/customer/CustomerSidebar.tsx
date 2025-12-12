'use client'

import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  User,
  RefreshCw,
  HelpCircle,
  Home,
  ShieldCheck,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'

import BaseSidebar, { type SidebarConfig } from '@/components/shared/BaseSidebar'

const customerConfig: SidebarConfig = {
  title: 'RoK Services',
  homeHref: '/dashboard',
  navigation: [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dịch vụ của tôi', href: '/dashboard/bookings', icon: ShoppingBag },
    { name: 'Lịch sử thanh toán', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Tin nhắn', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Gia hạn dịch vụ', href: '/dashboard/renewals', icon: RefreshCw },
    { name: 'Hồ sơ cá nhân', href: '/dashboard/profile', icon: User },
    { name: 'Tệp tin', href: '/dashboard/files', icon: FolderOpen },
    { name: 'Bảo mật', href: '/dashboard/security', icon: ShieldCheck },
    { name: 'Hỗ trợ', href: '/dashboard/support', icon: HelpCircle }
  ],
  quickLinks: [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Đặt dịch vụ mới', href: '/services', icon: ShoppingBag }
  ],
  footerContent: (
    <div className="rounded-lg bg-primary-50 p-4">
      <h3 className="text-sm font-medium text-primary-900">Cần hỗ trợ?</h3>
      <p className="mt-1 text-xs text-primary-700">Team hỗ trợ 24/7 qua Discord</p>
      <Link
        className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
        href={process.env.NEXT_PUBLIC_DISCORD_INVITE ?? '#'}
      >
        Tham gia Discord
      </Link>
    </div>
  )
}

export default function CustomerSidebar() {
  return <BaseSidebar config={customerConfig} />
}
