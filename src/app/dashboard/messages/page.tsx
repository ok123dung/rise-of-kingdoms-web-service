'use client'

import { useState } from 'react'

import { ChatBubbleLeftRightIcon, InboxIcon } from '@heroicons/react/24/outline'

export default function MessagesPage() {
  const [messages] = useState([])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý tin nhắn và thông báo từ hệ thống</p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tin nhắn</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn chưa có tin nhắn nào. Tin nhắn hỗ trợ sẽ xuất hiện ở đây.
          </p>
          <div className="mt-6">
            <a
              className="bg-rok-gold hover:bg-rok-gold-dark inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm"
              href="/dashboard/support"
            >
              <ChatBubbleLeftRightIcon className="-ml-1 mr-2 h-5 w-5" />
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          {/* Messages list will go here */}
        </div>
      )}
    </div>
  )
}
