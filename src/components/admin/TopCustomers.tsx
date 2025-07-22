'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Crown, User, TrendingUp } from 'lucide-react'
import Link from 'next/link'

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

export default function TopCustomers() {
  const [customers, setCustomers] = useState<TopCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopCustomers()
  }, [])

  const fetchTopCustomers = async () => {
    try {
      setLoading(true)
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
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString))
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'vip':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'premium':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getTierBadge = (tier: string) => {
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

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${styles[tier as keyof typeof styles]}`}>
        {getTierIcon(tier)}
        {labels[tier as keyof typeof labels]}
      </span>
    )
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
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
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchTopCustomers}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <p className="text-sm text-gray-600">
          Khách hàng có doanh thu cao nhất
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y">
          {customers.map((customer, index) => (
            <Link 
              key={customer.id}
              href={`/admin/customers/${customer.id}`}
              className="block hover:bg-gray-50 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Ranking number */}
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {customer.avatar ? (
                        <img 
                          src={customer.avatar} 
                          alt={customer.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(customer.name)
                      )}
                    </div>

                    {/* Customer info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {customer.name}
                        </p>
                        {getTierBadge(customer.tier)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {customer.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Lần cuối: {formatDate(customer.lastBooking)}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right ml-4">
                    <div className="font-bold text-green-600">
                      {formatVND(customer.totalSpent)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {customer.bookingsCount} đơn hàng
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all customers link */}
        <div className="p-4 border-t bg-gray-50">
          <Link 
            href="/admin/customers"
            className="block text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Xem tất cả khách hàng →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}