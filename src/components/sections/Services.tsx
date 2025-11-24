'use client'

import {
  Target,
  Users,
  Sword,
  Crown,
  MessageCircle,
  BarChart3,
  Calendar,
  Headphones,
  ArrowRight,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const services: Service[] = [
  {
    id: 'kvk-consulting',
    title: 'Tư vấn KVK',
    description: 'Chuẩn bị và thực thi chiến lược KVK hiệu quả, từ di chuyển đến tác chiến liên minh.',
    icon: Sword
  },
  {
    id: 'account-optimization',
    title: 'Tối ưu tài khoản',
    description: 'Phân tích và tối ưu hóa chỉ huy, trang bị, và cây công nghệ cho mục tiêu của bạn.',
    icon: Users
  },
  {
    id: 'alliance-management',
    title: 'Quản lý liên minh',
    description: 'Hỗ trợ xây dựng cơ cấu, luật lệ và định hướng phát triển cho liên minh bền vững.',
    icon: Shield
  },
  {
    id: 'commander-training',
    title: 'Huấn luyện Commander',
    description: 'Hướng dẫn chi tiết cách build, pair và sử dụng commander trong thực chiến.',
    icon: Target
  }
]

export default function Services() {
  return (
    <section className="bg-background-dark py-12 sm:py-20">
      <div className="container-max">
        <h2 className="mb-8 px-4 text-center text-[22px] font-bold leading-tight tracking-tight text-white sm:pt-12">
          Dịch vụ nổi bật
        </h2>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          {services.map((service) => (
            <div key={service.id} className="glassmorphism flex flex-col gap-3 p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-lg bg-primary/20 p-3">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-white">{service.title}</h3>
              </div>
              <p className="text-sm font-normal leading-normal text-gray-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="h-10"></div>
      </div>
    </section>
  )
}
