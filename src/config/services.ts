import { Bot, Sword } from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export interface ServiceTier {
  name: string
  price: number
  priceUsd: number
  duration: string
  note?: string
}

export interface ServiceConfig {
  id: string
  title: string
  description: string
  price: string
  icon: LucideIcon
  iconBgColor: string
  iconColor: string
  featured?: boolean
  category?: string
  duration?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  tiers?: ServiceTier[]
  requirement?: string
}

export const SERVICES_CONFIG: ServiceConfig[] = [
  {
    id: 'auto-gem-farm',
    title: 'Auto Gem & Farm RoK',
    description: 'Bot tự động farm tài nguyên, gem và hoàn thành nhiệm vụ hàng ngày 24/7',
    price: 'Từ 150.000 VNĐ',
    icon: Bot,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    featured: true,
    category: 'automation',
    duration: 'weekly',
    level: 'beginner',
    tiers: [
      {
        name: 'Gói Tuần (Dùng thử)',
        price: 150000,
        priceUsd: 5.99,
        duration: '1 tuần',
        note: 'Chỉ áp dụng cho tuần đầu tiên khi mới sử dụng dịch vụ'
      },
      {
        name: 'Gói V1',
        price: 750000,
        priceUsd: 29.99,
        duration: '1 tháng'
      },
      {
        name: 'Gói V2',
        price: 900000,
        priceUsd: 35.99,
        duration: '1 tháng'
      },
      {
        name: 'Gói KvK',
        price: 7000000,
        priceUsd: 279.99,
        duration: 'Trọn KvK'
      }
    ]
  },
  {
    id: 'spam-barbarian',
    title: 'Spam & Kéo Man Rợ',
    description: 'Dịch vụ spam man rợ chuyên nghiệp, tối ưu exp và tài nguyên',
    price: '900.000 VNĐ/tháng',
    icon: Sword,
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    featured: true,
    category: 'automation',
    duration: 'monthly',
    level: 'intermediate',
    requirement: 'Account trước Pre-KvK 1',
    tiers: [
      {
        name: 'Gói Tháng',
        price: 900000,
        priceUsd: 35.99,
        duration: '1 tháng'
      }
    ]
  }
]

// Service utility functions
export const getFeaturedServices = (): ServiceConfig[] => {
  return SERVICES_CONFIG.filter(service => service.featured)
}

export const getServicesByCategory = (category: string): ServiceConfig[] => {
  return SERVICES_CONFIG.filter(service => service.category === category)
}

export const getServiceById = (id: string): ServiceConfig | undefined => {
  return SERVICES_CONFIG.find(service => service.id === id)
}

export const getServicesByLevel = (level: ServiceConfig['level']): ServiceConfig[] => {
  return SERVICES_CONFIG.filter(service => service.level === level)
}

// Format price helper
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ'
}

// Service categories
export const SERVICE_CATEGORIES = {
  automation: 'Tự động hóa',
  strategy: 'Chiến thuật',
  management: 'Quản lý',
  training: 'Huấn luyện',
  coaching: 'Coaching',
  analysis: 'Phân tích',
  support: 'Hỗ trợ'
} as const

// Service levels
export const SERVICE_LEVELS = {
  beginner: 'Người mới',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  expert: 'Chuyên gia'
} as const

export type ServiceCategory = keyof typeof SERVICE_CATEGORIES
export type ServiceLevel = keyof typeof SERVICE_LEVELS
