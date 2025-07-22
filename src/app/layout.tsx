import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { MobileStickyActions } from '@/components/mobile/MobileOptimizations'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import { ConversionTesting } from '@/components/testing/ConversionTesting'
import { RevenueValidation } from '@/components/revenue/RevenueValidation'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Rise of Kingdoms Services - Dịch vụ chuyên nghiệp cho RoK',
  description: 'Website cung cấp các dịch vụ chuyên nghiệp cho game Rise of Kingdoms: tư vấn chiến thuật, quản lý liên minh, training commander và nhiều hơn nữa.',
  keywords: ['Rise of Kingdoms', 'RoK', 'gaming services', 'strategy game', 'commander guide', 'dịch vụ RoK', 'tư vấn chiến thuật'],
  authors: [{ name: 'RoK Services Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Rise of Kingdoms Services - Dịch vụ chuyên nghiệp cho RoK',
    description: 'Nâng tầm trải nghiệm Rise of Kingdoms với dịch vụ tư vấn chiến thuật, quản lý liên minh từ chuyên gia hàng đầu Việt Nam.',
    url: '/',
    siteName: 'RoK Services',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rise of Kingdoms Services - Dịch vụ chuyên nghiệp cho RoK',
    description: 'Nâng tầm trải nghiệm Rise of Kingdoms với dịch vụ tư vấn chiến thuật, quản lý liên minh từ chuyên gia hàng đầu Việt Nam.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <GoogleAnalytics />
        <PerformanceMonitor />
        <ConversionTesting />
        <RevenueValidation />
        <div className="min-h-screen flex flex-col">
          {children}
          <MobileStickyActions />
        </div>
      </body>
    </html>
  )
}
