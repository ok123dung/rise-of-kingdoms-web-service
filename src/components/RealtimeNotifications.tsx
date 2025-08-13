'use client'

import { useState, useEffect } from 'react'
import { useNotificationWebSocket } from '@/hooks/useWebSocket'
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function RealtimeNotifications() {
  const { 
    isConnected, 
    notifications, 
    unreadCount, 
    markAsRead 
  } = useNotificationWebSocket()
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [latestNotification, setLatestNotification] = useState<any>(null)

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0 && notifications[0] !== latestNotification) {
      setLatestNotification(notifications[0])
      setShowToast(true)
      
      // Auto-hide toast after 5 seconds
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [notifications, latestNotification])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'payment':
        return <Check className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    // Navigate to relevant page based on notification type
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500" />
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border z-50">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">Thông báo</h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Không có thông báo mới</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(notification.createdAt), 'dd MMM, HH:mm', { locale: vi })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-blue-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="border-t p-3 text-center">
                <a
                  href="/dashboard/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Xem tất cả thông báo
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && latestNotification && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-lg border max-w-sm">
            {getNotificationIcon(latestNotification.type)}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {latestNotification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {latestNotification.message}
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}