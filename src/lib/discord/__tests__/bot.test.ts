/**
 * Discord Bot Tests
 * Tests for RoKDiscordBot class
 */

// Mock logger first before any imports
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      findFirst: jest.fn()
    },
    services: {
      findMany: jest.fn()
    }
  }
}))

// Mock Discord.js - create mock functions outside
const mockSend = jest.fn()
const mockFetch = jest.fn()
const mockLogin = jest.fn()
const mockChannelCreate = jest.fn()
const mockOn = jest.fn()
const mockOnce = jest.fn()

jest.mock('discord.js', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      login: mockLogin,
      on: mockOn,
      once: mockOnce,
      channels: {
        fetch: mockFetch
      },
      guilds: {
        fetch: jest.fn().mockResolvedValue({
          channels: {
            create: mockChannelCreate,
            fetch: mockFetch
          },
          roles: {
            everyone: { id: 'everyone-role' }
          }
        })
      },
      user: { tag: 'TestBot#0001' }
    })),
    GatewayIntentBits: {
      Guilds: 1,
      GuildMessages: 2,
      MessageContent: 3,
      GuildMembers: 4
    },
    EmbedBuilder: jest.fn().mockImplementation(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setColor: jest.fn().mockReturnThis(),
      addFields: jest.fn().mockReturnThis(),
      setFooter: jest.fn().mockReturnThis(),
      setTimestamp: jest.fn().mockReturnThis()
    })),
    ChannelType: {
      GuildText: 0
    },
    PermissionFlagsBits: {
      ViewChannel: 1n,
      SendMessages: 2n,
      ReadMessageHistory: 4n
    }
  }
})

describe('RoKDiscordBot', () => {
  const originalEnv = process.env
  let RoKDiscordBot: any
  let initializeDiscordBot: any
  let getDiscordBot: any

  beforeAll(() => {
    // Import after mocks are set up
    const botModule = require('../bot')
    RoKDiscordBot = botModule.default
    initializeDiscordBot = botModule.initializeDiscordBot
    getDiscordBot = botModule.getDiscordBot
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogin.mockResolvedValue('token')
    mockFetch.mockResolvedValue({
      send: mockSend,
      isTextBased: () => true,
      id: 'channel-123'
    })
    mockSend.mockResolvedValue({ id: 'msg-123' })
    mockChannelCreate.mockResolvedValue({
      send: mockSend,
      id: 'new-channel-123'
    })

    process.env = {
      ...originalEnv,
      DISCORD_BOT_TOKEN: 'test_bot_token',
      DISCORD_GUILD_ID: 'guild-123',
      DISCORD_BOOKINGS_CHANNEL: 'channel-456',
      DISCORD_CUSTOMER_CATEGORY: 'category-789'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('constructor', () => {
    it('should create Discord client with intents', () => {
      const { Client } = require('discord.js')
      new RoKDiscordBot()

      expect(Client).toHaveBeenCalled()
    })

    it('should set up event handlers on construction', () => {
      new RoKDiscordBot()

      // Check that event handlers were registered
      expect(mockOnce).toHaveBeenCalledWith('ready', expect.any(Function))
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('initialize', () => {
    it('should login to Discord when token is provided', async () => {
      const bot = new RoKDiscordBot()
      await bot.initialize()

      expect(mockLogin).toHaveBeenCalledWith('test_bot_token')
    })

    it('should skip initialization when no token', async () => {
      delete process.env.DISCORD_BOT_TOKEN
      const bot = new RoKDiscordBot()
      await bot.initialize()

      expect(mockLogin).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('token not provided')
      )
    })

    it('should handle login error', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid token'))
      const bot = new RoKDiscordBot()
      await bot.initialize()

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('notifyNewBooking', () => {
    it('should not send when bot is not ready', async () => {
      const bot = new RoKDiscordBot()
      // Don't trigger ready event

      await bot.notifyNewBooking(createMockBooking())

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should send notification when ready', async () => {
      const bot = new RoKDiscordBot()
      await bot.initialize()

      // Trigger ready event
      const readyHandler = mockOnce.mock.calls.find((call: any[]) => call[0] === 'ready')?.[1]
      if (readyHandler) readyHandler()

      await bot.notifyNewBooking(createMockBooking())

      expect(mockFetch).toHaveBeenCalledWith('channel-456')
      expect(mockSend).toHaveBeenCalled()
    })

    it('should handle missing channel config', async () => {
      delete process.env.DISCORD_BOOKINGS_CHANNEL
      const bot = new RoKDiscordBot()
      await bot.initialize()

      const readyHandler = mockOnce.mock.calls.find((call: any[]) => call[0] === 'ready')?.[1]
      if (readyHandler) readyHandler()

      await bot.notifyNewBooking(createMockBooking())

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('not configured')
      )
    })

    it('should handle channel fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Channel not found'))
      const bot = new RoKDiscordBot()
      await bot.initialize()

      const readyHandler = mockOnce.mock.calls.find((call: any[]) => call[0] === 'ready')?.[1]
      if (readyHandler) readyHandler()

      await bot.notifyNewBooking(createMockBooking())

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('notifyPaymentCompleted', () => {
    it('should not send when bot is not ready', async () => {
      const bot = new RoKDiscordBot()

      await bot.notifyPaymentCompleted(createMockPayment())

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should send payment notification when ready', async () => {
      const bot = new RoKDiscordBot()
      await bot.initialize()

      const readyHandler = mockOnce.mock.calls.find((call: any[]) => call[0] === 'ready')?.[1]
      if (readyHandler) readyHandler()

      await bot.notifyPaymentCompleted(createMockPayment())

      expect(mockFetch).toHaveBeenCalledWith('channel-456')
      expect(mockSend).toHaveBeenCalled()
    })
  })

  describe('createCustomerChannel', () => {
    it('should not create channel when bot is not ready', async () => {
      const bot = new RoKDiscordBot()

      const result = await bot.createCustomerChannel(createMockBooking())

      expect(result).toBeNull()
    })

    it('should handle missing guild config', async () => {
      delete process.env.DISCORD_GUILD_ID
      const bot = new RoKDiscordBot()
      await bot.initialize()

      const readyHandler = mockOnce.mock.calls.find((call: any[]) => call[0] === 'ready')?.[1]
      if (readyHandler) readyHandler()

      const result = await bot.createCustomerChannel(createMockBooking())

      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('singleton functions', () => {
    it('initializeDiscordBot should create and initialize bot', async () => {
      await initializeDiscordBot()

      expect(mockLogin).toHaveBeenCalled()
    })

    it('getDiscordBot should return bot instance after initialization', async () => {
      await initializeDiscordBot()
      const bot = getDiscordBot()

      expect(bot).not.toBeNull()
    })
  })
})

// Helper to create mock booking data
function createMockBooking() {
  return {
    id: 'booking-123',
    booking_number: 'BK001',
    status: 'confirmed',
    final_amount: 500000,
    users: {
      full_name: 'Test Customer',
      email: 'test@example.com',
      discord_id: 'discord-123'
    },
    service_tiers: {
      name: 'Basic',
      services: {
        name: 'Test Service',
        slug: 'test-service'
      }
    }
  }
}

// Helper to create mock payment data
function createMockPayment() {
  return {
    id: 'payment-123',
    payment_number: 'PAY001',
    amount: 500000,
    payment_method: 'momo',
    bookings: {
      booking_number: 'BK001',
      users: {
        full_name: 'Test Customer'
      },
      service_tiers: {
        services: {
          name: 'Test Service'
        }
      }
    }
  }
}
