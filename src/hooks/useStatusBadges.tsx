import React, { useCallback } from 'react'

import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Loader
} from 'lucide-react'

interface BadgeConfig {
  icon: React.ReactNode
  className: string
  label: string
}

export function useStatusBadges() {
  const getBookingStatusBadge = useCallback((status: string): BadgeConfig => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-3 w-3" />,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Chờ xử lý'
        }
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Đã xác nhận'
        }
      case 'in_progress':
        return {
          icon: <Loader className="h-3 w-3" />,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Đang thực hiện'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          className: 'bg-green-100 text-green-800 border-green-200',
          label: 'Hoàn thành'
        }
      case 'cancelled':
        return {
          icon: <XCircle className="h-3 w-3" />,
          className: 'bg-red-100 text-red-800 border-red-200',
          label: 'Đã hủy'
        }
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Không xác định'
        }
    }
  }, [])

  const getPaymentStatusBadge = useCallback((status: string): BadgeConfig => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-3 w-3" />,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Chờ thanh toán'
        }
      case 'processing':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Đang xử lý'
        }
      case 'completed':
        return {
          icon: <CreditCard className="h-3 w-3" />,
          className: 'bg-green-100 text-green-800 border-green-200',
          label: 'Đã thanh toán'
        }
      case 'failed':
        return {
          icon: <XCircle className="h-3 w-3" />,
          className: 'bg-red-100 text-red-800 border-red-200',
          label: 'Thất bại'
        }
      case 'refunded':
        return {
          icon: <RefreshCw className="h-3 w-3" />,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'Đã hoàn tiền'
        }
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Không xác định'
        }
    }
  }, [])

  const renderBadge = useCallback((config: BadgeConfig) => {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    )
  }, [])

  return {
    getBookingStatusBadge,
    getPaymentStatusBadge,
    renderBadge
  }
}
