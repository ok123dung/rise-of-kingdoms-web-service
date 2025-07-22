'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Home
} from 'lucide-react'

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Dịch vụ của tôi', href: '/dashboard/bookings', icon: ShoppingBag },
  { name: 'Lịch sử thanh toán', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Tin nhắn', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Gia hạn dịch vụ', href: '/dashboard/renewals', icon: RefreshCw },
  { name: 'Hồ sơ cá nhân', href: '/dashboard/profile', icon: User },
  { name: 'Hỗ trợ', href: '/dashboard/support', icon: HelpCircle },
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
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div className="w-14 flex-shrink-0"></div>
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
          type="button"
          className="fixed top-4 left-4 z-40 rounded-md bg-white p-2 text-gray-400 shadow-lg"
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
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RK</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RoK Services</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                          ${isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
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
              <div className="text-xs font-semibold leading-6 text-gray-400">
                Liên kết nhanh
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                <li>
                  <Link
                    href="/"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  >
                    <Home className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" />
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-gray-700 hover:text-primary-600 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
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
          <div className="bg-primary-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-900">Cần hỗ trợ?</h3>
            <p className="text-xs text-primary-700 mt-1">
              Team hỗ trợ 24/7 qua Discord
            </p>
            <Link
              href={process.env.NEXT_PUBLIC_DISCORD_INVITE || '#'}
              className="mt-2 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-500"
            >
              Tham gia Discord
            </Link>
          </div>
        </div>
      </>
    )
  }
}
