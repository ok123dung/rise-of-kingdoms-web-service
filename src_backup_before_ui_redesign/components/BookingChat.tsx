'use client'

import { useState, useEffect, useRef } from 'react'

import { format } from 'date-fns'
import { Send, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { useBookingWebSocket } from '@/hooks/useWebSocket'

interface BookingChatProps {
  bookingId: string
  className?: string
}

export function BookingChat({ bookingId, className = '' }: BookingChatProps) {
  const { data: session } = useSession()
  const { isConnected, connectionError, messages, typingUsers, sendMessage, sendTypingIndicator } =
    useBookingWebSocket(bookingId)

  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setNewMessage(value)

    // Send typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      sendTypingIndicator(bookingId, true)
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        sendTypingIndicator(bookingId, false)
      }
    }, 1000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !isConnected) return

    sendMessage(bookingId, newMessage.trim())
    setNewMessage('')

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false)
      sendTypingIndicator(bookingId, false)
    }
  }

  if (connectionError) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
        <p className="text-sm text-red-600">Không thể kết nối chat: {connectionError}</p>
      </div>
    )
  }

  return (
    <div className={`flex h-[500px] flex-col rounded-lg border bg-white ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Chat với nhân viên</h3>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            <p className="text-sm">Chưa có tin nhắn nào</p>
            <p className="mt-1 text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === session?.user?.id

            return (
              <div
                key={message.id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-xs font-medium opacity-70">
                      {message.sender?.fullName || 'Nhân viên'}
                    </p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`mt-1 text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {format(new Date(message.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: '0.1s' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                style={{ animationDelay: '0.2s' }}
              />
            </div>
            <span>Đang nhập...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form className="border-t p-4" onSubmit={handleSendMessage}>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={!isConnected}
            placeholder="Nhập tin nhắn..."
            type="text"
            value={newMessage}
            onChange={e => handleInputChange(e.target.value)}
          />
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={!isConnected || !newMessage.trim()}
            type="submit"
          >
            {isConnected ? (
              <Send className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
