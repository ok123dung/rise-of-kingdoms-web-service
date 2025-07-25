'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="text-6xl font-bold text-blue-600 mb-2">404</div>
            <div className="text-2xl font-semibold text-gray-800 mb-4">
              Không tìm thấy trang
            </div>
            <p className="text-gray-600 mb-6">
              Trang bạn đang tìm kiếm có thể đã được di chuyển, xóa hoặc không tồn tại.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Go Home */}
            <Link
              href="/"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4" />
              Về trang chủ
            </Link>

            {/* Secondary Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => window.history.back()}
                className="flex-1 flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
              
              <Link
                href="/services"
                className="flex-1 flex justify-center items-center gap-2 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Search className="h-4 w-4" />
                Dịch vụ
              </Link>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Trang phổ biến:
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link 
                href="/services/strategy" 
                className="text-blue-600 hover:text-blue-500"
              >
                Tư vấn chiến thuật
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/services" 
                className="text-blue-600 hover:text-blue-500"
              >
                Tất cả dịch vụ
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/contact" 
                className="text-blue-600 hover:text-blue-500"
              >
                Liên hệ
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Cần hỗ trợ?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a 
                href="mailto:support@rokdbot.com" 
                className="text-blue-600 hover:text-blue-500 flex items-center gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                Email hỗ trợ
              </a>
              <span className="text-gray-300">|</span>
              <Link 
                href="/help" 
                className="text-blue-600 hover:text-blue-500"
              >
                Trung tâm hỗ trợ
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Nếu bạn tin rằng đây là lỗi, vui lòng liên hệ với chúng tôi
          </p>
        </div>
      </div>
    </div>
  )
}