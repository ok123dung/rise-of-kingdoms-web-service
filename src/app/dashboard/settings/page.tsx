'use client'

import { useState } from 'react'

import { ShieldCheckIcon, KeyIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  useSession()
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-500">Quản lý cài đặt tài khoản và tùy chọn cá nhân</p>
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Thông báo</h3>
                <p className="mt-1 text-sm text-gray-500">Chọn cách bạn muốn nhận thông báo</p>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        checked={notifications.email}
                        className="text-rok-gold focus:ring-rok-gold h-4 w-4 rounded border-gray-300"
                        id="email-notifications"
                        type="checkbox"
                        onChange={e =>
                          setNotifications({ ...notifications, email: e.target.checked })
                        }
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700" htmlFor="email-notifications">
                        Thông báo qua Email
                      </label>
                      <p className="text-gray-500">
                        Nhận thông báo về đơn hàng và cập nhật dịch vụ qua email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        checked={notifications.sms}
                        className="text-rok-gold focus:ring-rok-gold h-4 w-4 rounded border-gray-300"
                        id="sms-notifications"
                        type="checkbox"
                        onChange={e =>
                          setNotifications({ ...notifications, sms: e.target.checked })
                        }
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700" htmlFor="sms-notifications">
                        Thông báo qua SMS
                      </label>
                      <p className="text-gray-500">Nhận tin nhắn SMS cho các cập nhật quan trọng</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        checked={notifications.push}
                        className="text-rok-gold focus:ring-rok-gold h-4 w-4 rounded border-gray-300"
                        id="push-notifications"
                        type="checkbox"
                        onChange={e =>
                          setNotifications({ ...notifications, push: e.target.checked })
                        }
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label className="font-medium text-gray-700" htmlFor="push-notifications">
                        Thông báo đẩy
                      </label>
                      <p className="text-gray-500">Nhận thông báo trực tiếp trên trình duyệt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Ngôn ngữ & Khu vực</h3>
                <p className="mt-1 text-sm text-gray-500">Cài đặt ngôn ngữ và múi giờ</p>
              </div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="language">
                      Ngôn ngữ
                    </label>
                    <select
                      className="focus:border-rok-gold focus:ring-rok-gold mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm"
                      id="language"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="timezone">
                      Múi giờ
                    </label>
                    <select
                      className="focus:border-rok-gold focus:ring-rok-gold mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm"
                      id="timezone"
                    >
                      <option value="Asia/Ho_Chi_Minh">GMT+7 (Hồ Chí Minh)</option>
                      <option value="Asia/Bangkok">GMT+7 (Bangkok)</option>
                      <option value="Asia/Singapore">GMT+8 (Singapore)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Bảo mật</h3>
            <div className="space-y-4">
              <button className="flex w-full items-center justify-between rounded-md border border-gray-300 px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <KeyIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Đổi mật khẩu</p>
                    <p className="text-sm text-gray-500">Cập nhật mật khẩu tài khoản</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button className="flex w-full items-center justify-between rounded-md border border-gray-300 px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Xác thực 2 yếu tố</p>
                    <p className="text-sm text-gray-500">Tăng cường bảo mật cho tài khoản</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">Đã bật</span>
              </button>

              <button className="flex w-full items-center justify-between rounded-md border border-gray-300 px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center">
                  <DevicePhoneMobileIcon className="mr-3 h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Thiết bị đã đăng nhập</p>
                    <p className="text-sm text-gray-500">Quản lý các thiết bị truy cập tài khoản</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Vùng nguy hiểm</h3>
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Xóa tài khoản</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Một khi bạn xóa tài khoản, tất cả dữ liệu sẽ bị xóa vĩnh viễn.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-red-700"
                      type="button"
                    >
                      Xóa tài khoản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
