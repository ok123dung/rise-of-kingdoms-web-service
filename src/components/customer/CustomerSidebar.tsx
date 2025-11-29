'use client'

import { useState } from 'react'

import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  User,
  RefreshCw,
  HelpCircle,
  X,
  Menu,
  Home,
  ShieldCheck,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dịch vụ của tôi', href: '/dashboard/bookings', icon: ShoppingBag },
  { name: 'Lịch sử thanh toán', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Tin nhắn', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Gia hạn dịch vụ', href: '/dashboard/renewals', icon: RefreshCw },
  { name: 'Hồ sơ cá nhân', href: '/dashboard/profile', icon: User },
  { name: 'Tệp tin', href: '/dashboard/files', icon: FolderOpen },
  { name: 'Bảo mật', href: '/dashboard/security', icon: ShieldCheck },
  { name: 'Hỗ trợ', href: '/dashboard/support', icon: HelpCircle }
]

export default function CustomerSidebar() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div className="w-14 flex-shrink-0" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 text-gray-400 shadow-lg"
          type="button"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  )

  function SidebarContent() {
    return (
      <>
        <div className="flex h-16 shrink-0 items-center">
          <Link className="flex items-center space-x-3" href="/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">RK</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RoK Services</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7" role="list">
            <li>
              <ul className="-mx-2 space-y-1" role="list">
                {navigation.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors
                          ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                          }`}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {/* Quick links */}
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">Liên kết nhanh</div>
              <ul className="-mx-2 mt-2 space-y-1" role="list">
                <li>
                  <Link
                    className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    href="/"
                  >
                    <Home className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" />
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                    href="/services"
                  >
                    <ShoppingBag className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" />
                    Đặt dịch vụ mới
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Support section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="rounded-lg bg-primary-50 p-4">
            <h3 className="text-sm font-medium text-primary-900">Cần hỗ trợ?</h3>
            <p className="mt-1 text-xs text-primary-700">Team hỗ trợ 24/7 qua Discord</p>
            <Link
              className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE || '#'}
            >
              Tham gia Discord
            </Link>
          </div>
        </div>
      </>
    )
  }
}
