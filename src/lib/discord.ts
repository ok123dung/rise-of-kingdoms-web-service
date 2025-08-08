import { getLogger } from '@/lib/monitoring/logger'

interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
}

interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: DiscordEmbedField[]
  footer?: {
    text: string
    icon_url?: string
  }
  timestamp?: string
}

interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

interface PaymentNotificationData {
  bookingId: string
  amount: number
  paymentMethod: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  customerEmail?: string
  customerName?: string
  transactionId?: string
  error?: string
}

interface LeadNotificationData {
  leadId: string
  fullName?: string | null
  email?: string | null
  phone?: string | null
  serviceInterest?: string | null
  source?: string | null
  leadScore: number
}

class DiscordNotifier {
  private webhookUrl: string | undefined

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL
  }

  async sendPaymentNotification(data: PaymentNotificationData): Promise<void> {
    if (!this.webhookUrl) {
      getLogger().warn('Discord webhook URL not configured, skipping notification')
      return
    }

    try {
      const embed = this.createPaymentEmbed(data)
      const payload: DiscordWebhookPayload = {
        username: 'RoK Services Payment Bot',
        avatar_url: 'https://cdn.discordapp.com/attachments/your-avatar-url.png',
        embeds: [embed]
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`)
      }

      getLogger().debug('Discord notification sent', { bookingId: data.bookingId })
    } catch (error) {
      getLogger().error('Failed to send Discord notification', { error })
      // Don't throw - notification failures shouldn't break payment flow
    }
  }

  private createPaymentEmbed(data: PaymentNotificationData): DiscordEmbed {
    const statusColors = {
      pending: 0xFFA500,    // Orange
      completed: 0x00FF00,  // Green
      failed: 0xFF0000,     // Red
      cancelled: 0x808080   // Gray
    }

    const statusEmojis = {
      pending: '⏳',
      completed: '✅',
      failed: '❌',
      cancelled: '⛔'
    }

    const embed: DiscordEmbed = {
      title: `${statusEmojis[data.status]} Thanh toán ${this.getStatusText(data.status)}`,
      color: statusColors[data.status],
      fields: [
        {
          name: '📋 Booking ID',
          value: data.bookingId,
          inline: true
        },
        {
          name: '💰 Số tiền',
          value: `${data.amount.toLocaleString('vi-VN')} VNĐ`,
          inline: true
        },
        {
          name: '💳 Phương thức',
          value: data.paymentMethod.toUpperCase(),
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'RoK Services Payment System'
      }
    }

    // Add customer info if available
    if (data.customerName || data.customerEmail) {
      embed.fields?.push({
        name: '👤 Khách hàng',
        value: `${data.customerName || 'N/A'}\n${data.customerEmail || 'N/A'}`,
        inline: false
      })
    }

    // Add transaction ID if available
    if (data.transactionId) {
      embed.fields?.push({
        name: '🔗 Transaction ID',
        value: data.transactionId,
        inline: false
      })
    }

    // Add error info for failed payments
    if (data.status === 'failed' && data.error) {
      embed.fields?.push({
        name: '⚠️ Lỗi',
        value: data.error,
        inline: false
      })
    }

    return embed
  }

  private getStatusText(status: PaymentNotificationData['status']): string {
    const statusTexts = {
      pending: 'đang xử lý',
      completed: 'thành công',
      failed: 'thất bại',
      cancelled: 'đã hủy'
    }
    return statusTexts[status]
  }

  async sendLeadNotification(data: LeadNotificationData): Promise<void> {
    if (!this.webhookUrl) {
      getLogger().warn('Discord webhook URL not configured, skipping notification')
      return
    }

    try {
      const embed: DiscordEmbed = {
        title: '🎯 Lead mới!',
        description: `Có khách hàng tiềm năng mới quan tâm đến dịch vụ`,
        color: 0x00D166, // Green
        fields: [
          {
            name: '👤 Họ tên',
            value: data.fullName || 'Không có',
            inline: true
          },
          {
            name: '📧 Email',
            value: data.email || 'Không có',
            inline: true
          },
          {
            name: '📱 Điện thoại',
            value: data.phone || 'Không có',
            inline: true
          },
          {
            name: '🎮 Dịch vụ quan tâm',
            value: data.serviceInterest || 'Chung',
            inline: true
          },
          {
            name: '📍 Nguồn',
            value: data.source || 'Website',
            inline: true
          },
          {
            name: '⭐ Lead Score',
            value: data.leadScore.toString(),
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'RoK Services Lead System'
        }
      }

      const payload: DiscordWebhookPayload = {
        username: 'RoK Services Lead Bot',
        embeds: [embed]
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`)
      }

      getLogger().debug('Discord lead notification sent', { contact: data.email || data.phone || 'Unknown' })
    } catch (error) {
      getLogger().error('Failed to send Discord lead notification', { error })
    }
  }

  async sendSystemAlert(title: string, message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (!this.webhookUrl) {
      getLogger().warn('Discord webhook URL not configured, skipping alert')
      return
    }

    try {
      const colors = {
        info: 0x3498DB,     // Blue
        warning: 0xF39C12,  // Orange
        error: 0xE74C3C     // Red
      }

      const emojis = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🚨'
      }

      const embed: DiscordEmbed = {
        title: `${emojis[level]} ${title}`,
        description: message,
        color: colors[level],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'RoK Services System'
        }
      }

      const payload: DiscordWebhookPayload = {
        username: 'RoK Services System Bot',
        embeds: [embed]
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`)
      }

      getLogger().debug('Discord system alert sent', { title })
    } catch (error) {
      getLogger().error('Failed to send Discord system alert', { error })
    }
  }
}

// Export singleton instance
export const discordNotifier = new DiscordNotifier()

// Export types for use in other modules
export type { PaymentNotificationData, LeadNotificationData, DiscordEmbed, DiscordEmbedField }