/**
 * WebSocket Event Emitters
 * Helper functions to emit real-time events from server-side code
 */

import { getLogger } from '@/lib/monitoring/logger'
import { getWebSocketServer } from './init'

export interface PaymentUpdateEvent {
  booking_id: string
  payment_id: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  payment_method: string
  transactionId?: string
}

export interface BookingStatusEvent {
  booking_id: string
  booking_number: string
  status: string
  previousStatus: string
  completion_percentage?: number
  updatedAt: string
}

export interface OrderTrackingEvent {
  booking_id: string
  booking_number: string
  event: 'payment_received' | 'service_started' | 'progress_update' | 'service_completed'
  message: string
  progress?: number
  timestamp: string
}

// Emit payment status update to user
export function emitPaymentUpdate(user_id: string, data: PaymentUpdateEvent): void {
  const ws = getWebSocketServer()
  if (!ws) {
    getLogger().debug('WebSocket not available for payment update')
    return
  }

  ws.emitToUser(user_id, 'payment:update', {
    ...data,
    timestamp: new Date().toISOString()
  })

  // Also emit to admin
  ws.emitToRole('admin', 'payment:update', {
    ...data,
    user_id,
    timestamp: new Date().toISOString()
  })

  getLogger().info('Emitted payment update', { booking_id: data.booking_id, status: data.status })
}

// Emit booking status change
export function emitBookingStatusUpdate(
  user_id: string,
  booking_id: string,
  data: Omit<BookingStatusEvent, 'booking_id'>
): void {
  const ws = getWebSocketServer()
  if (!ws) {
    getLogger().debug('WebSocket not available for booking update')
    return
  }

  const eventData = {
    booking_id,
    ...data,
    timestamp: new Date().toISOString()
  }

  // Emit to user
  ws.emitToUser(user_id, 'booking:statusUpdate', eventData)

  // Emit to booking room (for staff watching)
  ws.emitToBooking(booking_id, 'booking:statusUpdate', eventData)

  // Emit to admin
  ws.emitToRole('admin', 'booking:statusUpdate', {
    ...eventData,
    user_id
  })

  getLogger().info('Emitted booking status update', { booking_id, status: data.status })
}

// Emit order tracking event
export function emitOrderTracking(user_id: string, data: OrderTrackingEvent): void {
  const ws = getWebSocketServer()
  if (!ws) {
    getLogger().debug('WebSocket not available for order tracking')
    return
  }

  // Emit to user
  ws.emitToUser(user_id, 'order:tracking', data)

  // Emit to booking room
  ws.emitToBooking(data.booking_id, 'order:tracking', data)

  getLogger().info('Emitted order tracking event', {
    booking_id: data.booking_id,
    event: data.event
  })
}

// Emit notification to user
export function emitNotification(
  user_id: string,
  notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    link?: string
  }
): void {
  const ws = getWebSocketServer()
  if (!ws) {
    getLogger().debug('WebSocket not available for notification')
    return
  }

  ws.emitNotification(user_id, {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  })
}

// Emit admin dashboard update
export function emitAdminDashboardUpdate(data: {
  type: 'new_booking' | 'payment_received' | 'booking_completed'
  summary: Record<string, unknown>
}): void {
  const ws = getWebSocketServer()
  if (!ws) {
    getLogger().debug('WebSocket not available for admin update')
    return
  }

  ws.emitToRole('admin', 'dashboard:update', {
    ...data,
    timestamp: new Date().toISOString()
  })

  ws.emitToRole('superadmin', 'dashboard:update', {
    ...data,
    timestamp: new Date().toISOString()
  })
}
