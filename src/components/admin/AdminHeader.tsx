'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Search, User, LogOut, Settings, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminHeader() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Tìm kiếm bookings, customers..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Quick actions */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:block text-sm">Website</span>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <NotificationItem
                    title="New booking received"
                    message="Nguyễn Văn A đã đặt dịch vụ Strategy Pro"
                    time="2 phút trước"
                    type="booking"
                  />
                  <NotificationItem
                    title="Payment completed"
                    message="Thanh toán 900,000 VNĐ qua MoMo"
                    time="5 phút trước"
                    type="payment"
                  />
                  <NotificationItem
                    title="New lead"
                    message="Lead mới từ contact form"
                    time="10 phút trước"
                    type="lead"
                  />
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <Link
                    href="/admin/notifications"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Xem tất cả
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.role}</p>
              </div>
            </button>

            {/* User menu dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  href="/admin/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationItem({
  title,
  message,
  time,
  type
}: {
  title: string
  message: string
  time: string
  type: 'booking' | 'payment' | 'lead'
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-600'
      case 'payment':
        return 'bg-green-100 text-green-600'
      case 'lead':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${getTypeColor(type)}`}></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{message}</p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    </div>
  )
}
