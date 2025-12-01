'use client'
import { useState, useEffect } from 'react'

import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { RealtimeNotifications } from '@/components/RealtimeNotifications'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface CustomerData {
  id: string
  name: string
  email: string
  avatar?: string
  tier: 'vip' | 'premium' | 'regular'
  totalBookings: number
  totalSpent: number
  notificationCount: number
}
interface CustomerHeaderProps {
  showBreadcrumb?: boolean
  breadcrumbItems?: Array<{ label: string; href?: string }>
}
export default function CustomerHeader({
  showBreadcrumb = true,
  breadcrumbItems = []
}: CustomerHeaderProps) {
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  useEffect(() => {
    void fetchCustomerData()
  }, [])
  const fetchCustomerData = () => {
    try {
      setLoading(true)
      // Simulate API call - replace with real endpoint
      // await new Promise(resolve => setTimeout(resolve, 500))
      // Mock customer data
      const mockCustomer: CustomerData = {
        id: '1',
        name: 'Nguyễn Văn Minh',
        email: 'minh@email.com',
        tier: 'vip',
        totalBookings: 12,
        totalSpent: 15750000,
        notificationCount: 3
      }
      setCustomer(mockCustomer)
    } catch (err) {
      console.error('Error fetching customer data:', err)
    } finally {
      setLoading(false)
    }
  }
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'premium':
        return 'bg-gradient-to-r from-purple-400 to-purple-600'
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600'
    }
  }
  const getTierLabel = (tier: string) => {
    const labels = {
      vip: 'VIP',
      premium: 'Premium',
      regular: 'Thường'
    }
    return labels[tier as keyof typeof labels]
  }
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }
  const handleLogout = () => {
    // Implement logout logic
    router.push('/auth/signin')
  }
  if (loading) {
    return (
      <header className="border-b border-gray-200 bg-white">
        <div className="container-max py-4">
          <LoadingSpinner size="sm" />
        </div>
      </header>
    )
  }
  if (!customer) {
    return (
      <header className="border-b border-gray-200 bg-white">
        <div className="container-max py-4">
          <div className="text-red-600">Không thể tải thông tin khách hàng</div>
        </div>
      </header>
    )
  }
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="container-max">
        {/* Breadcrumb */}
        {showBreadcrumb && breadcrumbItems.length > 0 && (
          <div className="border-b border-gray-100 py-2">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link className="transition-colors hover:text-blue-600" href="/dashboard">
                Dashboard
              </Link>
              {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span>/</span>
                  {item.href ? (
                    <Link className="transition-colors hover:text-blue-600" href={item.href}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Left side - Customer info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={`h-12 w-12 rounded-full ${getTierColor(customer.tier)} flex items-center justify-center text-lg font-bold text-white shadow-lg`}
            >
              {customer.avatar ? (
                <img
                  alt={customer.name}
                  className="h-full w-full rounded-full object-cover"
                  src={customer.avatar}
                />
              ) : (
                getInitials(customer.name)
              )}
            </div>
            {/* Customer details */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${getTierColor(customer.tier)}`}
                >
                  {getTierLabel(customer.tier)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                <span>{customer.totalBookings} dịch vụ</span>
                <span>•</span>
                <span className="font-medium text-green-600">{formatVND(customer.totalSpent)}</span>
              </div>
            </div>
          </div>
          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {/* Realtime Notifications */}
            <RealtimeNotifications />
            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Settings className="h-5 w-5" />
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <Link
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      href="/dashboard/profile"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Cài đặt
                    </Link>
                    <hr className="my-2" />
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
