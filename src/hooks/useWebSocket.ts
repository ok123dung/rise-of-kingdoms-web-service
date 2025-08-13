'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
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
        const { token } = await response.json()
        if (!token) {
          throw new Error('Failed to get WebSocket token')
        }
        // Create socket connection
        const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
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
          console.log('WebSocket connected')
        })
        socket.on('disconnect', (reason) => {
          setIsConnected(false)
          console.log('WebSocket disconnected:', reason)
        })
        socket.on('connect_error', (error) => {
          setConnectionError(error.message)
          console.error('WebSocket connection error:', error)
        })
        socketRef.current = socket
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        setConnectionError('Failed to connect to real-time updates')
      }
    }
    initSocket()
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [session, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay])
  // Subscribe to events
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (!socketRef.current) return
    socketRef.current.on(event, handler)
    // Return unsubscribe function
    return () => {
      socketRef.current?.off(event, handler)
    }
  }, [])
  // Emit events
  const emit = useCallback((event: string, ...args: any[]) => {
    if (!socketRef.current) {
      console.warn('Socket not connected, cannot emit event:', event)
      return
    }
    socketRef.current.emit(event, ...args)
  }, [])
  // Subscribe to a booking room
  const subscribeToBooking = useCallback((bookingId: string) => {
    emit('booking:subscribe', bookingId)
  }, [emit])
  // Send a chat message
  const sendMessage = useCallback((bookingId: string, message: string) => {
    emit('chat:send', { bookingId, message })
  }, [emit])
  // Send typing indicator
  const sendTypingIndicator = useCallback((bookingId: string, isTyping: boolean) => {
    emit('chat:typing', { bookingId, isTyping })
  }, [emit])
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
export function useBookingWebSocket(bookingId: string) {
  const ws = useWebSocket()
  const [messages, setMessages] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [bookingStatus, setBookingStatus] = useState<string | null>(null)
  useEffect(() => {
    if (!ws.isConnected || !bookingId) return
    // Subscribe to booking room
    ws.subscribeToBooking(bookingId)
    // Set up event listeners
    const unsubscribers = [
      ws.on('booking:subscribed', ({ bookingId: id }) => {
        console.log('Subscribed to booking:', id)
      }),
      ws.on('chat:message', (message) => {
        setMessages(prev => [...prev, message])
      }),
      ws.on('chat:typing', ({ userId, isTyping }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (isTyping) {
            newSet.add(userId)
          } else {
            newSet.delete(userId)
          }
          return newSet
        })
      }),
      ws.on('booking:statusUpdate', ({ status }) => {
        setBookingStatus(status)
      }),
      ws.on('error', ({ message }) => {
        console.error('Booking WebSocket error:', message)
      })
    ]
    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub?.())
    }
  }, [ws, bookingId])
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
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    if (!ws.isConnected) return
    const unsubscribers = [
      ws.on('notification:new', (notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)
      }),
      ws.on('payment:update', (payment) => {
        // Handle payment updates
        console.log('Payment update:', payment)
      })
    ]
    return () => {
      unsubscribers.forEach(unsub => unsub?.())
    }
  }, [ws])
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])
  return {
    ...ws,
    notifications,
    unreadCount,
    markAsRead
  }
}