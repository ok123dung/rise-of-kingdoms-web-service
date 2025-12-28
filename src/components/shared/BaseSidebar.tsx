'use client'

import { useState, type ReactNode } from 'react'

import { X, Menu, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface SidebarConfig {
  title: string
  homeHref: string
  navigation: NavItem[]
  quickLinks?: NavItem[]
  footerContent?: ReactNode
}

interface BaseSidebarProps {
  config: SidebarConfig
}

export default function BaseSidebar({ config }: BaseSidebarProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { title, homeHref, navigation, quickLinks, footerContent } = config

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
          <div className="w-14 shrink-0" />
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
          className="fixed left-4 top-4 z-50 rounded-md bg-white p-2 text-gray-400 shadow-lg"
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
          <Link className="flex items-center space-x-3" href={homeHref}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-sm font-bold text-white">RK</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{title}</span>
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

            {/* Quick links (optional) */}
            {quickLinks && quickLinks.length > 0 && (
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Liên kết nhanh</div>
                <ul className="-mx-2 mt-2 space-y-1">
                  {quickLinks.map(item => (
                    <li key={item.name}>
                      <Link
                        className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                        href={item.href}
                      >
                        <item.icon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-primary-600" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer content (optional) */}
        {footerContent && (
          <div className="border-t border-gray-200 pt-4">{footerContent}</div>
        )}
      </>
    )
  }
}
