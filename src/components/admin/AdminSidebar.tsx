'use client'

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
  Shield
} from 'lucide-react'

import BaseSidebar, { type SidebarConfig } from '@/components/shared/BaseSidebar'

const adminConfig: SidebarConfig = {
  title: 'Admin Panel',
  homeHref: '/admin',
  navigation: [
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
}

export default function AdminSidebar() {
  return <BaseSidebar config={adminConfig} />
}
