import crypto from 'crypto'
import { type Server as HTTPServer } from 'http'

import { Server as SocketIOServer, type Socket } from 'socket.io'

import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { createOptimizedRateLimiter } from '@/lib/rate-limit-lru'

interface AuthenticatedSocket extends Socket {
  user_id?: string
  userRole?: string
  sessionId?: string
  lastActivity?: number
}

interface ConnectionOptions {
  maxConnectionsPerUser?: number
  sessionTimeout?: number
  enableRateLimiting?: boolean
  enableReplay?: boolean
}

export class SecureWebSocketServer {
  private io: SocketIOServer
  private userSockets: Map<string, Set<string>> = new Map()
  private socketSessions: Map<string, { user_id: string; created_at: number }> = new Map()
  private rateLimiter = createOptimizedRateLimiter({
    window: 60000, // 1 minute
    max: 100, // 100 events per minute
    prefix: 'ws'
  })
  private options: Required<ConnectionOptions>

  constructor(httpServer: HTTPServer, options: ConnectionOptions = {}) {
    this.options = {
      maxConnectionsPerUser: options.maxConnectionsPerUser || 5,
      sessionTimeout: options.sessionTimeout || 30 * 60 * 1000, // 30 minutes
      enableRateLimiting: options.enableRateLimiting ?? true,
      enableReplay: options.enableReplay ?? false
    }

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: this.getAllowedOrigins(),
        credentials: true
      },
      transports: ['websocket'], // Disable polling for security
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e6, // 1MB max message size
      allowEIO3: false // Disable older protocol versions
    })

    this.setupMiddleware()
    this.setupEventHandlers()
    this.startSessionCleanup()
  }

  private getAllowedOrigins(): string[] {
    const origins = [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'https://rokdbot.com',
      'https://www.rokdbot.com'
    ]

    if (process.env.ALLOWED_WS_ORIGINS) {
      origins.push(...process.env.ALLOWED_WS_ORIGINS.split(','))
    }

    return origins
  }

  private setupMiddleware() {
    // Rate limiting middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      if (!this.options.enableRateLimiting) {
        return next()
      }

      const ip = socket.handshake.address
      const result = this.rateLimiter.checkLimit(ip)

      if (!result.success) {
        return next(new Error('Too many connection attempts'))
      }

      next()
    })

    // Authentication middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const { token } = socket.handshake.auth as { token?: string; sessionId?: string }
        const { sessionId } = socket.handshake.auth as { token?: string; sessionId?: string }

        if (!token) {
          return next(new Error('Authentication required'))
        }

        // Verify JWT token
        const decoded = verifyToken(token)

        if (!decoded?.user_id) {
          return next(new Error('Invalid token'))
        }

        // Verify token hasn't expired
        const now = Date.now() / 1000
        if ('exp' in decoded && typeof decoded.exp === 'number' && decoded.exp < now) {
          return next(new Error('Token expired'))
        }

        // Check for concurrent connections
        const userConnections = this.userSockets.get(decoded.user_id) || new Set()
        if (userConnections.size >= this.options.maxConnectionsPerUser) {
          return next(new Error('Too many concurrent connections'))
        }

        // Generate secure session ID
        const secureSessionId = (sessionId as string) || crypto.randomBytes(32).toString('hex')

        // Attach user info to socket
        socket.user_id = decoded.user_id
        socket.userRole = decoded.role
        socket.sessionId = secureSessionId
        socket.lastActivity = Date.now()

        // Track session
        this.socketSessions.set(socket.id, {
          user_id: decoded.user_id,
          created_at: Date.now()
        })

        // Track user connections
        this.addUserSocket(decoded.user_id, socket.id)

        next()
      } catch (error) {
        getLogger().error('WebSocket auth error', error as Error, {
          ip: socket.handshake.address
        })
        next(new Error('Authentication failed'))
      }
    })

    // Activity tracking middleware
    this.io.use((socket: AuthenticatedSocket, next) => {
      const originalEmit = socket.emit.bind(socket)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.emit = function (...args: any[]) {
        socket.lastActivity = Date.now()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        return originalEmit.apply(socket, args as [string, ...any[]])
      }
      next()
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      getLogger().info('WebSocket client connected', {
        socketId: socket.id,
        user_id: socket.user_id,
        sessionId: socket.sessionId
      })

      // Send connection acknowledgment
      socket.emit('connected', {
        sessionId: socket.sessionId,
        serverTime: Date.now()
      })

      // Join user-specific room with validation
      if (socket.user_id) {
        void socket.join(`user:${socket.user_id}`)

        // Join role-specific room
        if (socket.userRole === 'admin' || socket.userRole === 'staff') {
          void socket.join(`role:${socket.userRole}`)
        }
      }

      // Secure event handler wrapper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secureHandler = <T = any>(eventName: string, handler: (data: T) => Promise<void>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.on(eventName, async (...args: any[]) => {
          try {
            // Check session validity
            if (!this.isSessionValid(socket)) {
              socket.emit('error', {
                code: 'SESSION_EXPIRED',
                message: 'Session expired'
              })
              socket.disconnect()
              return
            }

            // Rate limiting per event
            const rateLimitKey = `${socket.user_id}:${eventName}`
            const result = this.rateLimiter.checkLimit(rateLimitKey)

            if (!result.success) {
              socket.emit('error', {
                code: 'RATE_LIMITED',
                message: 'Too many requests',
                retryAfter: result.retryAfter
              })
              return
            }

            // Update activity
            socket.lastActivity = Date.now()

            // Execute handler
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await handler(args[0] as T)
          } catch (error) {
            getLogger().error(`WebSocket event error: ${eventName}`, error as Error, {
              user_id: socket.user_id,
              eventName
            })
            socket.emit('error', {
              code: 'INTERNAL_ERROR',
              message: 'An error occurred processing your request'
            })
          }
        })
      }

      // Secure booking subscription
      secureHandler('booking:subscribe', async (data: { booking_id: string }) => {
        const { booking_id } = data

        if (!booking_id || typeof booking_id !== 'string') {
          socket.emit('error', {
            code: 'INVALID_REQUEST',
            message: 'Invalid booking ID'
          })
          return
        }

        // Verify user has access to this booking
        const booking = await prisma.bookings.findFirst({
          where: {
            id: booking_id,
            user_id: socket.user_id // Only allow user to subscribe to their own bookings
          },
          select: { id: true, status: true }
        })

        if (booking) {
          void socket.join(`booking:${booking_id}`)
          socket.emit('booking:subscribed', {
            booking_id,
            status: booking.status
          })
        } else {
          socket.emit('error', {
            code: 'ACCESS_DENIED',
            message: 'Access denied to booking'
          })
        }
      })

      // Secure chat message handler
      secureHandler('chat:message', async (data: { booking_id: string; message: string }) => {
        const { booking_id, message } = data

        // Validate input
        if (!booking_id || !message || typeof message !== 'string') {
          socket.emit('error', {
            code: 'INVALID_REQUEST',
            message: 'Invalid message data'
          })
          return
        }

        // Sanitize message
        const sanitizedMessage = message.trim().substring(0, 1000)

        if (sanitizedMessage.length === 0) {
          return
        }

        // Verify access and send message
        const hasAccess = await this.verifyBookingAccess(socket.user_id!, booking_id)

        if (hasAccess) {
          // Store message in database
          const chatMessage = await prisma.communications.create({
            data: {
              id: crypto.randomUUID(),
              user_id: socket.user_id!,
              booking_id,
              type: 'chat',
              content: sanitizedMessage,
              channel: `socket:${socket.id}`
            },
            include: {
              users: {
                select: {
                  id: true,
                  full_name: true
                  // image: true // Field doesn't exist in User schema
                }
              }
            }
          })

          // Broadcast to booking room
          this.io.to(`booking:${booking_id}`).emit('chat:message', {
            id: chatMessage.id,
            booking_id,
            message: sanitizedMessage,
            user: chatMessage.users,
            created_at: chatMessage.created_at
          })
        } else {
          socket.emit('error', {
            code: 'ACCESS_DENIED',
            message: 'Cannot send message to this booking'
          })
        }
      })

      // Handle disconnect
      socket.on('disconnect', reason => {
        getLogger().info('WebSocket client disconnected', {
          socketId: socket.id,
          user_id: socket.user_id,
          reason
        })

        if (socket.user_id) {
          this.removeUserSocket(socket.user_id, socket.id)
        }

        this.socketSessions.delete(socket.id)
      })

      // Handle errors
      socket.on('error', error => {
        getLogger().error('WebSocket error', error, {
          socketId: socket.id,
          user_id: socket.user_id
        })
      })
    })
  }

  private isSessionValid(socket: AuthenticatedSocket): boolean {
    if (!socket.lastActivity) return false

    const now = Date.now()
    const sessionAge = now - socket.lastActivity

    return sessionAge < this.options.sessionTimeout
  }

  private async verifyBookingAccess(user_id: string, booking_id: string): Promise<boolean> {
    const booking = await prisma.bookings.findFirst({
      where: {
        id: booking_id,
        user_id // Only check if user owns the booking
      },
      select: { id: true }
    })

    return !!booking
  }

  private addUserSocket(user_id: string, socketId: string) {
    const sockets = this.userSockets.get(user_id) || new Set()
    sockets.add(socketId)
    this.userSockets.set(user_id, sockets)
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

  private startSessionCleanup() {
    // Clean up expired sessions every 5 minutes
    setInterval(
      () => {
        const now = Date.now()
        let cleaned = 0

        for (const [socketId, session] of this.socketSessions.entries()) {
          const age = now - session.created_at
          if (age > this.options.sessionTimeout) {
            const socket = this.io.sockets.sockets.get(socketId)
            if (socket) {
              socket.disconnect()
            }
            this.socketSessions.delete(socketId)
            cleaned++
          }
        }

        if (cleaned > 0) {
          getLogger().info('WebSocket session cleanup', { cleaned })
        }
      },
      5 * 60 * 1000
    )
  }

  // Public methods for server-side events
  public sendToUser(user_id: string, event: string, data: Record<string, unknown>) {
    this.io.to(`user:${user_id}`).emit(event, data)
  }

  public sendToBooking(booking_id: string, event: string, data: Record<string, unknown>) {
    this.io.to(`booking:${booking_id}`).emit(event, data)
  }

  public sendToRole(role: string, event: string, data: Record<string, unknown>) {
    this.io.to(`role:${role}`).emit(event, data)
  }

  public getStats() {
    return {
      connectedClients: this.io.sockets.sockets.size,
      uniqueUsers: this.userSockets.size,
      sessions: this.socketSessions.size
    }
  }
}
