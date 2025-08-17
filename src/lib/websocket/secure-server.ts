import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { getLogger } from '@/lib/monitoring/logger'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth/jwt'
import { createOptimizedRateLimiter } from '@/lib/rate-limit-lru'
import crypto from 'crypto'

interface AuthenticatedSocket extends Socket {
  userId?: string
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
  private socketSessions: Map<string, { userId: string; createdAt: number }> = new Map()
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
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      if (!this.options.enableRateLimiting) {
        return next()
      }

      const ip = socket.handshake.address
      const result = await this.rateLimiter.checkLimit(ip)
      
      if (!result.success) {
        return next(new Error('Too many connection attempts'))
      }
      
      next()
    })

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token
        const sessionId = socket.handshake.auth.sessionId
        
        if (!token) {
          return next(new Error('Authentication required'))
        }

        // Verify JWT token
        const decoded = await verifyToken(token)
        
        if (!decoded || !decoded.userId) {
          return next(new Error('Invalid token'))
        }

        // Verify token hasn't expired
        const now = Date.now() / 1000
        if ('exp' in decoded && typeof decoded.exp === 'number' && decoded.exp < now) {
          return next(new Error('Token expired'))
        }

        // Check for concurrent connections
        const userConnections = this.userSockets.get(decoded.userId) || new Set()
        if (userConnections.size >= this.options.maxConnectionsPerUser) {
          return next(new Error('Too many concurrent connections'))
        }

        // Generate secure session ID
        const secureSessionId = sessionId || crypto.randomBytes(32).toString('hex')

        // Attach user info to socket
        socket.userId = decoded.userId
        socket.userRole = decoded.role
        socket.sessionId = secureSessionId
        socket.lastActivity = Date.now()

        // Track session
        this.socketSessions.set(socket.id, {
          userId: decoded.userId,
          createdAt: Date.now()
        })

        // Track user connections
        this.addUserSocket(decoded.userId, socket.id)

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
      const originalEmit = socket.emit
      socket.emit = function(...args: any[]) {
        socket.lastActivity = Date.now()
        return originalEmit.apply(socket, args as [string, ...any[]])
      }
      next()
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      getLogger().info('WebSocket client connected', {
        socketId: socket.id,
        userId: socket.userId,
        sessionId: socket.sessionId
      })

      // Send connection acknowledgment
      socket.emit('connected', {
        sessionId: socket.sessionId,
        serverTime: Date.now()
      })

      // Join user-specific room with validation
      if (socket.userId) {
        socket.join(`user:${socket.userId}`)
        
        // Join role-specific room
        if (socket.userRole === 'admin' || socket.userRole === 'staff') {
          socket.join(`role:${socket.userRole}`)
        }
      }

      // Secure event handler wrapper
      const secureHandler = (eventName: string, handler: Function) => {
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
            const rateLimitKey = `${socket.userId}:${eventName}`
            const result = await this.rateLimiter.checkLimit(rateLimitKey)
            
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
            await handler(...args)
          } catch (error) {
            getLogger().error(`WebSocket event error: ${eventName}`, error as Error, {
              userId: socket.userId,
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
      secureHandler('booking:subscribe', async (data: { bookingId: string }) => {
        const { bookingId } = data
        
        if (!bookingId || typeof bookingId !== 'string') {
          socket.emit('error', {
            code: 'INVALID_REQUEST',
            message: 'Invalid booking ID'
          })
          return
        }

        // Verify user has access to this booking
        const booking = await prisma.booking.findFirst({
          where: {
            id: bookingId,
            userId: socket.userId // Only allow user to subscribe to their own bookings
          },
          select: { id: true, status: true }
        })

        if (booking) {
          socket.join(`booking:${bookingId}`)
          socket.emit('booking:subscribed', { 
            bookingId,
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
      secureHandler('chat:message', async (data: {
        bookingId: string
        message: string
      }) => {
        const { bookingId, message } = data
        
        // Validate input
        if (!bookingId || !message || typeof message !== 'string') {
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
        const hasAccess = await this.verifyBookingAccess(socket.userId!, bookingId)
        
        if (hasAccess) {
          // Store message in database
          const chatMessage = await prisma.communication.create({
            data: {
              userId: socket.userId!,
              bookingId,
              type: 'chat',
              content: sanitizedMessage,
              channel: `socket:${socket.id}`
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  image: true
                }
              }
            }
          })

          // Broadcast to booking room
          this.io.to(`booking:${bookingId}`).emit('chat:message', {
            id: chatMessage.id,
            bookingId,
            message: sanitizedMessage,
            user: chatMessage.user,
            createdAt: chatMessage.createdAt
          })
        } else {
          socket.emit('error', {
            code: 'ACCESS_DENIED',
            message: 'Cannot send message to this booking'
          })
        }
      })

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        getLogger().info('WebSocket client disconnected', {
          socketId: socket.id,
          userId: socket.userId,
          reason
        })

        if (socket.userId) {
          this.removeUserSocket(socket.userId, socket.id)
        }
        
        this.socketSessions.delete(socket.id)
      })

      // Handle errors
      socket.on('error', (error) => {
        getLogger().error('WebSocket error', error, {
          socketId: socket.id,
          userId: socket.userId
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

  private async verifyBookingAccess(userId: string, bookingId: string): Promise<boolean> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId // Only check if user owns the booking
      },
      select: { id: true }
    })
    
    return !!booking
  }

  private addUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) || new Set()
    sockets.add(socketId)
    this.userSockets.set(userId, sockets)
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

  private startSessionCleanup() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => {
      const now = Date.now()
      let cleaned = 0
      
      for (const [socketId, session] of this.socketSessions.entries()) {
        const age = now - session.createdAt
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
    }, 5 * 60 * 1000)
  }

  // Public methods for server-side events
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data)
  }

  public sendToBooking(bookingId: string, event: string, data: any) {
    this.io.to(`booking:${bookingId}`).emit(event, data)
  }

  public sendToRole(role: string, event: string, data: any) {
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