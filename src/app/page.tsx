import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import AutoServiceDetails from '@/components/sections/AutoServiceDetails'
import Features from '@/components/sections/Features'
import Hero from '@/components/sections/Hero'
import PaymentBadges from '@/components/sections/PaymentBadges'
import Pricing from '@/components/sections/Pricing'
import Requirements from '@/components/sections/Requirements'
import Services from '@/components/sections/Services'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AutoServiceDetails />
        <Requirements />
        <Pricing />
        <PaymentBadges />
        <Features />
        <Services />
      </main>
      <Footer />
    </>
  )
}
