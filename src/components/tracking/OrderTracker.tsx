'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  CreditCard,
  Loader2,
  Package,
  Star,
  AlertCircle
} from 'lucide-react'

import { useOrderTracking } from '@/hooks/useOrderTracking'

interface OrderTrackerProps {
  bookingId: string
  bookingNumber: string
  wsToken: string
  initialStatus: string
  initialProgress?: number
}

interface TrackingStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: 'completed' | 'current' | 'pending'
  timestamp?: string
}

export function OrderTracker({
  bookingId,
  bookingNumber,
  wsToken,
  initialStatus,
  initialProgress = 0
}: OrderTrackerProps) {
  const [status, setStatus] = useState(initialStatus)
  const [progress, setProgress] = useState(initialProgress)
  const [lastEvent, setLastEvent] = useState<string | null>(null)

  const { isConnected, events, lastStatusUpdate } = useOrderTracking({
    wsToken,
    bookingId,
    onBookingStatus: (event) => {
      setStatus(event.status)
      if (event.completion_percentage) {
        setProgress(event.completion_percentage)
      }
    },
    onOrderTracking: (event) => {
      setLastEvent(event.message)
      if (event.progress !== undefined) {
        setProgress(event.progress)
      }
    }
  })

  useEffect(() => {
    if (lastStatusUpdate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync state from WebSocket updates
      setStatus(lastStatusUpdate.status)
      if (lastStatusUpdate.completion_percentage) {
        setProgress(lastStatusUpdate.completion_percentage)
      }
    }
  }, [lastStatusUpdate])

  const getSteps = (): TrackingStep[] => {
    const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed']
    const currentIndex = statusOrder.indexOf(status)

    return [
      {
        id: 'pending',
        label: 'Đặt hàng',
        description: 'Đơn hàng đã được tạo',
        icon: <CreditCard className="h-5 w-5" />,
        status: currentIndex >= 0 ? 'completed' : 'pending'
      },
      {
        id: 'confirmed',
        label: 'Xác nhận thanh toán',
        description: 'Thanh toán đã được xác nhận',
        icon: <CheckCircle className="h-5 w-5" />,
        status: currentIndex >= 1 ? 'completed' : currentIndex === 0 ? 'current' : 'pending'
      },
      {
        id: 'in_progress',
        label: 'Đang thực hiện',
        description: `Tiến độ: ${progress}%`,
        icon: <Package className="h-5 w-5" />,
        status: currentIndex >= 2 ? (currentIndex === 2 ? 'current' : 'completed') : 'pending'
      },
      {
        id: 'completed',
        label: 'Hoàn thành',
        description: 'Dịch vụ đã hoàn tất',
        icon: <Star className="h-5 w-5" />,
        status: currentIndex >= 3 ? 'completed' : 'pending'
      }
    ]
  }

  const steps = getSteps()

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Theo dõi đơn hàng</h3>
          <p className="text-sm text-gray-600">Mã đơn: {bookingNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Đang theo dõi' : 'Đang kết nối...'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Tiến độ tổng thể</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4">
            {/* Icon & Line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  step.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : step.status === 'current'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.status === 'current' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  step.icon
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mt-2 h-8 w-0.5 ${
                    step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p
                className={`font-medium ${
                  step.status === 'completed'
                    ? 'text-green-700'
                    : step.status === 'current'
                      ? 'text-blue-700'
                      : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
              <p className="text-sm text-gray-600">{step.description}</p>
              {step.timestamp && (
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(step.timestamp).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Latest Event */}
      {lastEvent && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Cập nhật mới nhất</p>
              <p className="text-sm text-blue-700">{lastEvent}</p>
            </div>
          </div>
        </div>
      )}

      {/* Event History */}
      {events.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="mb-3 text-sm font-medium text-gray-700">Lịch sử cập nhật</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {events
              .slice()
              .reverse()
              .map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="text-sm text-gray-700">{event.message}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
