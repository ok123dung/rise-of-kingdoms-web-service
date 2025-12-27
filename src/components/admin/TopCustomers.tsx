'use client'

import React, { useState, useEffect, memo, useMemo, useCallback } from 'react'

import { Crown, User, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface TopCustomer {
  id: string
  name: string
  email: string
  avatar?: string
  totalSpent: number
  bookingsCount: number
  lastBooking: string
  tier: 'vip' | 'premium' | 'regular'
}

// Memoized customer item component
const CustomerItem = memo(
  ({
    customer,
    index,
    formatVND,
    formatDate,
    getTierBadge,
    getInitials
  }: {
    customer: TopCustomer
    index: number
    formatVND: (amount: number) => string
    formatDate: (dateString: string) => string
    getTierBadge: (tier: string) => React.ReactNode
    getInitials: (name: string) => string
  }) => {
    const rankingClass = useMemo(() => {
      if (index === 0) return 'bg-yellow-100 text-yellow-800'
      if (index === 1) return 'bg-gray-100 text-gray-800'
      if (index === 2) return 'bg-orange-100 text-orange-800'
      return 'bg-blue-100 text-blue-800'
    }, [index])

    return (
      <Link
        className="block transition-colors hover:bg-gray-50"
        href={`/admin/customers/${customer.id}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Ranking number */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${rankingClass}`}
              >
                {index + 1}
              </div>

              {/* Avatar */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                {customer.avatar ? (
                  <Image
                    fill
                    alt={customer.name}
                    className="rounded-full object-cover"
                    sizes="40px"
                    src={customer.avatar}
                  />
                ) : (
                  getInitials(customer.name)
                )}
              </div>

              {/* Customer info */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="truncate font-semibold text-gray-900">{customer.name}</p>
                  {getTierBadge(customer.tier)}
                </div>
                <p className="truncate text-sm text-gray-600">{customer.email}</p>
                <p className="text-xs text-gray-500">
                  Lần cuối: {formatDate(customer.lastBooking)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="ml-4 text-right">
              <div className="font-bold text-green-600">{formatVND(customer.totalSpent)}</div>
              <div className="text-xs text-gray-600">{customer.bookingsCount} đơn hàng</div>
            </div>
          </div>
        </div>
      </Link>
    )
  }
)

CustomerItem.displayName = 'CustomerItem'

// Memoized tier badge component
const TierBadge = memo(({ tier }: { tier: string }) => {
  const { icon, style, label } = useMemo(() => {
    const styles = {
      vip: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      premium: 'bg-purple-100 text-purple-800 border-purple-200',
      regular: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const labels = {
      vip: 'VIP',
      premium: 'Premium',
      regular: 'Thường'
    }

    let tierIcon: React.ReactNode
    switch (tier) {
      case 'vip':
        tierIcon = <Crown className="h-4 w-4 text-yellow-500" />
        break
      case 'premium':
        tierIcon = <TrendingUp className="h-4 w-4 text-purple-500" />
        break
      default:
        tierIcon = <User className="h-4 w-4 text-gray-500" />
    }

    return {
      icon: tierIcon,
      style: styles[tier as keyof typeof styles] || styles.regular,
      label: labels[tier as keyof typeof labels] || labels.regular
    }
  }, [tier])

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${style}`}
    >
      {icon}
      {label}
    </span>
  )
})

TierBadge.displayName = 'TierBadge'

export default function TopCustomers() {
  const [customers, setCustomers] = useState<TopCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized formatters
  const formatVND = useCallback((amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString))
  }, [])

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }, [])

  const getTierBadge = useCallback((tier: string) => {
    return <TierBadge tier={tier} />
  }, [])

  const fetchTopCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Simulate API call - replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock data for top customers
      const mockCustomers: TopCustomer[] = [
        {
          id: '1',
          name: 'Nguyễn Văn Minh',
          email: 'minh@email.com',
          totalSpent: 15750000,
          bookingsCount: 12,
          lastBooking: '2024-07-20',
          tier: 'vip'
        },
        {
          id: '2',
          name: 'Trần Thị Hương',
          email: 'huong@email.com',
          totalSpent: 8900000,
          bookingsCount: 8,
          lastBooking: '2024-07-19',
          tier: 'premium'
        },
        {
          id: '3',
          name: 'Lê Quang Đức',
          email: 'duc@email.com',
          totalSpent: 6750000,
          bookingsCount: 6,
          lastBooking: '2024-07-18',
          tier: 'premium'
        },
        {
          id: '4',
          name: 'Phạm Thị Mai',
          email: 'mai@email.com',
          totalSpent: 4200000,
          bookingsCount: 4,
          lastBooking: '2024-07-17',
          tier: 'regular'
        },
        {
          id: '5',
          name: 'Hoàng Văn Tuấn',
          email: 'tuan@email.com',
          totalSpent: 3850000,
          bookingsCount: 3,
          lastBooking: '2024-07-16',
          tier: 'regular'
        }
      ]

      setCustomers(mockCustomers)
    } catch (err) {
      setError('Không thể tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTopCustomers()
  }, [fetchTopCustomers])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <LoadingSpinner text="Đang tải..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => void fetchTopCustomers()}
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Top khách hàng
        </CardTitle>
        <p className="text-sm text-gray-600">Khách hàng có doanh thu cao nhất</p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y">
          {customers.map((customer, index) => (
            <CustomerItem
              key={customer.id}
              customer={customer}
              formatDate={formatDate}
              formatVND={formatVND}
              getInitials={getInitials}
              getTierBadge={getTierBadge}
              index={index}
            />
          ))}
        </div>

        {/* View all customers link */}
        <div className="border-t bg-gray-50 p-4">
          <Link
            className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
            href="/admin/customers"
          >
            Xem tất cả khách hàng →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
