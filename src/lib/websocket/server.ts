import { type Server as HTTPServer } from 'http'

import { Server as SocketIOServer, type Socket } from 'socket.io'

import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface AuthenticatedSocket extends Socket {
  user_id?: string
  userRole?: string
}

export class WebSocketServer {
  private io: SocketIOServer
  private userSockets: Map<string, Set<string>> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    this.setupMiddleware()
    this.setupEventHandlers()
  }

  private setupMiddleware() {
    // Authentication middleware
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const { token } = socket.handshake.auth

        if (!token) {
          return next(new Error('Authentication required'))
        }

        // Verify JWT token
        const decoded = verifyToken(token)

        if (!decoded?.user_id) {
          return next(new Error('Invalid token'))
        }

        // Attach user info to socket
        socket.user_id = decoded.user_id
        socket.userRole = decoded.role

        // Track user connections
        this.addUserSocket(decoded.user_id, socket.id)

        next()
      } catch (error) {
        getLogger().error('WebSocket auth error', error as Error)
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      getLogger().info('WebSocket client connected', {
        socketId: socket.id,
        user_id: socket.user_id
      })

      // Join user-specific room
      if (socket.user_id) {
        socket.join(`user:${socket.user_id}`)

        // Join role-specific room
        if (socket.userRole) {
          socket.join(`role:${socket.userRole}`)
        }
      }

      // Handle booking status updates
      socket.on('booking:subscribe', async (booking_id: string) => {
        try {
          // Verify user has access to this booking
          const booking = await prisma.bookings.findFirst({
            where: {
              id: booking_id,
              user_id: socket.user_id // Only allow users to access their own bookings
            }
          })

          if (booking) {
            socket.join(`booking:${booking_id}`)
            socket.emit('booking:subscribed', { booking_id })
          } else {
            socket.emit('error', { message: 'Access denied to booking' })
          }
        } catch (error) {
          getLogger().error('Booking subscription error', error as Error)
          socket.emit('error', { message: 'Failed to subscribe to booking' })
        }
      })

      // Handle chat messages
      socket.on('chat:send', async (data: { booking_id: string; message: string }) => {
        try {
          if (!socket.user_id) return

          // Verify access and save message
          const message = await prisma.communications.create({
            data: {
          id: crypto.randomUUID(),
          type: 'chat',
              content: data.message,
              user_id: socket.user_id,
              booking_id: data.booking_id,
              channel:
                socket.userRole === 'staff' || socket.userRole === 'admin' ? 'staff' : 'customer'
            },
            include: { users: {
                select: {
                  id: true,
                  full_name: true,
                  email: true
                }
              }
            }
          })

          // Emit to all users in the booking room
          this.io.to(`booking:${data.booking_id}`).emit('chat:message', message)
        } catch (error) {
          getLogger().error('Chat message error', error as Error)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle typing indicators
      socket.on('chat:typing', (data: { booking_id: string; isTyping: boolean }) => {
        socket.to(`booking:${data.booking_id}`).emit('chat:typing', {
          user_id: socket.user_id,
          isTyping: data.isTyping
        })
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        getLogger().info('WebSocket client disconnected', {
          socketId: socket.id,
          user_id: socket.user_id
        })

        if (socket.user_id) {
          this.removeUserSocket(socket.user_id, socket.id)
        }
      })
    })
  }

  // Track user connections
  private addUserSocket(user_id: string, socketId: string) {
    if (!this.userSockets.has(user_id)) {
      this.userSockets.set(user_id, new Set())
    }
    this.userSockets.get(user_id)!.add(socketId)
  }

  private removeUserSocket(user_id: string, socketId: string) {
    const sockets = this.userSockets.get(user_id)
    if (sockets) {
      sockets.delete(socketId)
      if (sockets.size === 0) {
        this.userSockets.delete(user_id)
      }
    }
  }

  // Public methods for server-side events
  public emitToUser(user_id: string, event: string, data: Record<string, unknown>) {
    this.io.to(`user:${user_id}`).emit(event, data)
  }

  public emitToRole(role: string, event: string, data: Record<string, unknown>) {
    this.io.to(`role:${role}`).emit(event, data)
  }

  public emitToBooking(booking_id: string, event: string, data: Record<string, unknown>) {
    this.io.to(`booking:${booking_id}`).emit(event, data)
  }

  public emitBookingStatusUpdate(booking_id: string, status: string, user_id: string) {
    this.emitToBooking(booking_id, 'booking:statusUpdate', { booking_id, status })
    this.emitToUser(user_id, 'booking:statusUpdate', { booking_id, status })
  }

  public emitPaymentUpdate(user_id: string, paymentData: Record<string, unknown>) {
    this.emitToUser(user_id, 'payment:update', paymentData)
  }

  public emitNotification(user_id: string, notification: Record<string, unknown>) {
    this.emitToUser(user_id, 'notification:new', notification)
  }

  public isUserOnline(user_id: string): boolean {
    return this.userSockets.has(user_id)
  }

  public getUserSocketCount(user_id: string): number {
    return this.userSockets.get(user_id)?.size || 0
  }
}
