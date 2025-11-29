import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  type TextChannel,
  ChannelType,
  PermissionFlagsBits,
  type ChatInputCommandInteraction
} from 'discord.js'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import type { BookingWithRelations, PaymentWithRelations } from '@/types/prisma'

class RoKDiscordBot {
  private client: Client
  private isReady = false

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.client.once('ready', async () => {
      const { getLogger } = await import('@/lib/monitoring/logger')
      getLogger().info('Discord bot logged in', { tag: this.client.user?.tag })
      this.isReady = true
    })

    this.client.on('error', error => {
      getLogger().error(
        'Discord bot error',
        error instanceof Error ? error : new Error(String(error))
      )
    })

    // Handle slash commands
    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return

      try {
        await this.handleSlashCommand(interaction)
      } catch (error) {
        getLogger().error(
          'Slash command error',
          error instanceof Error ? error : new Error(String(error))
        )
        await interaction.reply({
          content: 'Có lỗi xảy ra khi xử lý lệnh.',
          ephemeral: true
        })
      }
    })
  }

  async initialize() {
    if (!process.env.DISCORD_BOT_TOKEN) {
      getLogger().warn('Discord bot token not provided, skipping bot initialization')
      return
    }

    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN)
    } catch (error) {
      getLogger().error(
        'Failed to initialize Discord bot',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  private async handleSlashCommand(interaction: ChatInputCommandInteraction) {
    const { commandName } = interaction

    switch (commandName) {
      case 'booking-status':
        await this.handleBookingStatus(interaction)
        break
      case 'services':
        await this.handleServices(interaction)
        break
      case 'support':
        await this.handleSupport(interaction)
        break
      default:
        await interaction.reply({
          content: 'Lệnh không được hỗ trợ.',
          ephemeral: true
        })
    }
  }

  private async handleBookingStatus(interaction: ChatInputCommandInteraction) {
    const email = interaction.options.getString('email')

    try {
      const user = await prisma.user.findUnique({ where: { email: email! } })
      if (!user) {
        await interaction.reply({
          content: 'Không tìm thấy tài khoản với email này.',
          ephemeral: true
        })
        return
      }

      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          serviceTier: {
            include: {
              service: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (bookings.length === 0) {
        await interaction.reply({
          content: 'Bạn chưa có booking nào.',
          ephemeral: true
        })
        return
      }

      const embed = new EmbedBuilder()
        .setTitle('📋 Trạng thái Booking')
        .setColor(0x0099ff)
        .setDescription(`Tìm thấy ${bookings.length} booking(s)`)

      bookings.slice(0, 5).forEach((booking, index) => {
        const statusEmoji = this.getStatusEmoji(booking.status)
        const paymentEmoji = this.getPaymentStatusEmoji(booking.paymentStatus)

        embed.addFields({
          name: `${index + 1}. ${booking.serviceTier.service.name}`,
          value: `${statusEmoji} Trạng thái: ${booking.status}\n${paymentEmoji} Thanh toán: ${booking.paymentStatus}\nSố tiền: ${booking.finalAmount.toLocaleString()} VNĐ\nMã booking: ${booking.bookingNumber}`,
          inline: true
        })
      })

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } catch (error) {
      getLogger().error(
        'Booking status error',
        error instanceof Error ? error : new Error(String(error))
      )
      await interaction.reply({
        content: 'Có lỗi xảy ra khi kiểm tra trạng thái booking.',
        ephemeral: true
      })
    }
  }

  private async handleServices(interaction: ChatInputCommandInteraction) {
    try {
      const services = await prisma.service.findMany({
        where: { isActive: true },
        include: {
          serviceTiers: {
            where: { isAvailable: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { sortOrder: 'asc' }
      })

      const embed = new EmbedBuilder()
        .setTitle('🎮 Dịch vụ Rise of Kingdoms')
        .setColor(0x00ff00)
        .setDescription('Danh sách các dịch vụ hiện có:')
        .setURL(`${process.env.NEXT_PUBLIC_SITE_URL}/services`)

      services.slice(0, 10).forEach(service => {
        const minPrice = Math.min(...service.serviceTiers.map(tier => Number(tier.price)))
        const maxPrice = Math.max(...service.serviceTiers.map(tier => Number(tier.price)))

        embed.addFields({
          name: service.name,
          value: `${service.shortDescription || service.description?.substring(0, 100) || 'Không có mô tả'}\n💰 Giá: ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()} VNĐ`,
          inline: false
        })
      })

      embed.setFooter({
        text: 'Truy cập website để đặt dịch vụ'
      })

      await interaction.reply({ embeds: [embed] })
    } catch (error) {
      getLogger().error(
        'Services command error',
        error instanceof Error ? error : new Error(String(error))
      )
      await interaction.reply({
        content: 'Có lỗi xảy ra khi lấy danh sách dịch vụ.',
        ephemeral: true
      })
    }
  }

  private async handleSupport(interaction: ChatInputCommandInteraction) {
    const issue = interaction.options.getString('issue')

    try {
      // Create support ticket
      const supportEmbed = new EmbedBuilder()
        .setTitle('🎫 Yêu cầu hỗ trợ mới')
        .setColor(0xff9900)
        .addFields(
          {
            name: 'Người yêu cầu',
            value: `${interaction.user.tag} (${interaction.user.id})`,
            inline: true
          },
          { name: 'Thời gian', value: new Date().toLocaleString('vi-VN'), inline: true },
          { name: 'Vấn đề', value: issue || 'Không có mô tả', inline: false }
        )
        .setTimestamp()

      // Send to support channel
      const supportChannelId = process.env.DISCORD_SUPPORT_CHANNEL
      if (!supportChannelId) {
        getLogger().error('DISCORD_SUPPORT_CHANNEL not configured')
        await interaction.reply({
          content: 'Kênh hỗ trợ chưa được cấu hình.',
          ephemeral: true
        })
        return
      }
      const supportChannel = (await this.client.channels.fetch(supportChannelId)) as TextChannel
      if (supportChannel) {
        await supportChannel.send({ embeds: [supportEmbed] })
      }

      await interaction.reply({
        content: '✅ Yêu cầu hỗ trợ đã được gửi. Team sẽ phản hồi sớm nhất có thể.',
        ephemeral: true
      })
    } catch (error) {
      getLogger().error(
        'Support command error',
        error instanceof Error ? error : new Error(String(error))
      )
      await interaction.reply({
        content: 'Có lỗi xảy ra khi gửi yêu cầu hỗ trợ.',
        ephemeral: true
      })
    }
  }

  // Public methods for external use
  async notifyNewBooking(booking: BookingWithRelations) {
    if (!this.isReady) return

    try {
      const embed = new EmbedBuilder()
        .setTitle('🎉 Booking mới!')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Khách hàng', value: booking.user.fullName, inline: true },
          { name: 'Email', value: booking.user.email, inline: true },
          {
            name: 'Dịch vụ',
            value: `${booking.serviceTier.service.name} - ${booking.serviceTier.name}`,
            inline: false
          },
          { name: 'Số tiền', value: `${booking.finalAmount.toLocaleString()} VNĐ`, inline: true },
          { name: 'Mã booking', value: booking.bookingNumber, inline: true },
          { name: 'Trạng thái', value: booking.status, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'RoK Services - Booking System' })

      const bookingsChannelId = process.env.DISCORD_BOOKINGS_CHANNEL
      if (!bookingsChannelId) {
        getLogger().error('DISCORD_BOOKINGS_CHANNEL not configured')
        return
      }
      const channel = (await this.client.channels.fetch(bookingsChannelId)) as TextChannel
      if (channel) {
        await channel.send({ embeds: [embed] })
      }
    } catch (error) {
      getLogger().error(
        'Failed to send booking notification',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  async notifyPaymentCompleted(payment: PaymentWithRelations) {
    if (!this.isReady) return

    try {
      const embed = new EmbedBuilder()
        .setTitle('💰 Thanh toán thành công!')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Khách hàng', value: payment.booking.user.fullName, inline: true },
          { name: 'Số tiền', value: `${payment.amount.toLocaleString()} VNĐ`, inline: true },
          { name: 'Phương thức', value: payment.paymentMethod.toUpperCase(), inline: true },
          { name: 'Mã thanh toán', value: payment.paymentNumber, inline: true },
          { name: 'Mã booking', value: payment.booking.bookingNumber, inline: true },
          { name: 'Dịch vụ', value: payment.booking.serviceTier.service.name, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'RoK Services - Payment System' })

      const bookingsChannelId = process.env.DISCORD_BOOKINGS_CHANNEL
      if (!bookingsChannelId) {
        getLogger().error('DISCORD_BOOKINGS_CHANNEL not configured')
        return
      }
      const channel = (await this.client.channels.fetch(bookingsChannelId)) as TextChannel
      if (channel) {
        await channel.send({ embeds: [embed] })
      }
    } catch (error) {
      getLogger().error(
        'Failed to send payment notification',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  async createCustomerChannel(booking: BookingWithRelations) {
    if (!this.isReady) return null

    try {
      const guildId = process.env.DISCORD_GUILD_ID
      const categoryId = process.env.DISCORD_CUSTOMER_CATEGORY

      if (!guildId || !categoryId) {
        getLogger().error('DISCORD_GUILD_ID or DISCORD_CUSTOMER_CATEGORY not configured')
        return null
      }

      const guild = await this.client.guilds.fetch(guildId)
      const category = await guild.channels.fetch(categoryId)

      const channelName = `${booking.user.fullName.toLowerCase().replace(/\s+/g, '-')}-${booking.serviceTier.service.slug}`

      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category?.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          ...(booking.user.discordId
            ? [
              {
                id: booking.user.discordId,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.ReadMessageHistory
                ]
              }
            ]
            : [])
        ]
      })

      // Send welcome message
      const welcomeEmbed = new EmbedBuilder()
        .setTitle('🎮 Chào mừng đến với kênh hỗ trợ!')
        .setColor(0x0099ff)
        .setDescription(
          `Xin chào ${booking.user.fullName}! Đây là kênh riêng cho dịch vụ **${booking.serviceTier.service.name}** của bạn.`
        )
        .addFields(
          { name: 'Mã booking', value: booking.bookingNumber, inline: true },
          {
            name: 'Dịch vụ',
            value: `${booking.serviceTier.service.name} - ${booking.serviceTier.name}`,
            inline: true
          },
          { name: 'Trạng thái', value: booking.status, inline: true }
        )
        .setFooter({ text: 'Team sẽ liên hệ với bạn sớm nhất có thể!' })

      await channel.send({ embeds: [welcomeEmbed] })

      return channel
    } catch (error) {
      getLogger().error(
        'Failed to create customer channel',
        error instanceof Error ? error : new Error(String(error))
      )
      return null
    }
  }

  private getStatusEmoji(status: string): string {
    const statusEmojis: { [key: string]: string } = {
      pending: '⏳',
      confirmed: '✅',
      in_progress: '🔄',
      completed: '🎉',
      cancelled: '❌',
      refunded: '💸'
    }
    return statusEmojis[status] || '❓'
  }

  private getPaymentStatusEmoji(status: string): string {
    const paymentEmojis: { [key: string]: string } = {
      pending: '⏳',
      completed: '✅',
      failed: '❌',
      refunded: '💸'
    }
    return paymentEmojis[status] || '❓'
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy()
    }
  }
}

// Singleton instance
let botInstance: RoKDiscordBot | null = null

export function getDiscordBot(): RoKDiscordBot {
  if (!botInstance) {
    botInstance = new RoKDiscordBot()
  }
  return botInstance
}

export async function initializeDiscordBot() {
  const bot = getDiscordBot()
  await bot.initialize()
  return bot
}

export default RoKDiscordBot
