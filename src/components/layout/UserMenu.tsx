'use client'

import { Fragment } from 'react'

import { Menu, Transition } from '@headlessui/react'
import { User, LogOut, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

import { useLanguage } from '@/contexts/LanguageContext'

export default function UserMenu() {
  const { data: session } = useSession()
  const { t } = useLanguage()

  if (!session) {
    return (
      <Link
        className="rounded-xl px-4 py-2 text-sm font-semibold leading-6 text-slate-700 transition-colors duration-200 hover:bg-white/50 hover:text-amber-600"
        href="/auth/signin"
      >
        {t.common.login}
      </Link>
    )
  }

  return (
    <Menu as="div" className="relative ml-3" data-testid="user-menu">
      <div>
        <Menu.Button className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            {session.user?.image ? (
              <img alt="" className="h-8 w-8 rounded-full object-cover" src={session.user.image} />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <span className="user-name hidden font-medium text-slate-700 md:block">
            {session.user?.name ?? 'User'}
          </span>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <Link
                href="/dashboard"
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }: { active: boolean }) => (
              <button
                data-testid="logout-btn"
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
