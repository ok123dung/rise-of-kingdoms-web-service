'use client'
import { useEffect, useRef, useCallback, useState } from 'react'

import { useSession } from 'next-auth/react'
import { io, type Socket } from 'socket.io-client'

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

interface WsTokenResponse {
  token?: string
}

interface Message {
  id: string
  content: string
  senderId: string
  created_at: string | Date
  type?: string
  sender?: { full_name: string }
}

interface WsNotification {
  id: string
  type: string
  title: string
  message: string
  created_at: string
  read: boolean
  link?: string
}
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options
  // Initialize socket connection
  useEffect(() => {
    if (!session?.user || !autoConnect) return
    const initSocket = async () => {
      try {
        // Get WebSocket token from API
        const response = await fetch('/api/auth/ws-token')
        const { token } = (await response.json()) as WsTokenResponse
        if (!token) {
          throw new Error('Failed to get WebSocket token')
        }
        // Create socket connection
        const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002', {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection,
          reconnectionAttempts,
          reconnectionDelay
        })
        // Connection event handlers
        socket.on('connect', () => {
          setIsConnected(true)
          setConnectionError(null)
        })
        socket.on('disconnect', _reason => {
          setIsConnected(false)
        })
        socket.on('connect_error', error => {
          setConnectionError(error.message)
          console.error('WebSocket connection error:', error)
        })
        socketRef.current = socket
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        setConnectionError('Failed to connect to real-time updates')
      }
    }
    void initSocket()
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [session, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay])
  // Subscribe to events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    if (!socketRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketRef.current.on(event, handler as (...args: any[]) => void)
    // Return unsubscribe function
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current?.off(event, handler as (...args: any[]) => void)
    }
  }, [])
  // Emit events
  const emit = useCallback((event: string, ...args: unknown[]) => {
    if (!socketRef.current) {
      console.warn('Socket not connected, cannot emit event:', event)
      return
    }
    socketRef.current.emit(event, ...args)
  }, [])
  // Subscribe to a booking room
  const subscribeToBooking = useCallback(
    (booking_id: string) => {
      emit('booking:subscribe', booking_id)
    },
    [emit]
  )
  // Send a chat message
  const sendMessage = useCallback(
    (booking_id: string, message: string) => {
      emit('chat:send', { booking_id, message })
    },
    [emit]
  )
  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (booking_id: string, isTyping: boolean) => {
      emit('chat:typing', { booking_id, isTyping })
    },
    [emit]
  )
  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    on,
    emit,
    subscribeToBooking,
    sendMessage,
    sendTypingIndicator
  }
}
// Hook for booking-specific WebSocket events
export function useBookingWebSocket(booking_id: string) {
  const ws = useWebSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [bookingStatus, setBookingStatus] = useState<string | null>(null)
  useEffect(() => {
    if (!ws.isConnected || !booking_id) return
    // Subscribe to booking room
    ws.subscribeToBooking(booking_id)
    // Set up event listeners
    const unsubscribers = [
      ws.on('booking:subscribed', (_data: unknown) => {
        // Handle subscription acknowledgement
      }),
      ws.on('chat:message', (message: unknown) => {
        setMessages(prev => [...prev, message as Message])
      }),
      ws.on('chat:typing', (data: unknown) => {
        const { user_id, isTyping: typing } = data as { user_id: string; isTyping: boolean }
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (typing) {
            newSet.add(user_id)
          } else {
            newSet.delete(user_id)
          }
          return newSet
        })
      }),
      ws.on('booking:statusUpdate', (data: unknown) => {
        const { status } = data as { status: string }
        setBookingStatus(status)
      }),
      ws.on('error', (data: unknown) => {
        const { message } = data as { message: string }
        console.error('Booking WebSocket error:', message)
      })
    ]
    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub?.())
    }
  }, [ws, booking_id])
  return {
    ...ws,
    messages,
    typingUsers: Array.from(typingUsers),
    bookingStatus
  }
}
// Hook for notification WebSocket events
export function useNotificationWebSocket() {
  const ws = useWebSocket()
  const [notifications, setNotifications] = useState<WsNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    if (!ws.isConnected) return
    const unsubscribers = [
      ws.on('notification:new', (notification: unknown) => {
        setNotifications(prev => [notification as WsNotification, ...prev])
        setUnreadCount(prev => prev + 1)
      }),
      ws.on('payment:update', (_payment: unknown) => {
        // Handle payment updates
      })
    ]
    return () => {
      unsubscribers.forEach(unsub => unsub?.())
    }
  }, [ws])
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])
  return {
    ...ws,
    notifications,
    unreadCount,
    markAsRead
  }
}
