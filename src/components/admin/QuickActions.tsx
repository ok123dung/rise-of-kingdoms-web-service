'use client'

import Link from 'next/link'
import { 
  Plus, 
  UserPlus, 
  MessageSquare, 
  FileText, 
  Download,
  RefreshCw,
  Send,
  Calendar
} from 'lucide-react'

const quickActions = [
  {
    name: 'Tạo booking mới',
    description: 'Tạo booking cho khách hàng',
    href: '/admin/bookings/new',
    icon: Plus,
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    name: 'Thêm khách hàng',
    description: 'Đăng ký khách hàng mới',
    href: '/admin/customers/new',
    icon: UserPlus,
    color: 'bg-green-600 hover:bg-green-700'
  },
  {
    name: 'Gửi thông báo',
    description: 'Gửi email/Discord tới khách hàng',
    href: '/admin/communications/new',
    icon: Send,
    color: 'bg-purple-600 hover:bg-purple-700'
  },
  {
    name: 'Xem leads mới',
    description: 'Kiểm tra leads chưa xử lý',
    href: '/admin/leads?status=new',
    icon: MessageSquare,
    color: 'bg-orange-600 hover:bg-orange-700'
  },
  {
    name: 'Báo cáo doanh thu',
    description: 'Xuất báo cáo tài chính',
    href: '/admin/reports/revenue',
    icon: FileText,
    color: 'bg-indigo-600 hover:bg-indigo-700'
  },
  {
    name: 'Lịch dịch vụ',
    description: 'Xem lịch trình dịch vụ',
    href: '/admin/schedule',
    icon: Calendar,
    color: 'bg-pink-600 hover:bg-pink-700'
  }
]

export default function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="group relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ring-4 ring-white ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
