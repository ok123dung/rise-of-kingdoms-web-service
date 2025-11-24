'use client'

import { useState } from 'react'

import { BellIcon } from '@heroicons/react/24/outline'

export default function NotificationsPage() {
  const [notifications] = useState([])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
        <p className="mt-1 text-sm text-gray-500">Tất cả thông báo từ hệ thống</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông báo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn sẽ nhận được thông báo về đơn hàng và dịch vụ tại đây.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          {/* Notifications list will go here */}
        </div>
      )}
    </div>
  )
}
