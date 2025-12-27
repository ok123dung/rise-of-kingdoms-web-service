'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'

interface OrderTrackingEvent {
  booking_id: string
  booking_number: string
  event: 'payment_received' | 'service_started' | 'progress_update' | 'service_completed'
  message: string
  progress?: number
  timestamp: string
}

interface PaymentUpdateEvent {
  booking_id: string
  payment_id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  payment_method: string
  transactionId?: string
  timestamp: string
}

interface BookingStatusEvent {
  booking_id: string
  booking_number: string
  status: string
  previousStatus: string
  completion_percentage?: number
  updatedAt: string
}

interface UseOrderTrackingOptions {
  wsToken: string
  bookingId?: string
  onPaymentUpdate?: (event: PaymentUpdateEvent) => void
  onOrderTracking?: (event: OrderTrackingEvent) => void
  onBookingStatus?: (event: BookingStatusEvent) => void
  autoConnect?: boolean
}

interface UseOrderTrackingReturn {
  isConnected: boolean
  events: OrderTrackingEvent[]
  lastPaymentUpdate: PaymentUpdateEvent | null
  lastStatusUpdate: BookingStatusEvent | null
  connect: () => void
  disconnect: () => void
  subscribeToBooking: (bookingId: string) => void
}

export function useOrderTracking({
  wsToken,
  bookingId,
  onPaymentUpdate,
  onOrderTracking,
  onBookingStatus,
  autoConnect = true
}: UseOrderTrackingOptions): UseOrderTrackingReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<OrderTrackingEvent[]>([])
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState<PaymentUpdateEvent | null>(null)
  const [lastStatusUpdate, setLastStatusUpdate] = useState<BookingStatusEvent | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002'

    const socket = io(wsUrl, {
      auth: { token: wsToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      setIsConnected(true)

      // Subscribe to booking if provided
      if (bookingId) {
        socket.emit('booking:subscribe', bookingId)
      }
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    // Payment update events
    socket.on('payment:update', (data: PaymentUpdateEvent) => {
      setLastPaymentUpdate(data)
      onPaymentUpdate?.(data)
    })

    // Order tracking events
    socket.on('order:tracking', (data: OrderTrackingEvent) => {
      setEvents(prev => [...prev, data])
      onOrderTracking?.(data)
    })

    // Booking status updates
    socket.on('booking:statusUpdate', (data: BookingStatusEvent) => {
      setLastStatusUpdate(data)
      onBookingStatus?.(data)
    })

    socketRef.current = socket
  }, [wsToken, bookingId, onPaymentUpdate, onOrderTracking, onBookingStatus])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  const subscribeToBooking = useCallback((newBookingId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('booking:subscribe', newBookingId)
    }
  }, [])

  useEffect(() => {
    if (autoConnect && wsToken) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, wsToken, connect, disconnect])

  return {
    isConnected,
    events,
    lastPaymentUpdate,
    lastStatusUpdate,
    connect,
    disconnect,
    subscribeToBooking
  }
}
