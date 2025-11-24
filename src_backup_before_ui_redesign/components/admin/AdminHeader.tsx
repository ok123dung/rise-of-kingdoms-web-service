'use client'

import { useState } from 'react'

import { Bell, Search, User, LogOut, Settings, Home } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function AdminHeader() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <form action="#" className="relative flex flex-1" method="GET">
          <label className="sr-only" htmlFor="search-field">
            Search
          </label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
          <input
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            id="search-field"
            name="search"
            placeholder="Tìm kiếm bookings, customers..."
            type="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Quick actions */}
          <Link
            className="flex items-center space-x-2 text-gray-500 transition-colors hover:text-gray-700"
            href="/"
          >
            <Home className="h-5 w-5" />
            <span className="hidden text-sm sm:block">Website</span>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="border-b border-gray-200 px-4 py-2">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <NotificationItem
                    message="Nguyễn Văn A đã đặt dịch vụ Strategy Pro"
                    time="2 phút trước"
                    title="New booking received"
                    type="booking"
                  />
                  <NotificationItem
                    message="Thanh toán 900,000 VNĐ qua MoMo"
                    time="5 phút trước"
                    title="Payment completed"
                    type="payment"
                  />
                  <NotificationItem
                    message="Lead mới từ contact form"
                    time="10 phút trước"
                    title="New lead"
                    type="lead"
                  />
                </div>
                <div className="border-t border-gray-200 px-4 py-2">
                  <Link
                    className="text-sm text-primary-600 hover:text-primary-500"
                    href="/admin/notifications"
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
              className="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.role}</p>
              </div>
            </button>

            {/* User menu dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  href="/admin/profile"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  href="/admin/settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <button
                  className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => signOut({ callbackUrl: '/' })}
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
    <div className="cursor-pointer px-4 py-3 hover:bg-gray-50">
      <div className="flex items-start space-x-3">
        <div className={`mt-2 h-2 w-2 rounded-full ${getTypeColor(type)}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{message}</p>
          <p className="mt-1 text-xs text-gray-400">{time}</p>
        </div>
      </div>
    </div>
  )
}
