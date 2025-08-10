'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format, addDays, isAfter } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ArrowPathIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Renewal {
  id: string
  booking: {
    id: string
    bookingNumber: string
    serviceTier: {
      name: string
      service: {
        name: string
        icon: string
      }
    }
    startDate: string
    endDate: string
  }
  daysRemaining: number
  status: 'active' | 'expiring' | 'expired'
}

export default function RenewalsPage() {
  const { data: session } = useSession()
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchRenewals()
    }
  }, [session])

  const fetchRenewals = async () => {
    try {
      // Simulate API call - in real app, fetch from backend
      const mockRenewals: Renewal[] = [
        {
          id: '1',
          booking: {
            id: '1',
            bookingNumber: 'RK241201001',
            serviceTier: {
              name: 'Gói Premium',
              service: {
                name: 'Nâng cấp VIP',
                icon: '👑'
              }
            },
            startDate: '2024-11-01T00:00:00Z',
            endDate: '2024-12-15T23:59:59Z'
          },
          daysRemaining: 5,
          status: 'expiring'
        }
      ]
      setRenewals(mockRenewals)
    } catch (error) {
      console.error('Error fetching renewals:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động'
      case 'expiring':
        return 'Sắp hết hạn'
      case 'expired':
        return 'Đã hết hạn'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rok-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gia hạn dịch vụ</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý và gia hạn các dịch vụ đang sử dụng
        </p>
      </div>

      {renewals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có dịch vụ cần gia hạn</h3>
          <p className="mt-1 text-sm text-gray-500">
            Các dịch vụ cần gia hạn sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {renewals.filter(r => r.status === 'expiring').length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Bạn có {renewals.filter(r => r.status === 'expiring').length} dịch vụ sắp hết hạn. 
                    Vui lòng gia hạn để tránh gián đoạn dịch vụ.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {renewals.map((renewal) => (
                <li key={renewal.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-rok-gold/10 flex items-center justify-center">
                          <span className="text-2xl">{renewal.booking.serviceTier.service.icon}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {renewal.booking.serviceTier.service.name} - {renewal.booking.serviceTier.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Mã đơn: {renewal.booking.bookingNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            Hết hạn: {format(new Date(renewal.booking.endDate), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {renewal.daysRemaining > 0 
                              ? `Còn ${renewal.daysRemaining} ngày`
                              : 'Đã hết hạn'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(renewal.status)}`}>
                            {getStatusText(renewal.status)}
                          </span>
                          <Link
                            href={`/services/${renewal.booking.serviceTier.service.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-rok-gold hover:bg-rok-gold-dark"
                          >
                            <ArrowPathIcon className="h-3 w-3 mr-1" />
                            Gia hạn ngay
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          Thời gian sử dụng: {format(new Date(renewal.booking.startDate), 'dd/MM/yyyy', { locale: vi })} - {format(new Date(renewal.booking.endDate), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}