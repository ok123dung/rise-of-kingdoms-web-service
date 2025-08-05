import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline - RoK Services',
  description: 'You are currently offline. Some features may not be available.',
  robots: {
    index: false,
    follow: false
  }
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <div className="max-w-md w-full text-center text-white">
        {/* Offline Icon */}
        <div className="mb-8">
          <svg 
            className="w-24 h-24 mx-auto mb-4 opacity-80" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">
          Bạn đang offline
        </h1>

        {/* Description */}
        <p className="text-lg mb-8 opacity-90 leading-relaxed">
          Không có kết nối internet. Một số tính năng có thể không hoạt động, 
          nhưng bạn vẫn có thể xem các trang đã lưu trong bộ nhớ cache.
        </p>

        {/* Retry Button */}
        <button 
          onClick={() => window.location.reload()}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-8 rounded-lg backdrop-blur-sm border border-white border-opacity-30 transition-all duration-300 hover:transform hover:scale-105 mb-8"
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Thử lại
        </button>

        {/* Available Features */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm text-left">
          <h3 className="font-semibold mb-4 text-center">Tính năng khả dụng offline:</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Xem thông tin dịch vụ</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Xem thông tin liên hệ</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Xem trang chủ</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Đặt dịch vụ mới</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Thanh toán</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <a 
            href="/" 
            className="text-white hover:text-blue-200 underline transition-colors"
          >
            Trang chủ
          </a>
          <a 
            href="/services" 
            className="text-white hover:text-blue-200 underline transition-colors"
          >
            Dịch vụ
          </a>
          <a 
            href="/contact" 
            className="text-white hover:text-blue-200 underline transition-colors"
          >
            Liên hệ
          </a>
        </div>

        {/* Connection Status */}
        <div className="mt-8 text-sm opacity-75">
          <p>Tự động thử lại kết nối sau <span id="countdown">30</span> giây</p>
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