'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Play, Loader2 } from 'lucide-react'
import { Booking } from '@prisma/client'

interface BookingActionsProps {
  booking: Pick<Booking, 'id' | 'status'>
}

export default function BookingActions({ booking }: BookingActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const updateStatus = async (status: string) => {
    if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang ${status}?`)) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Có lỗi xảy ra')
      }
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
  }

  return (
    <div className="flex space-x-2">
      {booking.status === 'pending' && (
        <>
          <button
            onClick={() => void updateStatus('confirmed')}
            className="flex items-center space-x-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            <span>Xác nhận</span>
          </button>
          <button
            onClick={() => void updateStatus('cancelled')}
            className="flex items-center space-x-1 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
          >
            <X className="h-4 w-4" />
            <span>Hủy</span>
          </button>
        </>
      )}

      {booking.status === 'confirmed' && (
        <button
          onClick={() => void updateStatus('in_progress')}
          className="flex items-center space-x-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          <Play className="h-4 w-4" />
          <span>Bắt đầu thực hiện</span>
        </button>
      )}

      {booking.status === 'in_progress' && (
        <button
          onClick={() => void updateStatus('completed')}
          className="flex items-center space-x-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Check className="h-4 w-4" />
          <span>Hoàn thành</span>
        </button>
      )}
    </div>
  )
}
