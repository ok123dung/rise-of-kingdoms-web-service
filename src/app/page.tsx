import nextDynamic from 'next/dynamic'
import { Suspense } from 'react'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'

// Dynamic imports for below-the-fold sections - reduces initial JS bundle by ~135KB
// These components hydrate lazily, improving LCP by prioritizing hero render
const AutoServiceDetails = nextDynamic(() => import('@/components/sections/AutoServiceDetails'), {
  loading: () => <SectionSkeleton height="400px" />
})
const Requirements = nextDynamic(() => import('@/components/sections/Requirements'), {
  loading: () => <SectionSkeleton height="300px" />
})
const Pricing = nextDynamic(() => import('@/components/sections/Pricing'), {
  loading: () => <SectionSkeleton height="600px" />
})
const PaymentBadges = nextDynamic(() => import('@/components/sections/PaymentBadges'), {
  loading: () => <SectionSkeleton height="200px" />
})
const Features = nextDynamic(() => import('@/components/sections/Features'), {
  loading: () => <SectionSkeleton height="400px" />
})
const Services = nextDynamic(() => import('@/components/sections/Services'), {
  loading: () => <SectionSkeleton height="500px" />
})

// Minimal skeleton for loading states - prevents layout shift
function SectionSkeleton({ height }: { height: string }) {
  return (
    <div
      className="w-full animate-pulse bg-gray-100"
      style={{ height, minHeight: height }}
      aria-hidden="true"
    />
  )
}

// Force static generation for optimal LCP - page is pre-rendered at build time
export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionSkeleton height="400px" />}>
          <AutoServiceDetails />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="300px" />}>
          <Requirements />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="600px" />}>
          <Pricing />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="200px" />}>
          <PaymentBadges />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="400px" />}>
          <Features />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="500px" />}>
          <Services />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
