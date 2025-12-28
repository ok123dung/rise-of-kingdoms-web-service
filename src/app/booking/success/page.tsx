import { CheckCircle, Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

export default function BookingSuccessPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[80vh] items-center justify-center bg-gray-50">
        <div className="container-max px-4">
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-green-100 p-6 ring-8 ring-green-50">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900">Đặt lịch thành công!</h1>
            <p className="mb-8 text-lg text-gray-600">
              Cảm ơn bạn đã tin tưởng RoK Services. Yêu cầu của bạn đã được ghi nhận. Chúng tôi sẽ
              liên hệ lại trong thời gian sớm nhất.
            </p>

            <div className="card mb-8 bg-white p-6 text-left shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Bước tiếp theo:</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                    1
                  </span>
                  <span>Kiểm tra email xác nhận (có thể trong mục Spam)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                    2
                  </span>
                  <span>Chuẩn bị sẵn thông tin tài khoản/câu hỏi cần tư vấn</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                    3
                  </span>
                  <span>Tham gia Discord để được hỗ trợ nhanh nhất</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                className="btn-secondary flex items-center justify-center space-x-2 px-6 py-3"
                href="/"
              >
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Link>
              <Link
                className="btn-primary flex items-center justify-center space-x-2 px-6 py-3"
                href="https://discord.gg/UPuFYCw4JG"
                target="_blank"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Tham gia Discord</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
