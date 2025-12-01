'use client'

import { useState } from 'react'

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  UserCheck,
  Calendar,
  FileText,
  TrendingUp,
  Shield,
  X,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Leads', href: '/admin/leads', icon: UserCheck },
  { name: 'Communications', href: '/admin/communications', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Revenue', href: '/admin/revenue', icon: TrendingUp },
  { name: 'Staff', href: '/admin/staff', icon: Shield },
  { name: 'Services', href: '/admin/services', icon: Calendar },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div className="w-14 flex-shrink-0" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          className="fixed left-4 top-4 z-40 rounded-md bg-white p-2 text-gray-400 shadow-lg"
          type="button"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  )

  function SidebarContent() {
    return (
      <>
        <div className="flex h-16 shrink-0 items-center">
          <Link className="flex items-center space-x-3" href="/admin">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">RK</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul className="-mx-2 space-y-1">
                {navigation.map(item => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 transition-colors
                          ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
                          }`}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </>
    )
  }
}
