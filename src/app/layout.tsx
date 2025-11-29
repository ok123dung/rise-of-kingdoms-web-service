import { Inter, Poppins } from 'next/font/google'

import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { MobileStickyActions } from '@/components/mobile/MobileOptimizations'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import Providers from '@/components/Providers'
import { RevenueValidation } from '@/components/revenue/RevenueValidation'
import { OrganizationSchema } from '@/components/seo/StructuredData'
import { ConversionTesting } from '@/components/testing/ConversionTesting'

import type { Metadata, Viewport } from 'next'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'RoK Services - Dịch vụ Rise of Kingdoms #1 Việt Nam | Premium Gaming',
  description:
    'Dịch vụ Rise of Kingdoms chuyên nghiệp: Tư vấn chiến thuật, quản lý liên minh, training commander, hỗ trợ KvK. Đội ngũ top player hàng đầu Việt Nam với 1000+ khách hàng tin tưởng.',
  keywords: [
    'Rise of Kingdoms',
    'RoK',
    'gaming services',
    'strategy game',
    'commander guide',
    'dịch vụ RoK',
    'tư vấn chiến thuật',
    'KvK support',
    'alliance management',
    'RoK Việt Nam',
    'top player RoK'
  ],
  authors: [{ name: 'RoK Services Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rokdbot.com'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RoK Services'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'RoK Services - Dịch vụ Rise of Kingdoms #1 Việt Nam',
    description:
      'Nâng tầm trải nghiệm Rise of Kingdoms với dịch vụ premium từ top player Việt Nam. Tư vấn chiến thuật, quản lý liên minh, KvK support 24/7.',
    url: '/',
    siteName: 'RoK Services',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RoK Services - Professional Gaming Services'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoK Services - Dịch vụ Rise of Kingdoms #1 Việt Nam',
    description:
      'Nâng tầm trải nghiệm Rise of Kingdoms với dịch vụ premium từ top player Việt Nam.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${poppins.variable}`} lang="vi">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <GoogleAnalytics />
        <PerformanceMonitor />
        <ConversionTesting />
        <RevenueValidation />
        <OrganizationSchema
          description="Dịch vụ Rise of Kingdoms chuyên nghiệp #1 Việt Nam"
          name="RoK Services"
          url={process.env.NEXT_PUBLIC_SITE_URL || 'https://rokdbot.com'}
        />
        <Providers>
          <ErrorBoundary>
            <div className="flex min-h-screen flex-col">
              {children}
              <MobileStickyActions />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
