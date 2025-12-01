import { type Server as HTTPServer } from 'http'

import { Server as SocketIOServer, type Socket } from 'socket.io'

import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

interface AuthenticatedSocket extends Socket {
  userId?: string
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

        if (!decoded?.userId) {
          return next(new Error('Invalid token'))
        }

        // Attach user info to socket
        socket.userId = decoded.userId
        socket.userRole = decoded.role

        // Track user connections
        this.addUserSocket(decoded.userId, socket.id)

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
        userId: socket.userId
      })

      // Join user-specific room
      if (socket.userId) {
        socket.join(`user:${socket.userId}`)

        // Join role-specific room
        if (socket.userRole) {
          socket.join(`role:${socket.userRole}`)
        }
      }

      // Handle booking status updates
      socket.on('booking:subscribe', async (bookingId: string) => {
        try {
          // Verify user has access to this booking
          const booking = await prisma.booking.findFirst({
            where: {
              id: bookingId,
              userId: socket.userId // Only allow users to access their own bookings
            }
          })

          if (booking) {
            socket.join(`booking:${bookingId}`)
            socket.emit('booking:subscribed', { bookingId })
          } else {
            socket.emit('error', { message: 'Access denied to booking' })
          }
        } catch (error) {
          getLogger().error('Booking subscription error', error as Error)
          socket.emit('error', { message: 'Failed to subscribe to booking' })
        }
      })

      // Handle chat messages
      socket.on('chat:send', async (data: { bookingId: string; message: string }) => {
        try {
          if (!socket.userId) return

          // Verify access and save message
          const message = await prisma.communication.create({
            data: {
              type: 'chat',
              content: data.message,
              userId: socket.userId,
              bookingId: data.bookingId,
              channel:
                socket.userRole === 'staff' || socket.userRole === 'admin' ? 'staff' : 'customer'
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          })

          // Emit to all users in the booking room
          this.io.to(`booking:${data.bookingId}`).emit('chat:message', message)
        } catch (error) {
          getLogger().error('Chat message error', error as Error)
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle typing indicators
      socket.on('chat:typing', (data: { bookingId: string; isTyping: boolean }) => {
        socket.to(`booking:${data.bookingId}`).emit('chat:typing', {
          userId: socket.userId,
          isTyping: data.isTyping
        })
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        getLogger().info('WebSocket client disconnected', {
          socketId: socket.id,
          userId: socket.userId
        })

        if (socket.userId) {
          this.removeUserSocket(socket.userId, socket.id)
        }
      })
    })
  }

  // Track user connections
  private addUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId)!.add(socketId)
  }

  private removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId)
    if (sockets) {
      sockets.delete(socketId)
      if (sockets.size === 0) {
        this.userSockets.delete(userId)
      }
    }
  }

  // Public methods for server-side events
  public emitToUser(userId: string, event: string, data: Record<string, unknown>) {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  public emitToRole(role: string, event: string, data: Record<string, unknown>) {
    this.io.to(`role:${role}`).emit(event, data)
  }

  public emitToBooking(bookingId: string, event: string, data: Record<string, unknown>) {
    this.io.to(`booking:${bookingId}`).emit(event, data)
  }

  public emitBookingStatusUpdate(bookingId: string, status: string, userId: string) {
    this.emitToBooking(bookingId, 'booking:statusUpdate', { bookingId, status })
    this.emitToUser(userId, 'booking:statusUpdate', { bookingId, status })
  }

  public emitPaymentUpdate(userId: string, paymentData: Record<string, unknown>) {
    this.emitToUser(userId, 'payment:update', paymentData)
  }

  public emitNotification(userId: string, notification: Record<string, unknown>) {
    this.emitToUser(userId, 'notification:new', notification)
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId)
  }

  public getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0
  }
}
