import {
  Target,
  Users,
  Sword,
  Crown,
  MessageCircle,
  BarChart3,
  Calendar,
  Headphones
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

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
}

export const SERVICES_CONFIG: ServiceConfig[] = [
  {
    id: 'strategy-consulting',
    title: 'Tư vấn chiến thuật',
    description: 'Phân tích và tối ưu chiến thuật cho từng tình huống trong game',
    price: '500.000 VNĐ/tháng',
    icon: Target,
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    category: 'strategy',
    duration: 'monthly',
    level: 'intermediate'
  },
  {
    id: 'alliance-management',
    title: 'Quản lý liên minh',
    description: 'Hỗ trợ quản lý, tuyển dụng và phát triển liên minh mạnh mẽ',
    price: '1.000.000 VNĐ/tháng',
    icon: Users,
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    featured: true,
    category: 'management',
    duration: 'monthly',
    level: 'expert'
  },
  {
    id: 'commander-training',
    title: 'Training Commander',
    description: 'Hướng dẫn build và phát triển commander hiệu quả nhất',
    price: '300.000 VNĐ/session',
    icon: Sword,
    iconBgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    category: 'training',
    duration: 'session',
    level: 'beginner'
  },
  {
    id: 'kvk-support',
    title: 'Hỗ trợ KvK',
    description: 'Chiến thuật và coordination chuyên nghiệp cho Kingdom vs Kingdom',
    price: '2.000.000 VNĐ/KvK',
    icon: Crown,
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    featured: true,
    category: 'strategy',
    duration: 'event',
    level: 'expert'
  },
  {
    id: 'personal-coaching',
    title: 'Coaching 1-on-1',
    description: 'Hướng dẫn cá nhân hóa từ chuyên gia top player hàng đầu',
    price: '200.000 VNĐ/giờ',
    icon: MessageCircle,
    iconBgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    category: 'coaching',
    duration: 'hourly',
    level: 'intermediate'
  },
  {
    id: 'account-analysis',
    title: 'Phân tích tài khoản',
    description: 'Đánh giá toàn diện và đưa ra lộ trình phát triển tài khoản',
    price: '150.000 VNĐ/lần',
    icon: BarChart3,
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
    category: 'analysis',
    duration: 'one-time',
    level: 'beginner'
  },
  {
    id: 'event-support',
    title: 'Hỗ trợ Event',
    description: 'Tối ưu hóa chiến lược cho các sự kiện đặc biệt và limited time',
    price: '400.000 VNĐ/event',
    icon: Calendar,
    iconBgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
    category: 'strategy',
    duration: 'event',
    level: 'advanced'
  },
  {
    id: 'vip-support',
    title: 'VIP Support 24/7',
    description: 'Hỗ trợ ưu tiên và tư vấn chuyên nghiệp mọi lúc mọi nơi',
    price: '3.000.000 VNĐ/tháng',
    icon: Headphones,
    iconBgColor: 'bg-accent-100',
    iconColor: 'text-accent-600',
    featured: true,
    category: 'support',
    duration: 'monthly',
    level: 'expert'
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

// Service categories
export const SERVICE_CATEGORIES = {
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
