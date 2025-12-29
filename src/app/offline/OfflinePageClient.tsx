'use client'

import Link from 'next/link'

export default function OfflinePageClient() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 px-4">
      <div className="w-full max-w-md text-center text-white">
        {/* Offline Icon */}
        <div className="mb-8">
          <svg
            className="mx-auto mb-4 h-24 w-24 opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold">Bạn đang offline</h1>

        {/* Description */}
        <p className="mb-8 text-lg leading-relaxed opacity-90">
          Không có kết nối internet. Một số tính năng có thể không hoạt động, nhưng bạn vẫn có thể
          xem các trang đã lưu trong bộ nhớ cache.
        </p>

        {/* Retry Button */}
        <button
          className="mb-8 rounded-lg border border-white border-opacity-30 bg-white bg-opacity-20 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:transform hover:bg-opacity-30"
          onClick={() => window.location.reload()}
        >
          <svg
            className="mr-2 inline h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Thử lại
        </button>

        {/* Available Features */}
        <div className="rounded-lg bg-white bg-opacity-10 p-6 text-left backdrop-blur-sm">
          <h3 className="mb-4 text-center font-semibold">Tính năng khả dụng offline:</h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  fillRule="evenodd"
                />
              </svg>
              <span>Xem thông tin dịch vụ</span>
            </div>

            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  fillRule="evenodd"
                />
              </svg>
              <span>Xem thông tin liên hệ</span>
            </div>

            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  fillRule="evenodd"
                />
              </svg>
              <span>Xem trang chủ</span>
            </div>

            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  fillRule="evenodd"
                />
              </svg>
              <span>Đặt dịch vụ mới</span>
            </div>

            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  fillRule="evenodd"
                />
              </svg>
              <span>Thanh toán</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link className="text-white underline transition-colors hover:text-blue-200" href="/">
            Trang chủ
          </Link>
          <Link
            className="text-white underline transition-colors hover:text-blue-200"
            href="/services"
          >
            Dịch vụ
          </Link>
          <Link className="text-white underline transition-colors hover:text-blue-200" href="/contact">
            Liên hệ
          </Link>
        </div>

        {/* Connection Status */}
        <div className="mt-8 text-sm opacity-75">
          <p>
            Tự động thử lại kết nối sau <span id="countdown">30</span> giây
          </p>
        </div>
      </div>

      {/* Auto-retry Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            let countdown = 30;
            const countdownElement = document.getElementById('countdown');
            
            const timer = setInterval(() => {
              countdown--;
              if (countdownElement) {
                countdownElement.textContent = countdown;
              }
              
              if (countdown <= 0) {
                clearInterval(timer);
                if (navigator.onLine) {
                  window.location.reload();
                } else {
                  countdown = 30; // Reset countdown
                }
              }
            }, 1000);
            
            // Listen for online event
            window.addEventListener('online', () => {
              clearInterval(timer);
              window.location.reload();
            });
          `
        }}
      />
    </div>
  )
}
